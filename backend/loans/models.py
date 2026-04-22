from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

class LoanApplication(models.Model):
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loans')
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Eligible', 'Eligible'),
        ('Not Eligible', 'Not Eligible'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    cibil_score = models.IntegerField(null=True, blank=True)
    risk_score = models.CharField(max_length=100, blank=True,default="")
    officer_notes = models.TextField(blank=True,default="")
    ai_verification_data = models.JSONField(default=dict, blank=True, null=True)
    
    occupation = models.CharField(max_length=100)
    occ = models.CharField(max_length=100, blank=True,default="")
    organization_name = models.CharField(max_length=100)
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2)
    loan_type = models.CharField(max_length=50)
    loan_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tenure = models.IntegerField()
    
    salary_slips = models.FileField(upload_to='temporary_proofs/salary_slips/', null=True, blank=True)
    itr_document = models.FileField(upload_to='temporary_proofs/itr_docs/', null=True, blank=True) 
    bank_statements = models.FileField(upload_to='temporary_proofs/bank_statements/', null=True, blank=True) 
    emp_id_card = models.FileField(upload_to='emp_ids/', null=True, blank=True)
    
    nominee_name = models.CharField(max_length=255, blank=True,default="")
    nominee_age = models.IntegerField(blank=True, null=True) 
    nominee_relation = models.CharField(max_length=100, blank=True,default="")

    guarantor_income = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    guarantor_organization = models.CharField(max_length=255, blank=True,default="")

    EDUCATION_DOC_PATH = 'documents/education/'
    doc_10th_cert = models.FileField(upload_to=EDUCATION_DOC_PATH, blank=True, null=True)
    doc_12th_cert = models.FileField(upload_to=EDUCATION_DOC_PATH, blank=True, null=True)
    doc_degree_cert = models.FileField(upload_to=EDUCATION_DOC_PATH, blank=True, null=True)
    doc_admission_letter = models.FileField(upload_to=EDUCATION_DOC_PATH, blank=True, null=True)
    doc_fee_structure = models.FileField(upload_to=EDUCATION_DOC_PATH, blank=True, null=True)
    doc_guarantor_kyc = models.FileField(upload_to=EDUCATION_DOC_PATH, blank=True, null=True)
    doc_guarantor_financials = models.FileField(upload_to=EDUCATION_DOC_PATH, blank=True, null=True)
    doc_guarantor_photo = models.FileField(upload_to=EDUCATION_DOC_PATH, blank=True, null=True)
    doc_guarantor_signature = models.FileField(upload_to=EDUCATION_DOC_PATH, blank=True, null=True)

    HOME_DOC_PATH = 'documents/home/'
    doc_agreement_sale = models.FileField(upload_to=HOME_DOC_PATH, blank=True, null=True)
    doc_encumbrance_cert = models.FileField(upload_to=HOME_DOC_PATH, blank=True, null=True)
    doc_building_plan = models.FileField(upload_to=HOME_DOC_PATH, blank=True, null=True) 
    doc_noc = models.FileField(upload_to=HOME_DOC_PATH, blank=True, null=True)


    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.loan_type} ({self.status})"

