from django.urls import path
from .views import  CheckKYCStatusView, UserProfileView, CheckUserStatus, UpdateProfileView, ChangePasswordView, SendOTPView, VerifyOTPView, ResetPasswordWithOTPView

urlpatterns = [
    path('my-kyc/', CheckKYCStatusView.as_view(), name='my-kyc'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('check-status/',CheckUserStatus.as_view(),name='check-status'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('reset-password-otp/', ResetPasswordWithOTPView.as_view(), name='reset-password-otp'),
]