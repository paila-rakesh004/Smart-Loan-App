from django.urls import path
from .views import AuthViewSet, ProfileViewSet, KYCViewSet

auth = AuthViewSet.as_view
profile = ProfileViewSet.as_view
kyc = KYCViewSet.as_view

urlpatterns = [
    path('login/', auth({'post': 'login'}), name='login'),
    path('refresh/', auth({'post': 'refresh'}), name='refresh'),
    path('logout/', auth({'post': 'logout'}), name='logout'),


    path('change-password/', auth({'put': 'change_password'}), name='change-password'),
    path('send-otp/', auth({'post': 'send_otp'}), name='send-otp'),
    path('verify-otp/', auth({'post': 'verify_otp'}), name='verify-otp'),
    path('reset-password-otp/', auth({'post': 'reset_password'}), name='reset-password-otp'),

    path('profile/', profile({'get': 'profile'}), name='profile'),
    path('update-profile/', profile({'put': 'update_profile'}), name='update-profile'),
    path('check-status/', profile({'get': 'check_status'}), name='check-status'),

    path('my-kyc/', kyc({'get': 'kyc_status'}), name='kyc-status'),
]