import pytest
import uuid
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from users.models import User
from loans.models import LoanApplication


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(db):
    def make_user(username=None, password='testpass123', email=None, **kwargs):
        if username is None:
            username = f'testuser_{uuid.uuid4().hex[:8]}'
        if email is None:
            email = f'{username}@example.com'
        user = User(username=username, email=email, **kwargs)
        user.set_password(password)
        user.save()
        return user
    return make_user


@pytest.fixture
def create_customer(db):
    def make_customer(username=None, password='customer123', **kwargs):
        if username is None:
            username = f'customer_{uuid.uuid4().hex[:8]}'
        email = kwargs.pop('email', f'{username}@example.com')
        user = User(username=username, email=email, is_customer=True, **kwargs)
        user.set_password(password)
        user.save()
        return user
    return make_customer


@pytest.fixture
def create_officer(db):
    def make_officer(username=None, password='officer123', **kwargs):
        if username is None:
            username = f'officer_{uuid.uuid4().hex[:8]}'
        email = kwargs.pop('email', f'{username}@example.com')
        user = User(username=username, email=email, is_officer=True, **kwargs)
        user.set_password(password)
        user.save()
        return user
    return make_officer


@pytest.fixture
def authenticated_client(api_client, db, create_customer):
    user = create_customer()
    token, _ = Token.objects.get_or_create(user=user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    api_client.force_authenticate(user=user)
    api_client.user = user
    return api_client


@pytest.fixture
def officer_client(api_client, db, create_officer):
    user = create_officer()
    token, _ = Token.objects.get_or_create(user=user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    api_client.force_authenticate(user=user)
    api_client.user = user
    return api_client


@pytest.fixture
def create_loan(db, create_customer):
    def make_loan(customer=None, **kwargs):
        if customer is None:
            customer = create_customer()
        
        loan_kwargs = {
            'user': customer,
            'occupation': kwargs.get('occupation', 'Engineer'),
            'organization_name': kwargs.get('organization_name', 'Tech Corp'),
            'monthly_income': kwargs.get('monthly_income', 50000),
            'loan_type': kwargs.get('loan_type', 'Personal'),
            'loan_amount': kwargs.get('loan_amount', 500000),
            'tenure': kwargs.get('tenure', 36),
            'nominee_name': kwargs.get('nominee_name', 'Jane Doe'),
            'nominee_age': kwargs.get('nominee_age', 30),
            'cibil_score': kwargs.get('cibil_score', 750),
            'status': kwargs.get('status', 'Pending'),
        }
        
        return LoanApplication.objects.create(**loan_kwargs)
    return make_loan


@pytest.fixture
def create_loan_for_user(db):
    def make_loan(user, **kwargs):
        loan_kwargs = {
            'user': user,
            'occupation': kwargs.get('occupation', 'Engineer'),
            'organization_name': kwargs.get('organization_name', 'Tech Corp'),
            'monthly_income': kwargs.get('monthly_income', 50000),
            'loan_type': kwargs.get('loan_type', 'Personal'),
            'loan_amount': kwargs.get('loan_amount', 500000),
            'tenure': kwargs.get('tenure', 36),
            'nominee_name': kwargs.get('nominee_name', 'Jane Doe'),
            'nominee_age': kwargs.get('nominee_age', 30),
            'cibil_score': kwargs.get('cibil_score', 750),
            'status': kwargs.get('status', 'Pending'),
        }
        
        return LoanApplication.objects.create(**loan_kwargs)
    return make_loan
