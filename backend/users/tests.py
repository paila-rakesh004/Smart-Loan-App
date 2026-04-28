from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

from users.models import UserFinancialData

User = get_user_model()


class UserViewsTest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123",
            first_name="Test",
            last_name="User",
        )
        self.financials = UserFinancialData.objects.create(
            username=self.user.username,
            years_as_customer=3,
            total_transaction_amount=250000,
            total_loan_amount=50000,
            tenure_months=12,
            income=600000,
            pending_loan=10000,
            fixed_deposits=40000,
            credit_score=720,
        )

        self.client.force_authenticate(user=self.user)

    def test_user_profile(self):
        response = self.client.get("/api/users/profile/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "testuser")
        self.assertEqual(response.data["first_name"], "Test")

    def test_update_profile(self):
        data = {
            "username": "newusername",
            "email": "new@test.com",
            "phone_number": "9999999999",
        }

        response = self.client.put("/api/users/update-profile/", data)

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.financials.refresh_from_db()
        self.assertEqual(self.user.username, "newusername")
        self.assertEqual(self.user.email, "new@test.com")
        self.assertEqual(self.user.phone_number, "9999999999")
        self.assertEqual(self.financials.username, "newusername")

    def test_update_profile_requires_username(self):
        response = self.client.put("/api/users/update-profile/", {"email": "new@test.com"})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Username is required.")

    def test_change_password(self):
        data = {
            "old_password": "password123",
            "new_password": "newpass123"
        }

        response = self.client.put("/api/users/change-password/", data)

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpass123"))

    def test_change_password_rejects_wrong_old_password(self):
        response = self.client.put(
            "/api/users/change-password/",
            {"old_password": "bad-password", "new_password": "newpass123"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Incorrect old password.")

    def test_check_status_for_existing_financial_data(self):
        response = self.client.get("/api/users/check-status/")

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["is_new_user"])
        self.assertEqual(response.data["first_name"], "Test")

    def test_check_kyc_status_without_documents(self):
        response = self.client.get("/api/users/my-kyc/")

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["is_kyc_complete"])
        self.assertEqual(
            response.data["documents_present"],
            {"pan_card": False, "aadhar_card": False, "passport_photo": False},
        )

    @override_settings(EMAIL_HOST_USER="noreply@example.com")
    @patch("users.views.send_mail")
    @patch("users.views.secrets.randbelow", return_value=12345)
    def test_send_otp_stores_code_and_sends_email(self, mock_randbelow, mock_send_mail):
        self.client.force_authenticate(user=None)

        response = self.client.post("/api/users/send-otp/", {"username": "testuser"})

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.reset_otp, "012345")
        self.assertIsNotNone(self.user.otp_expiry)
        mock_send_mail.assert_called_once()
        mock_randbelow.assert_called_once_with(1000000)

    def test_send_otp_uses_generic_response_for_unknown_user(self):
        self.client.force_authenticate(user=None)

        response = self.client.post("/api/users/send-otp/", {"username": "missing"})

        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.data)

    def test_send_otp_rate_limits_recent_code(self):
        self.client.force_authenticate(user=None)
        self.user.otp_expiry = timezone.now() + timedelta(seconds=100)
        self.user.save()

        response = self.client.post("/api/users/send-otp/", {"username": "testuser"})

        self.assertEqual(response.status_code, 429)
        self.assertIn("OTP already sent", response.data["error"])

    def test_verify_otp_success_and_failure(self):
        self.client.force_authenticate(user=None)
        self.user.reset_otp = "123456"
        self.user.otp_expiry = timezone.now() + timedelta(minutes=1)
        self.user.save()

        success = self.client.post(
            "/api/users/verify-otp/",
            {"username": "testuser", "otp": "123456"},
        )
        failure = self.client.post(
            "/api/users/verify-otp/",
            {"username": "testuser", "otp": "000000"},
        )

        self.assertEqual(success.status_code, 200)
        self.assertEqual(failure.status_code, 400)

    def test_verify_otp_rejects_expired_code(self):
        self.client.force_authenticate(user=None)
        self.user.reset_otp = "123456"
        self.user.otp_expiry = timezone.now() - timedelta(minutes=1)
        self.user.save()

        response = self.client.post(
            "/api/users/verify-otp/",
            {"username": "testuser", "otp": "123456"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "This OTP has expired. Please request a new one.")

    def test_reset_password_with_valid_otp(self):
        self.client.force_authenticate(user=None)
        self.user.reset_otp = "123456"
        self.user.otp_expiry = timezone.now() + timedelta(minutes=1)
        self.user.save()

        response = self.client.post(
            "/api/users/reset-password-otp/",
            {"username": "testuser", "otp": "123456", "new_password": "brandnew123"},
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("brandnew123"))

    def test_kyc_status_reports_uploaded_documents(self):
        self.user.pan_card_file = "vault/pan_cards/pan.pdf"
        self.user.aadhar_card_file = "vault/aadhar_cards/aadhar.pdf"
        self.user.passport_photo = "vault/photos/photo.jpg"
        self.user.save()

        response = self.client.get("/api/users/my-kyc/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_kyc_complete"])
        self.assertTrue(response.data["documents_present"]["pan_card"])
