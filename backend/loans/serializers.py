from rest_framework import serializers
from django.db import connection
from .models import LoanApplication, ExternalFinancialHistory

class LoanApplicationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = LoanApplication
        fields = '__all__'
        read_only_fields = ['user']

        
    def to_representation(self, instance):
        
        data = super().to_representation(instance)
        user = instance.user
        
        
        request = self.context.get('request')
        

        
        try:
            ext_data = ExternalFinancialHistory.objects.get(user=user)
            data['actual_cibil'] = str(ext_data.calculated_cibil_score)
            
           
            if ext_data.proof_of_oldbank:
                data['proof_of_oldbank'] = request.build_absolute_uri(ext_data.proof_of_oldbank.url) if request else ext_data.proof_of_oldbank.url
                
            if ext_data.income_proof:
                data['income_proof'] = request.build_absolute_uri(ext_data.income_proof.url) if request else ext_data.income_proof.url
                
            if ext_data.bank_statements:
                data['bank_statements'] = request.build_absolute_uri(ext_data.bank_statements.url) if request else ext_data.bank_statements.url
                
            if ext_data.fd_receipts:
                data['fd_receipts'] = request.build_absolute_uri(ext_data.fd_receipts.url) if request else ext_data.fd_receipts.url
                
            if ext_data.pending_loan_docs:
                data['pending_loan_docs'] = request.build_absolute_uri(ext_data.pending_loan_docs.url) if request else ext_data.pending_loan_docs.url

        except ExternalFinancialHistory.DoesNotExist:
            
            with connection.cursor() as cursor:
                cursor.execute("SELECT credit_score FROM user_financial_data WHERE username = %s", [user.username])
                row = cursor.fetchone()
                if row:
                    data['actual_cibil'] = str(row[0])
                else:
                    data['actual_cibil'] = "N/A"
                    
        return data