from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from loans.serializers import LoanApplicationSerializer
from loans.models import LoanApplication
from loans.utils import calculate_mock_cibil
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
    def test_apply_loan_accepts_non_auto_approved_ai_status(self):
        response = self.client.post(
            "/api/loans/apply/",
            {
                "loan_amount": 25000,
                "tenure": 10,
                "loan_type": "Gold",
                "monthly_income": 15000,
                "ai_statuses": '{"salary_slip": {"decision": "MANUAL_REVIEW"}}',
            },
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(LoanApplication.objects.first().ai_verification_data["salary_slip"]["decision"], "MANUAL_REVIEW")
    @override_settings(
        MEDIA_URL="/media/",
        STORAGES={
            "default": {
                "BACKEND": "django.core.files.storage.FileSystemStorage",
            },
            "staticfiles": {
                "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
            },
        },
    )
    def test_apply_loan_updates_all_kyc_files(self):
        response = self.client.post(
            "/api/loans/apply/",
            {
                "loan_amount": "25000",
                "tenure": "10",
                "loan_type": "Personal",
                "monthly_income": "15000",
                "pan_card_file": SimpleUploadedFile("pan.pdf", b"pan"),
                "aadhar_card_file": SimpleUploadedFile("aadhar.pdf", b"aadhar"),
                "passport_photo": SimpleUploadedFile("photo.jpg", b"photo"),
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["vault_updated"])
        self.user.refresh_from_db()
        self.assertTrue(self.user.pan_card_file.name)
        self.assertTrue(self.user.aadhar_card_file.name)
        self.assertTrue(self.user.passport_photo.name)
    @patch("loans.views.LoanApplication.objects.create", side_effect=Exception("bad data"))
    def test_apply_loan_returns_400_when_creation_fails(self, mock_create):
        response = self.client.post("/api/loans/apply/", {"loan_amount": "invalid"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "bad data")
        mock_create.assert_called_once()
    def test_my_loans(self):
        self.create_loan()
        response = self.client.get("/api/loans/my-loans/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["actual_cibil"], "735")
        self.assertEqual(response.data[0]["applicant_age"], 31)
    def test_serializer_uses_na_values_without_financial_row(self):
        other_user = User.objects.create_user(username="other", password="password123")
        loan = self.create_loan(user=other_user)
        response = self.client.get("/api/loans/my-loans/")
        serialized = LoanApplicationSerializer(loan).data
        self.assertEqual(response.status_code, 200)
        self.assertEqual(serialized["actual_cibil"], "N/A")
        self.assertEqual(serialized["applicant_age"], "Unknown")
    @override_settings(
        MEDIA_URL="/media/",
        STORAGES={
            "default": {
                "BACKEND": "django.core.files.storage.FileSystemStorage",
            },
            "staticfiles": {
                "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
            },
        },
    )
    def test_serializer_adds_document_urls_with_and_without_request(self):
        self.user.pan_card_file = "vault/pan_cards/pan.pdf"
        self.user.aadhar_card_file = "vault/aadhar_cards/aadhar.pdf"
        self.user.passport_photo = "vault/photos/photo.jpg"
        self.user.save()
        loan = self.create_loan()
        serialized_without_request = LoanApplicationSerializer(loan).data
        self.client.force_authenticate(user=self.officer)
        response = self.client.get("/api/loans/officer/all-loans/")
        self.assertEqual(serialized_without_request["pan_card_file"], "/media/vault/pan_cards/pan.pdf")
        self.assertTrue(response.data[0]["pan_card_file"].startswith("http://testserver/media/"))
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
    @patch("loans.views.User.objects.get")
    def test_officer_all_loans_uses_unknown_for_missing_user_lookup(self, mock_get):
        self.create_loan()
        mock_get.side_effect = User.DoesNotExist
        self.client.force_authenticate(user=self.officer)
        response = self.client.get("/api/loans/officer/all-loans/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["applicant_name"], "Unknown")
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

    def test_recalculate_cibil_returns_404_for_missing_financial_data(self):
        loan = self.create_loan()
        self.financials.delete()
        self.client.force_authenticate(user=self.officer)

        response = self.client.get(f"/api/loans/officer/{loan.id}/recalculate-cibil/")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Financial data not found")

    def test_calculate_risk_returns_404_for_missing_loan(self):
        self.client.force_authenticate(user=self.officer)
        response = self.client.get("/api/loans/officer/999/calculate-risk/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Loan application not found.")
    def test_calculate_risk_requires_financial_data(self):
        loan = self.create_loan()
        self.financials.delete()
        self.client.force_authenticate(user=self.officer)
        response = self.client.get(f"/api/loans/officer/{loan.id}/calculate-risk/")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Financial ML data not found", response.data["error"])
    @patch("loans.views.label_encoder")
    @patch("loans.views.risk_model")
    def test_calculate_risk_updates_loan_score(self, mock_risk_model, mock_label_encoder):
        mock_risk_model.predict.return_value = [1]
        mock_label_encoder.inverse_transform.return_value = ["Low Risk"]
        loan = self.create_loan(monthly_income=50000, loan_amount=120000, tenure=24)
        self.client.force_authenticate(user=self.officer)
        response = self.client.get(f"/api/loans/officer/{loan.id}/calculate-risk/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["risk_score"], "Low Risk")
        loan.refresh_from_db()
        self.assertEqual(loan.risk_score, "Low Risk")
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
    @patch("loans.views.process_loan_document", side_effect=Exception("AI offline"))
    def test_verify_document_returns_500_for_processing_exception(self, mock_process):
        document = SimpleUploadedFile("salary.png", b"fake-image", content_type="image/png")
        response = self.client.post(
            "/api/loans/verify-document/",
            {"document": document, "expected_doc_type": "salary_slip"},
            format="multipart",
        )
        self.assertEqual(response.status_code, 500)
        self.assertIn("AI offline", response.data["error"])
    def test_loan_and_cibil_edge_case_helpers(self):
        loan = self.create_loan(status="Eligible")
        self.assertEqual(str(loan), "testuser - Personal (Eligible)")
        self.assertLess(calculate_mock_cibil(0, 0, 0, 500000, 1000, 50000, 1), 650)
        self.assertGreaterEqual(calculate_mock_cibil(1, 10000, 5000, 0, 0, 10000, 0), 300)
