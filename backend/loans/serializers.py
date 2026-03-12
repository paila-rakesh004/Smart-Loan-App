from rest_framework import serializers
from django.db import connection
from .models import LoanApplication, ExternalFinancialHistory

class LoanApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanApplication
        fields = '__all__'

    def to_representation(self, instance):
        
        data = super().to_representation(instance)
        user = instance.user
        
        try:
            ext_data = ExternalFinancialHistory.objects.get(user=user)
            data['actual_cibil'] = str(ext_data.calculated_cibil_score)
        except ExternalFinancialHistory.DoesNotExist:
            with connection.cursor() as cursor:
                cursor.execute("SELECT credit_score FROM user_financial_data WHERE username = %s", [user.username])
                row = cursor.fetchone()
                if row:
                    data['actual_cibil'] = str(row[0])
                else:
                    data['actual_cibil'] = "N/A"
                    
        return data