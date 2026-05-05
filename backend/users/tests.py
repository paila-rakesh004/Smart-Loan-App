from datetime import timedelta
from pathlib import Path
from unittest.mock import MagicMock, patch
import coverage
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework.test import APIRequestFactory
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from users.authenticate import CookieJWTAuthentication
from users.models import UserFinancialData, auto_delete_file_on_change

User = get_user_model()


def _include_recursive_app_files_in_coverage():
    current_coverage = coverage.Coverage.current()
    if current_coverage is None:
        return

    root = Path(__file__).resolve().parents[2]
    extra_patterns = [
        "backend/users/**/*.py",
        "backend/loans/**/*.py",
        str(root / "backend" / "users" / "**" / "*.py"),
        str(root / "backend" / "loans" / "**" / "*.py"),
    ]
    include_patterns = list(current_coverage._inorout.include)
    for pattern in extra_patterns:
        if pattern not in include_patterns:
            include_patterns.append(pattern)

    current_coverage._inorout.include = include_patterns
    current_coverage._inorout.include_match = coverage.files.GlobMatcher(
        include_patterns,
        "include",
    )


_include_recursive_app_files_in_coverage()


class CookieJWTAuthenticationTest(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.authenticator = CookieJWTAuthentication()
        self.user = User.objects.create_user(
            username="jwtuser",
            email="jwt@test.com",
            password="password123",
        )

    def access_token(self):
        return str(RefreshToken.for_user(self.user).access_token)

    def test_authenticate_returns_none_without_cookie_or_header(self):
        request = self.factory.get("/api/users/profile/")

        self.assertIsNone(self.authenticator.authenticate(request))

    def test_authenticate_returns_none_for_header_without_raw_token(self):
        request = self.factory.get(
            "/api/users/profile/",
            HTTP_AUTHORIZATION="Basic abc123",
        )

        self.assertIsNone(self.authenticator.authenticate(request))

    def test_authenticate_uses_bearer_header_token(self):
        request = self.factory.get(
            "/api/users/profile/",
            HTTP_AUTHORIZATION=f"Bearer {self.access_token()}",
        )

        authenticated_user, validated_token = self.authenticator.authenticate(request)

        self.assertEqual(authenticated_user, self.user)
        self.assertEqual(validated_token["user_id"], str(self.user.id))

    def test_authenticate_uses_access_token_cookie(self):
        request = self.factory.get("/api/users/profile/")
        request.COOKIES["access_token"] = self.access_token()

        authenticated_user, validated_token = self.authenticator.authenticate(request)

        self.assertEqual(authenticated_user, self.user)
        self.assertEqual(validated_token["user_id"], str(self.user.id))


class UserViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123",
            first_name="Test",
            last_name="User",
            is_customer=True,
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
    def test_user_and_financial_data_string_representations(self):
        self.assertEqual(str(self.user), "testuser")
        self.assertEqual(str(self.financials), "testuser (Score: 720)")
    def test_token_response_includes_user_roles(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(
            "/api/token/",
            {"username": "testuser", "password": "password123"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_customer"])
        self.assertFalse(response.data["is_officer"])

    @patch("users.views.auth_views.CustomTokenObtainPairSerializer")
    def test_login_returns_serializer_errors(self, mock_serializer_class):
        serializer = MagicMock()
        serializer.is_valid.return_value = False
        serializer.errors = {"username": ["This field is required."]}
        mock_serializer_class.return_value = serializer
        self.client.force_authenticate(user=None)
        response = self.client.post(
            "/api/users/login/",
            {},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["username"], ["This field is required."])

    def test_refresh_requires_cookie(self):
        self.client.force_authenticate(user=None)
        response = self.client.post("/api/users/refresh/")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["error"], "No refresh token found in cookies.")

    def test_refresh_sets_new_access_cookie(self):
        self.client.force_authenticate(user=None)
        refresh = str(RefreshToken.for_user(self.user))
        self.client.cookies["refresh_token"] = refresh

        response = self.client.post("/api/users/refresh/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Token refreshed successfully.")
        self.assertIn("access_token", response.cookies)

    def test_refresh_rejects_invalid_cookie(self):
        self.client.force_authenticate(user=None)
        self.client.cookies["refresh_token"] = "not-a-valid-token"

        response = self.client.post("/api/users/refresh/")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["error"], "Invalid or expired refresh token.")

    def test_logout_deletes_auth_cookies(self):
        self.client.cookies["access_token"] = "access"
        self.client.cookies["refresh_token"] = "refresh"
        self.client.cookies["username"] = "testuser"
        self.client.cookies["is_officer"] = "false"

        response = self.client.post("/api/users/logout/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Logged out successfully!")
        self.assertEqual(response.cookies["access_token"].value, "")
        self.assertEqual(response.cookies["refresh_token"].value, "")
        self.assertEqual(response.cookies["username"].value, "")
        self.assertEqual(response.cookies["is_officer"].value, "")

    def test_change_password_requires_authenticated_user(self):
        self.client.force_authenticate(user=None)
        response = self.client.put(
            "/api/users/change-password/",
            {"old_password": "password123", "new_password": "newpass123"},
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["error"], "Authentication required")

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
    def test_update_profile_updates_email_without_username(self):
        response = self.client.put("/api/users/update-profile/", {"email": "new@test.com"})
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "testuser")
        self.assertEqual(self.user.email, "new@test.com")

    def test_update_profile_rejects_duplicate_username(self):
        User.objects.create_user(username="taken", password="password123")

        response = self.client.put("/api/users/update-profile/", {"username": "taken"})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "This username already exists.")

    def test_update_profile_renames_user_without_financial_data(self):
        self.financials.delete()

        response = self.client.put("/api/users/update-profile/", {"username": "renamed"})

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "renamed")

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

    def test_check_status_for_missing_financial_data(self):
        self.financials.delete()

        response = self.client.get("/api/users/check-status/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_new_user"])

    @patch("users.views.UserFinancialData.objects.get")
    def test_check_status_handles_null_financial_username(self, mock_get):
        mock_get.return_value.username = None
        response = self.client.get("/api/users/check-status/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_new_user"])
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
    def test_send_otp_rejects_user_without_email(self):
        self.client.force_authenticate(user=None)
        self.user.email = ""
        self.user.save()
        response = self.client.post("/api/users/send-otp/", {"username": "testuser"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "No email address linked to this username.")
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
    def test_reset_password_rejects_expired_otp(self):
        self.client.force_authenticate(user=None)
        self.user.reset_otp = "123456"
        self.user.otp_expiry = timezone.now() - timedelta(minutes=1)
        self.user.save()
        response = self.client.post(
            "/api/users/reset-password-otp/",
            {"username": "testuser", "otp": "123456", "new_password": "brandnew123"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "OTP expired.")
    def test_reset_password_rejects_invalid_otp(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(
            "/api/users/reset-password-otp/",
            {"username": "testuser", "otp": "000000", "new_password": "brandnew123"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Security validation failed. Please try again.")
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
    def test_kyc_status_reports_uploaded_documents(self):
        self.user.pan_card_file = "vault/pan_cards/pan.pdf"
        self.user.aadhar_card_file = "vault/aadhar_cards/aadhar.pdf"
        self.user.passport_photo = "vault/photos/photo.jpg"
        self.user.save()
        response = self.client.get("/api/users/my-kyc/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_kyc_complete"])
        self.assertTrue(response.data["documents_present"]["pan_card"])
    def test_file_cleanup_signal_deletes_replaced_documents(self):
        old_user = MagicMock()
        old_user.pan_card_file = MagicMock()
        old_user.aadhar_card_file = MagicMock()
        old_user.passport_photo = MagicMock()
        self.user.pan_card_file = "vault/pan_cards/new-pan.pdf"
        self.user.aadhar_card_file = "vault/aadhar_cards/new-aadhar.pdf"
        self.user.passport_photo = "vault/photos/new-photo.jpg"
        with patch("users.models.User.objects.get", return_value=old_user):
            auto_delete_file_on_change(User, self.user)
        old_user.pan_card_file.delete.assert_called_once_with(save=False)
        old_user.aadhar_card_file.delete.assert_called_once_with(save=False)
        old_user.passport_photo.delete.assert_called_once_with(save=False)
    def test_file_cleanup_signal_ignores_new_or_missing_users(self):
        unsaved_user = User(username="unsaved")
        self.assertFalse(auto_delete_file_on_change(User, unsaved_user))
        with patch("users.models.User.objects.get", side_effect=User.DoesNotExist):
            self.assertFalse(auto_delete_file_on_change(User, self.user))
