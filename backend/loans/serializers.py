from rest_framework import serializers
from .models import LoanApplication
from users.models import UserFinancialData
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
        financial_data = UserFinancialData.objects.filter(username=user.username).first()
        if financial_data:
            data['actual_cibil'] = str(financial_data.credit_score)
            data['total_transaction_amount'] = str(financial_data.total_transaction_amount)
            data['fixed_deposits'] = str(financial_data.fixed_deposits)
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