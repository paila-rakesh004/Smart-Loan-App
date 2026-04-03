from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,permissions
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import CustomerRegisterSerializer, LoginSerializer, UserProfileSerializer
from django.db import connection
from django.contrib.auth import get_user_model
from django.db import connection 
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
import random
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView



class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):

        data = super().validate(attrs)
      
        data['is_officer'] = self.user.is_officer
        data['is_customer'] = self.user.is_customer
        return data
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer



class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            if user:
                token,create = Token.objects.get_or_create(user=user)
                return Response({
                    "token": token.key,
                    "is_customer": user.is_customer,
                    "is_officer": user.is_officer,
                    "username": user.username
                })
            return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

        
class CheckUserStatus(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self,request):
        user = request.user

        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM user_financial_data WHERE username = %s",[user.username])
            row = cursor.fetchone()

            if row is None:
                is_new = True
            else:
                is_new = False
        return Response({"is_new_user" : is_new, "first_name" : request.user.first_name, "last_name" : request.user.last_name})
    

class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        new_username = request.data.get('username')
        old_username = user.username 

        email = request.data.get('email')
        phone_number = request.data.get('phone_number')
        if not new_username:
            return Response({"error": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)


       
        if new_username != old_username:
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE user_financial_data 
                    SET username = %s 
                    WHERE username = %s
                """, [new_username, old_username])
            
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
    permission_classes = []
    def post(self, request):
        username = request.data.get('username')
        
        try:
            user = User.objects.get(username=username)
            
            
            otp = str(random.randint(100000, 999999))
            
            
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
    permission_classes = []
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
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        try:
            user = User.objects.get(username=username, reset_otp=otp)
            
            
            if user.otp_expiry and timezone.now() > user.otp_expiry:
                return Response({"error": "OTP expired."}, status=status.HTTP_400_BAD_REQUEST)

            
            user.set_password(new_password)
            
            
            user.reset_otp = None
            user.otp_expiry = None
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