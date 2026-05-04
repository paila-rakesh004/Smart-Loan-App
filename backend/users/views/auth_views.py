from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.utils import timezone
from users.serializers import CustomTokenObtainPairSerializer
from users.services import generate_and_send_otp
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
class AuthViewSet(ViewSet):

    permission_classes = [AllowAny]

    def login(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        if serializer.is_valid():
            access_token = serializer.validated_data.get('access')
            refresh_token = serializer.validated_data.get('refresh')
            is_officer = serializer.validated_data.get('is_officer')
            is_customer = serializer.validated_data.get('is_customer')
            username = request.data.get('username')

            response = Response({
                "message": "Login successful",
                "is_officer": is_officer,
                "is_customer": is_customer,
            }, status=status.HTTP_200_OK)

            response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='Lax', max_age=1800)
            response.set_cookie('refresh_token', refresh_token, httponly=True, secure=False, samesite='Lax', max_age=7*24*60*60)

            response.set_cookie('username', username, httponly=False, secure=False, samesite='Lax', max_age=7*24*60*60)
            response.set_cookie('is_officer', str(is_officer).lower(), httponly=False, secure=False, samesite='Lax', max_age=7*24*60*60)

            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def refresh(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"error": "No refresh token found in cookies."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            response = Response({"message": "Token refreshed successfully."})
            response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='Lax', max_age=1800)
            return response
        except Exception:
            return Response({"error": "Invalid or expired refresh token."}, status=status.HTTP_401_UNAUTHORIZED)

    def logout(self, request):
        response = Response({"message": "Logged out successfully!"})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        response.delete_cookie('username')
        response.delete_cookie('is_officer')
        return response

    def change_password(self, request):
        user = request.user

        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):
            return Response({"error": "Incorrect old password."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password updated successfully!"})


    def send_otp(self, request):
        username = request.data.get('username')

        try:
            user = User.objects.get(username=username)
            success, message = generate_and_send_otp(user)
            if success:
                return Response({"message": message})
            status_code = (
                status.HTTP_429_TOO_MANY_REQUESTS
                if "wait" in message else status.HTTP_400_BAD_REQUEST
            )
            return Response({"error": message}, status=status_code)

        except User.DoesNotExist:
            return Response({
                "message": "If this username exists, an OTP has been sent."
            })


    def verify_otp(self, request):
        username = request.data.get('username')
        otp = request.data.get('otp')

        try:
            user = User.objects.get(username=username, reset_otp=otp)

            if user.otp_expiry and timezone.now() > user.otp_expiry:
                return Response({"error": "OTP expired."}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"message": "OTP verified!"})

        except User.DoesNotExist:
            return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)


    def reset_password(self, request):
        username = request.data.get('username')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        try:
            user = User.objects.get(username=username, reset_otp=otp)

            if user.otp_expiry and timezone.now() > user.otp_expiry:
                return Response({"error": "OTP expired."}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()

            return Response({"message": "Password reset successful!"})

        except User.DoesNotExist:
            return Response({"error": "Validation failed."},  status=status.HTTP_400_BAD_REQUEST)