from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserProfileSerializer
from .models import UserFinancialData
from django.db import connection
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
import secrets
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


class CheckUserStatus(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self,request):
        user = request.user
        financials = UserFinancialData.objects.get(username=user.username)
        row = financials.username

        if row is None:
            is_new = True
        else:
            is_new = False
        return Response({"is_new_user" : is_new, "first_name" : request.user.first_name, "last_name" : request.user.last_name})
    

class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        financials = UserFinancialData.objects.get(username=user.username)
        new_username = request.data.get('username')
        old_username = user.username 

        email = request.data.get('email')
        phone_number = request.data.get('phone_number')
        if not new_username:
            return Response({"error": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)

        if new_username != old_username:
            financials.username = new_username
            financials.save()
            user.username = new_username
        if email:
            user.email = email
        if phone_number:
            user.phone_number = phone_number
        user.save()
        return Response({"message": "Profile updated successfully!", "username": user.username,"email" : user.email, "phone_number" : user.phone_number}, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):
            return Response({"error": "Incorrect old password."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        
        return Response({"message": "Password updated successfully!"}, status=status.HTTP_200_OK)


User = get_user_model()


class SendOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        
        try:
            user = User.objects.get(username=username)
        
            if user.otp_expiry and timezone.now() < user.otp_expiry:
                time_remaining = (user.otp_expiry - timezone.now()).total_seconds()
                if time_remaining > 90: 
                    return Response(
                        {"error": f"OTP already sent. Please wait {int(time_remaining)} seconds before requesting again."}, 
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )
            
            
            otp = str(secrets.randbelow(1000000)).zfill(6)
            
            user.reset_otp = otp
            user.otp_expiry = timezone.now() + timedelta(minutes=2)
            user.save()
            if user.email:
                send_mail(
                    subject="Your Password Reset OTP",
                    message=f"Hello {user.username},\n\nYour OTP for password reset is: {otp}\n\nThis OTP is valid for exactly 2 minutes. Do not share this code with anyone.",
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                return Response({"message": "OTP sent successfully to your registered email."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "No email address linked to this username."}, status=status.HTTP_400_BAD_REQUEST)
                
        except User.DoesNotExist:
            
            return Response({"message": "If this username exists, an OTP has been sent to the registered email."}, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        otp = request.data.get('otp')

        try:
            user = User.objects.get(username=username, reset_otp=otp)
            
            
            if user.otp_expiry and timezone.now() > user.otp_expiry:
                return Response({"error": "This OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
                
            return Response({"message": "OTP Verified! You can now reset your password."}, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({"error": "Invalid OTP or Username."}, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordWithOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        username = request.data.get('username')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        try:
            user = User.objects.get(username=username, reset_otp=otp)
            
            
            if user.otp_expiry and timezone.now() > user.otp_expiry:
                return Response({"error": "OTP expired."}, status=status.HTTP_400_BAD_REQUEST)

            
            user.set_password(new_password)
            
            user.save()
            
            return Response({"message": "Password reset successfully!"}, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({"error": "Security validation failed. Please try again."}, status=status.HTTP_400_BAD_REQUEST)

class CheckKYCStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        
        has_pan = bool(user.pan_card_file and user.pan_card_file.name)
        has_aadhar = bool(user.aadhar_card_file and user.aadhar_card_file.name)
        has_photo = bool(user.passport_photo and user.passport_photo.name)

       
        pan_url = request.build_absolute_uri(user.pan_card_file.url) if has_pan else None
        aadhar_url = request.build_absolute_uri(user.aadhar_card_file.url) if has_aadhar else None
        photo_url = request.build_absolute_uri(user.passport_photo.url) if has_photo else None

        return Response({
            
            "is_kyc_complete": has_pan and has_aadhar and has_photo,
            
            "documents_present": {
                "pan_card": has_pan,
                "aadhar_card": has_aadhar,
                "passport_photo": has_photo
            },
            
            
            "urls": {
                "pan_card": pan_url,
                "aadhar_card": aadhar_url,
                "passport_photo": photo_url
            }
        })