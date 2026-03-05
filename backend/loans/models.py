from django.db import models
from django.conf import settings

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

    def __str__(self):
        return f"{self.user.username} - {self.loan_type} ({self.status})"