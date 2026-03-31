from rest_framework import serializers
from .models import User

class CustomerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'phone_number', 'pan_number', 'aadhar_number', 'address']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            phone_number=validated_data.get('phone_number', ''),
            pan_number=validated_data.get('pan_number', ''),
            aadhar_number=validated_data.get('aadhar_number', ''),
            address=validated_data.get('address', ''),
            is_customer=True,
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'pan_number', 'aadhar_number', 'address','first_name','last_name']