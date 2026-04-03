import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from users.models import User
from users.serializers import CustomerRegisterSerializer, LoginSerializer, UserProfileSerializer

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    def test_create_user(self, create_user):
        user = create_user(
            username='testuser',
            email='test@example.com',
            phone_number='1234567890'
        )
        assert user.username == 'testuser'
        assert user.email == 'test@example.com'
        assert user.check_password('testpass123')

    def test_create_user_without_email(self, create_user):
        user = create_user(username='noemail', email='')
        assert user.email == ''

    def test_user_str_representation(self, create_user):
        user = create_user(username='repruser')
        assert str(user) == 'repruser'

    def test_user_default_flags(self, create_user):
        user = create_user()
        assert user.is_customer is False
        assert user.is_officer is False

    def test_user_officer_flag(self, create_officer):
        user = create_officer()
        assert user.is_officer is True
        assert user.is_customer is False

    def test_user_pan_aadhar_fields(self, create_user):
        user = create_user(
            pan_number='ABCDE1234F',
            aadhar_number='123456789012'
        )
        assert user.pan_number == 'ABCDE1234F'
        assert user.aadhar_number == '123456789012'

    def test_user_age_field(self, create_user):
        user = create_user(age=25)
        assert user.age == 25


@pytest.mark.django_db
class TestCustomerRegisterSerializer:
    def test_valid_registration_data(self):
        data = {
            'username': 'newuser',
            'password': 'securepass123',
            'email': 'new@example.com',
            'phone_number': '9876543210',
            'pan_number': 'ABCDE1234F',
            'aadhar_number': '123456789012'
        }
        serializer = CustomerRegisterSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()
        assert user.username == 'newuser'

    def test_missing_required_fields(self):
        data = {'username': 'incomplete'}
        serializer = CustomerRegisterSerializer(data=data)
        assert not serializer.is_valid()
        assert 'password' in serializer.errors

    def test_duplicate_username(self, create_user):
        create_user(username='duplicate')
        data = {
            'username': 'duplicate',
            'password': 'pass123',
            'email': 'dup@example.com'
        }
        serializer = CustomerRegisterSerializer(data=data)
        assert not serializer.is_valid()
        assert 'username' in serializer.errors


@pytest.mark.django_db
class TestLoginSerializer:
    def test_valid_login_data(self):
        serializer = LoginSerializer(data={
            'username': 'testuser',
            'password': 'testpass'
        })
        assert serializer.is_valid()

    def test_missing_username(self):
        serializer = LoginSerializer(data={'password': 'testpass'})
        assert not serializer.is_valid()
        assert 'username' in serializer.errors

    def test_missing_password(self):
        serializer = LoginSerializer(data={'username': 'testuser'})
        assert not serializer.is_valid()
        assert 'password' in serializer.errors


@pytest.mark.django_db
class TestUserProfileSerializer:
    def test_serialize_user_profile(self, create_user):
        user = create_user(
            username='profileuser',
            email='profile@example.com',
            first_name='John',
            last_name='Doe'
        )
        serializer = UserProfileSerializer(user)
        data = serializer.data
        assert data['username'] == 'profileuser'
        assert data['email'] == 'profile@example.com'
        assert data['first_name'] == 'John'
        assert data['last_name'] == 'Doe'


@pytest.mark.django_db
class TestLoginView:
    def test_login_success(self, api_client, create_user):
        user = create_user(username='loginuser', password='loginpass123')
        data = {
            'username': 'loginuser',
            'password': 'loginpass123'
        }
        response = api_client.post('/api/users/login/', data)
        assert response.status_code == status.HTTP_200_OK
        assert 'token' in response.data

    def test_login_invalid_credentials(self, api_client, create_user):
        create_user(username='authuser', password='correctpass')
        data = {
            'username': 'authuser',
            'password': 'wrongpass'
        }
        response = api_client.post('/api/users/login/', data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, api_client):
        data = {
            'username': 'ghost',
            'password': 'anypass'
        }
        response = api_client.post('/api/users/login/', data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestSendOTPView:
    def test_send_otp_existing_user(self, api_client, create_user):
        user = create_user(email='otp@example.com')
        data = {'username': user.username}
        response = api_client.post('/api/users/send-otp/', data)
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.reset_otp is not None

    def test_send_otp_nonexistent_user(self, api_client):
        data = {'username': 'ghostuser'}
        response = api_client.post('/api/users/send-otp/', data)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestVerifyOTPView:
    def test_verify_valid_otp(self, api_client, create_user):
        from django.utils import timezone
        from datetime import timedelta
        import random
        
        user = create_user()
        otp = str(random.randint(100000, 999999))
        user.reset_otp = otp
        user.otp_expiry = timezone.now() + timedelta(minutes=5)
        user.save()
        
        data = {'username': user.username, 'otp': otp}
        response = api_client.post('/api/users/verify-otp/', data)
        assert response.status_code == status.HTTP_200_OK

    def test_verify_expired_otp(self, api_client, create_user):
        from django.utils import timezone
        from datetime import timedelta
        
        user = create_user()
        user.reset_otp = '123456'
        user.otp_expiry = timezone.now() - timedelta(minutes=1)
        user.save()
        
        data = {'username': user.username, 'otp': '123456'}
        response = api_client.post('/api/users/verify-otp/', data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_invalid_otp(self, api_client, create_user):
        create_user()
        data = {'username': 'testuser', 'otp': '000000'}
        response = api_client.post('/api/users/verify-otp/', data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestResetPasswordWithOTPView:
    def test_reset_password_success(self, api_client, create_user):
        from django.utils import timezone
        from datetime import timedelta
        import random
        
        user = create_user()
        otp = str(random.randint(100000, 999999))
        user.reset_otp = otp
        user.otp_expiry = timezone.now() + timedelta(minutes=5)
        user.save()
        
        data = {
            'username': user.username,
            'otp': otp,
            'new_password': 'resetpass123'
        }
        response = api_client.post('/api/users/reset-password-otp/', data)
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.check_password('resetpass123')
        assert user.reset_otp is None

    def test_reset_password_invalid_otp(self, api_client, create_user):
        user = create_user()
        data = {
            'username': user.username,
            'otp': '000000',
            'new_password': 'newpass'
        }
        response = api_client.post('/api/users/reset-password-otp/', data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
