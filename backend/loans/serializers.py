from rest_framework import serializers
from .models import LoanApplication

class LoanApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanApplication
        fields = '__all__'
        read_only_fields = ['user', 'status', 'created_at','risk_score']