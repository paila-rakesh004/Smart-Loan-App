from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from users.serializers import CustomTokenObtainPairSerializer
from users.services import generate_and_send_otp

User = get_user_model()
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class AuthViewSet(ViewSet):

    permission_classes = [AllowAny]

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
                            