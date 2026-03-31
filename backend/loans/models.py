from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model


class LoanApplication(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loans')
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
 
    cibil_score = models.IntegerField(null=True, blank=True)
    risk_score = models.CharField(max_length=100, null=True, blank=True)
    officer_notes = models.TextField(null=True, blank=True)
    
    
    occupation = models.CharField(max_length=100)
    organization_name = models.CharField(max_length=100)
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2)
    loan_type = models.CharField(max_length=50)
    loan_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tenure = models.IntegerField()
    
    
    id_proof = models.FileField(upload_to='id_proofs/')
    address_proof = models.FileField(upload_to='address_proofs/')
    salary_slips = models.FileField(upload_to='salary_slips/')
    emp_id_card = models.FileField(upload_to='emp_ids/')
    nominee_id_card = models.FileField(upload_to='nominee_ids/')
    nominee_address_proof = models.FileField(upload_to='nominee_address/')
    nominee_sign = models.FileField(upload_to='nominee_signs/')
    
    nominee_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)


    ai_verification_data = models.JSONField(default=dict, blank=True, null=True)
    def __str__(self):
        return f"{self.user.username} - {self.loan_type} ({self.status})"

User = get_user_model()
class ExternalFinancialHistory(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name='financial_history')

    years_at_previous_bank = models.PositiveIntegerField(default=0)
    annual_income = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_transaction_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    fixed_deposits_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    pending_loans_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    proof_of_oldbank = models.FileField(upload_to='proofs/vintage/', null=True, blank=True)
    income_proof = models.FileField(upload_to='proofs/income/', null=True, blank=True)
    bank_statements = models.FileField(upload_to='proofs/statements/', null=True, blank=True)
    fd_receipts = models.FileField(upload_to='proofs/fds/', null=True, blank=True)
    pending_loan_docs = models.FileField(upload_to='proofs/loans/', null=True, blank=True)


    calculated_cibil_score = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (f"Financial History for {self.user.username}")