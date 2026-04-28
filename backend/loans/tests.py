from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from loans.models import LoanApplication

User = get_user_model()


class LoanViewsTest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )

        self.client.force_authenticate(user=self.user)

    def test_apply_loan_success(self):
        data = {
            "loan_amount": 50000,
            "tenure": 12,
            "loan_type": "Personal",
            "monthly_income": 20000
        }

        response = self.client.post("/api/loans/apply/", data)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(LoanApplication.objects.count(), 1)

    def test_my_loans(self):
        LoanApplication.objects.create(
            user=self.user,
            loan_amount=50000,
            tenure=12,
            loan_type="Personal",
            monthly_income=20000
        )

        response = self.client.get("/api/loans/my-loans/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_customer_stats(self):
        LoanApplication.objects.create(
            user=self.user,
            loan_amount=50000,
            tenure=12,
            loan_type="Personal",
            monthly_income=20000,
            status="Eligible"
        )

        response = self.client.get("/api/loans/customer-stats/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_applied"], 1)
        self.assertEqual(response.data["total_approved"], 1)