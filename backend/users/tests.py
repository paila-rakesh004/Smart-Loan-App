from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


class UserViewsTest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )

        self.client.force_authenticate(user=self.user)

    def test_user_profile(self):
        response = self.client.get("/api/users/profile/")
        self.assertEqual(response.status_code, 200)

    def test_update_profile(self):
        data = {
            "username": "newusername",
            "email": "new@test.com"
        }

        response = self.client.put("/api/users/update-profile/", data)

        self.assertEqual(response.status_code, 200)

    def test_change_password(self):
        data = {
            "old_password": "password123",
            "new_password": "newpass123"
        }

        response = self.client.put("/api/users/change-password/", data)

        self.assertEqual(response.status_code, 200)