from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import get_user_model
from users.serializers import UserProfileSerializer
from users.models import UserFinancialData


class ProfileViewSet(ViewSet):

    permission_classes = [permissions.IsAuthenticated]

    def profile(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


    def update_profile(self, request):
        user = request.user
        new_username = request.data.get('username')
        email = request.data.get('email')
        phone_number = request.data.get('phone_number')

        if new_username and new_username != user.username:
            users = get_user_model()
            if users.objects.filter(username=new_username).exclude(id=user.id).exists():
                return Response({"error": "This username already exists."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                financials = UserFinancialData.objects.get(username=user.username)
                financials.username = new_username
                financials.save()
            except UserFinancialData.DoesNotExist:
                pass

            user.username = new_username

        if email:
            user.email = email
        if phone_number:
            user.phone_number = phone_number

        user.save()

        return Response({
            "message": "Profile updated successfully!",
            "username": user.username,
            "email": user.email,
            "phone_number": user.phone_number
        }, status=status.HTTP_200_OK)


    def check_status(self, request):
        user = request.user

        try:
            financials = UserFinancialData.objects.get(username=user.username)
            is_new = financials.username is None
        except UserFinancialData.DoesNotExist:
            is_new = True

        return Response({
            "is_new_user": is_new,
            "first_name": user.first_name,
            "last_name": user.last_name
        })