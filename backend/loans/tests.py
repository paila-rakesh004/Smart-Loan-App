from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from loans.models import LoanApplication
from users.models import UserFinancialData

User = get_user_model()


class LoanViewsTest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123",
            age=31,
        )
        self.officer = User.objects.create_user(
            username="officer",
            email="officer@test.com",
            password="password123",
            is_officer=True,
        )
        self.financials = UserFinancialData.objects.create(
            username=self.user.username,
            years_as_customer=4,
            total_transaction_amount=300000,
            total_loan_amount=80000,
            tenure_months=24,
            income=720000,
            pending_loan=15000,
            fixed_deposits=50000,
            credit_score=735,
        )

        self.client.force_authenticate(user=self.user)

    def create_loan(self, **overrides):
        data = {
            "user": self.user,
            "occupation": "Engineer",
            "organization_name": "Acme Corp",
            "loan_amount": 50000,
            "tenure": 12,
            "loan_type": "Personal",
            "monthly_income": 20000,
        }
        data.update(overrides)
        return LoanApplication.objects.create(**data)

    def test_apply_loan_success(self):
        data = {
            "loan_amount": 50000,
            "tenure": 12,
            "loan_type": "Personal",
            "monthly_income": 20000,
            "occupation": "Engineer",
            "organization_name": "Acme Corp",
            "age": 32,
            "ai_statuses": '{"salary_slip": {"decision": "AUTO_APPROVE"}}',
        }

        response = self.client.post("/api/loans/apply/", data)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(LoanApplication.objects.count(), 1)
        self.user.refresh_from_db()
        loan = LoanApplication.objects.first()
        self.assertEqual(self.user.age, 32)
        self.assertTrue(response.data["vault_updated"])
        self.assertEqual(loan.ai_verification_data["salary_slip"]["decision"], "AUTO_APPROVE")

    def test_apply_loan_handles_invalid_json_statuses(self):
        response = self.client.post(
            "/api/loans/apply/",
            {
                "loan_amount": 25000,
                "tenure": 10,
                "loan_type": "Gold",
                "monthly_income": 15000,
                "occupation": "Designer",
                "organization_name": "Studio",
                "ai_statuses": "not-json",
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(LoanApplication.objects.first().ai_verification_data, {})

    def test_my_loans(self):
        self.create_loan()

        response = self.client.get("/api/loans/my-loans/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["actual_cibil"], "735")
        self.assertEqual(response.data[0]["applicant_age"], 31)

    def test_customer_stats(self):
        self.create_loan(status="Eligible")
        self.create_loan(status="Not Eligible")

        response = self.client.get("/api/loans/customer/stats/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_applied"], 2)
        self.assertEqual(response.data["total_approved"], 1)
        self.assertEqual(response.data["total_rejected"], 1)

    def test_customer_cannot_access_officer_loans(self):
        response = self.client.get("/api/loans/officer/all-loans/")

        self.assertEqual(response.status_code, 403)

    def test_officer_can_list_all_loans_with_applicant_name(self):
        self.create_loan(loan_type="Home")
        self.client.force_authenticate(user=self.officer)

        response = self.client.get("/api/loans/officer/all-loans/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["applicant_name"], "testuser")
        self.assertEqual(response.data[0]["loan_type"], "Home")

    def test_officer_can_update_loan_status(self):
        loan = self.create_loan()
        self.client.force_authenticate(user=self.officer)

        response = self.client.patch(
            f"/api/loans/officer/{loan.id}/update-status/",
            {"status": "Eligible", "officer_notes": "Looks good", "risk_score": "Low"},
        )

        self.assertEqual(response.status_code, 200)
        loan.refresh_from_db()
        self.assertEqual(loan.status, "Eligible")
        self.assertEqual(loan.officer_notes, "Looks good")
        self.assertEqual(loan.risk_score, "Low")

    def test_officer_update_loan_returns_404_for_missing_loan(self):
        self.client.force_authenticate(user=self.officer)

        response = self.client.patch("/api/loans/officer/999/update-status/", {"status": "Eligible"})

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Loan not found")

    def test_officer_stats_counts_loan_types_and_statuses(self):
        self.create_loan(loan_type="Gold", status="Pending")
        self.create_loan(loan_type="Home", status="Eligible")
        self.create_loan(loan_type="Education", status="Not Eligible")
        self.client.force_authenticate(user=self.officer)

        response = self.client.get("/api/loans/officer/stats/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["gold"], 1)
        self.assertEqual(response.data["home"], 1)
        self.assertEqual(response.data["education"], 1)
        self.assertEqual(response.data["pending"], 1)
        self.assertEqual(response.data["approved"], 1)
        self.assertEqual(response.data["rejected"], 1)

    def test_recalculate_cibil_updates_financial_score(self):
        loan = self.create_loan(monthly_income=50000, loan_amount=120000, tenure=24)
        self.client.force_authenticate(user=self.officer)

        response = self.client.get(f"/api/loans/officer/{loan.id}/recalculate-cibil/")

        self.assertEqual(response.status_code, 200)
        self.financials.refresh_from_db()
        self.assertEqual(response.data["new_cibil_score"], self.financials.credit_score)
        self.assertGreaterEqual(self.financials.credit_score, 300)

    def test_recalculate_cibil_returns_404_for_missing_loan(self):
        self.client.force_authenticate(user=self.officer)

        response = self.client.get("/api/loans/officer/999/recalculate-cibil/")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Loan not found")

    def test_verify_document_requires_file(self):
        response = self.client.post("/api/loans/verify-document/", {})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "No document provided.")

    @patch("loans.views.process_loan_document")
    def test_verify_document_returns_ai_result_and_updates_names(self, mock_process):
        mock_process.return_value = {"status": "passed", "decision": "AUTO_APPROVE"}
        document = SimpleUploadedFile("salary.png", b"fake-image", content_type="image/png")

        response = self.client.post(
            "/api/loans/verify-document/",
            {
                "document": document,
                "expected_doc_type": "salary_slip",
                "organization_name": "Acme Corp",
                "monthly_income": "20000",
                "first_name": "Ada",
                "last_name": "Lovelace",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "passed")
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Ada")
        self.assertEqual(self.user.last_name, "Lovelace")
        mock_process.assert_called_once()

    @patch("loans.views.process_loan_document")
    def test_verify_document_returns_422_for_failed_ai_result(self, mock_process):
        mock_process.return_value = {"status": "failed", "reason": "Unreadable"}
        document = SimpleUploadedFile("salary.png", b"fake-image", content_type="image/png")

        response = self.client.post(
            "/api/loans/verify-document/",
            {"document": document, "expected_doc_type": "salary_slip"},
            format="multipart",
        )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.data["reason"], "Unreadable")
