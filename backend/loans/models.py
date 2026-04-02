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
    ai_verification_data = models.JSONField(default=dict, blank=True, null=True)
    
    occupation = models.CharField(max_length=100)
    organization_name = models.CharField(max_length=100)
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2)
    loan_type = models.CharField(max_length=50)
    loan_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tenure = models.IntegerField()
    
    salary_slips = models.FileField(upload_to='temporary_proofs/salary_slips/', null=True, blank=True)
    itr_document = models.FileField(upload_to='temporary_proofs/itr_docs/', null=True, blank=True) 
    bank_statements = models.FileField(upload_to='temporary_proofs/bank_statements/', null=True, blank=True) 
    emp_id_card = models.FileField(upload_to='emp_ids/', null=True, blank=True)
    
    nominee_id_card = models.FileField(upload_to='nominee_ids/')
    nominee_address_proof = models.FileField(upload_to='nominee_address/')
    nominee_sign = models.FileField(upload_to='nominee_signs/')
    nominee_name = models.CharField(max_length=100)
    nominee_age = models.IntegerField(null=True, blank=True)
    nominee_ration_card = models.FileField(upload_to='nominee_rationcards/',null=True,blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.loan_type} ({self.status})"

