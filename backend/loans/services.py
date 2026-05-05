import os
import json
import pickle  # nosec B403
import pandas as pd
import logging
from django.conf import settings
from .models import LoanApplication
from users.models import UserFinancialData
from .utils import calculate_mock_cibil
from .utility.document_pipeline import process_loan_document

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(settings.BASE_DIR, 'loans', 'ml_model', 'risk_model.pkl')
LE_PATH = os.path.join(settings.BASE_DIR, 'loans', 'ml_model', 'label_encoder.pkl')

with open(MODEL_PATH, 'rb') as f:
    risk_model = pickle.load(f)  # nosec B301
with open(LE_PATH, 'rb') as f:
    label_encoder = pickle.load(f)  # nosec B301

def process_loan_submission(user, data, files):
    vault_updated = False
    file_fields = ['pan_card_file', 'aadhar_card_file', 'passport_photo']
    
    for field in file_fields:
     if field in files:
        setattr(user, field, files[field])
        vault_updated = True
    if 'age' in data: user.age = int(data['age']); vault_updated = True
    if vault_updated: user.save()

    ai_data = {}
    if 'ai_statuses' in data:
        try:
            ai_data = json.loads(data['ai_statuses'])
        except json.JSONDecodeError:
            logger.error("Invalid JSON in ai_statuses")

    loan = LoanApplication.objects.create(
        user=user,
        occupation=data.get('occupation', ''),
        occ=data.get('occ', ''),
        organization_name=data.get('organization_name', ''),
        monthly_income=data.get('monthly_income', 0),
        loan_type=data.get('loan_type', ''),
        loan_amount=data.get('loan_amount', 0),
        tenure=data.get('tenure', 0),
        nominee_name=data.get('nominee_name', ''),
        nominee_age=data.get('nominee_age', 0),
        guarantor_organization=data.get('guarantor_organization', ''),
        guarantor_income=data.get('guarantor_income') if data.get('guarantor_income') else None,
        doc_guarantor_photo=files.get('doc_guarantor_photo'),
        doc_guarantor_signature=files.get('doc_guarantor_signature'),
        bank_statements=files.get('bank_statements'),
        itr_document=files.get('itr_document'),
        salary_slips=files.get('salary_slips'),
        emp_id_card=files.get('emp_id_card'),
        doc_10th_cert=files.get('doc_10th_cert'),
        doc_12th_cert=files.get('doc_12th_cert'),
        doc_degree_cert=files.get('doc_degree_cert'),
        doc_admission_letter=files.get('doc_admission_letter'),
        doc_fee_structure=files.get('doc_fee_structure'),
        doc_guarantor_kyc=files.get('doc_guarantor_kyc'),
        doc_guarantor_financials=files.get('doc_guarantor_financials'),
        doc_agreement_sale=files.get('doc_agreement_sale'),
        doc_encumbrance_cert=files.get('doc_encumbrance_cert'),
        doc_building_plan=files.get('doc_building_plan'),
        doc_noc=files.get('doc_noc'),
        ai_verification_data=ai_data
    )

    all_approved = True
    for key, status_dict in ai_data.items():
        if status_dict.get('decision') != 'AUTO_APPROVE':
            all_approved = False
            break

    if all_approved and ai_data:
        loan.status = 'Pending'
        loan.save()

    return loan, vault_updated

def calculate_loan_risk(loan_id):
    loan = LoanApplication.objects.get(id=loan_id)
    financials = UserFinancialData.objects.get(username=loan.user.username)

    input_data = {
        'years_as_customer': float(financials.years_as_customer),
        'total_transaction_amount': float(financials.total_transaction_amount),
        'total_loan_amount': float(loan.loan_amount),
        'tenure_months': float(loan.tenure),
        'income': float(loan.monthly_income * 12),
        'pending_loan': float(financials.pending_loan),
        'fixed_deposits': float(financials.fixed_deposits),
        'credit_score': float(financials.credit_score)
    }

    input_df = pd.DataFrame([input_data])
    prediction = risk_model.predict(input_df)
    predicted_label = label_encoder.inverse_transform(prediction)[0]
    
    loan.risk_score = predicted_label
    loan.save()
    
    return predicted_label

def verify_document_with_ai(user, data):
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()

    if (first_name and last_name) and (not user.first_name or not user.last_name):
        user.first_name = first_name
        user.last_name = last_name
        user.save()

    return process_loan_document(
        image_file=data.get('document'),
        user=user,
        declared_org=data.get('declared_org', ''),
        declared_income=data.get('declared_income', ''),
        declared_years=data.get('declared_years', ''),
        expected_doc_type=data.get('expected_doc_type', 'Unknown')
    )

def recalculate_cibil_score(loan_id):
    loan = LoanApplication.objects.get(id=loan_id)
    financials = UserFinancialData.objects.get(username=loan.user.username)

    new_score = calculate_mock_cibil(
        years=financials.years_as_customer,
        transactions=financials.total_transaction_amount,
        fds=financials.fixed_deposits,
        pending_loans=financials.pending_loan,
        income=float(loan.monthly_income),
        loan_amount=float(loan.loan_amount),
        tenure=int(loan.tenure)
    )

    financials.credit_score = new_score
    financials.save()
    return new_score