from rest_framework import serializers
from django.db import connection
from .models import LoanApplication

class LoanApplicationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = LoanApplication
        fields = '__all__'
        read_only_fields = ['user']

    def to_representation(self, instance):
       
        data = super().to_representation(instance)
        user = instance.user
        data['applicant_age'] = user.age if user.age else "Unknown"
       
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT credit_score, total_transaction_amount, fixed_deposits 
                FROM user_financial_data 
                WHERE username = %s
            """, [user.username])
            row = cursor.fetchone()
            if row:
                data['actual_cibil'] = str(row[0])
                data['total_transaction_amount'] = str(row[1])
                data['fixed_deposits'] = str(row[2])
            else:
                data['actual_cibil'] = "N/A"
                data['total_transaction_amount'] = "N/A"
                data['fixed_deposits'] = "N/A"
                
        request = self.context.get('request')
        
        if user.pan_card_file:
            data['pan_card_file'] = request.build_absolute_uri(user.pan_card_file.url) if request else user.pan_card_file.url
        
        if user.aadhar_card_file:
            data['aadhar_card_file'] = request.build_absolute_uri(user.aadhar_card_file.url) if request else user.aadhar_card_file.url
            
        if user.passport_photo:
            data['passport_photo'] = request.build_absolute_uri(user.passport_photo.url) if request else user.passport_photo.url

        return data