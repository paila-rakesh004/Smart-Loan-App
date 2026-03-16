from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import CustomerRegisterSerializer, LoginSerializer, UserProfileSerializer
from rest_framework import permissions
from django.db import connection
from django.contrib.auth import get_user_model


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomerRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            if user:
                token, created = Token.objects.get_or_create(user=user)
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
        return Response({"is_new_user" : is_new})
    

class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user

        new_username = request.data.get('username', user.username)
        
        user.username = new_username
       
        user.save()
        
        return Response({"message": "Profile updated successfully!", "username": user.username}, status=status.HTTP_200_OK)

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
class VerifyAadharView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        aadhar_number = request.data.get('aadhar_number')

        if not username or not aadhar_number:
            return Response({"error": "Please provide both Username and Aadhaar Number."}, status=status.HTTP_400_BAD_REQUEST)

       
        if User.objects.filter(username=username, aadhar_number=aadhar_number).exists():
            return Response({"message": "Aadhaar verified successfully!"}, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid Username or Aadhaar Number."}, status=status.HTTP_404_NOT_FOUND)



class ResetPasswordView(APIView):
    permission_classes = [] 

    def post(self, request):
        username = request.data.get('username')
        aadhar_number = request.data.get('aadhar_number')
        new_password = request.data.get('new_password')

        try:
            
            user = User.objects.get(username=username, aadhar_number=aadhar_number)
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password reset successfully!"}, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({"error": "Security check failed."}, status=status.HTTP_400_BAD_REQUEST)
