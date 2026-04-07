from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import LoanApplicationSerializer
from .models import LoanApplication
from django.db import connection
from django.contrib.auth import get_user_model
import os
import json
import pickle
import pandas as pd
from django.conf import settings
from .utils import calculate_mock_cibil 
from django.db.models import Q
from .utility.document_pipeline import process_loan_document
from rest_framework.permissions import IsAuthenticated

class ApplyLoanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data
        files = request.FILES

        vault_updated = False
        
        if 'pan_card_file' in files:
            user.pan_card_file = files['pan_card_file']
            vault_updated = True
            
        if 'aadhar_card_file' in files:
            user.aadhar_card_file = files['aadhar_card_file']
            vault_updated = True
            
        if 'passport_photo' in files:
            user.passport_photo = files['passport_photo']
            vault_updated = True
            
        if 'age' in data:
            user.age = int(data['age'])
            vault_updated = True

        if vault_updated:
            user.save()

        try:
            ai_data = {}
            if 'ai_statuses' in data:
                try:
                    ai_data = json.loads(data['ai_statuses'])
                except json.JSONDecodeError:
                    pass

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
                nominee_age=data.get('nominee_age',0),
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

            return Response({
                "message": "Loan application submitted successfully!",
                "loan_id": loan.id,
                "vault_updated": vault_updated
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Loan Application Error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class MyLoansView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        loans = LoanApplication.objects.filter(user=request.user).order_by('-created_at')
        serializer = LoanApplicationSerializer(loans, many=True)
        print(serializer.data)
        return Response(serializer.data)

User = get_user_model()
class OfficerAllLoansView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        loans = LoanApplication.objects.all().order_by('-created_at')
        serializer = LoanApplicationSerializer(loans, many=True, context={'request': request})
        data = serializer.data

        with connection.cursor() as cursor:
            for item in data:
                user_id = item['user']
                
                try:
                    user = User.objects.get(id=user_id)
                    item['applicant_name'] = user.username
                except User.DoesNotExist:
                    item['applicant_name'] = "Unknown"
                    user = None

                item['cibil_score'] = "N/A"
                if user:
                    try:
                        cursor.execute("SELECT credit_score FROM user_financial_data WHERE username = %s", [user.username])
                        row = cursor.fetchone()
                        
                        if row:
                            item['cibil_score'] = row[0]
                    except Exception:
                        pass 
        
        return Response(data)
class OfficerUpdateLoanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            loan = LoanApplication.objects.get(id=pk)
        except LoanApplication.DoesNotExist:
            return Response({"error": "Loan not found"}, status=status.HTTP_404_NOT_FOUND)

        loan.status = request.data.get('status', loan.status)
        loan.officer_notes = request.data.get('officer_notes', loan.officer_notes)
        loan.risk_score = request.data.get('risk_score', loan.risk_score)
        
        if 'cibil_score' in request.data and request.data['cibil_score'] != "N/A":
            loan.cibil_score = request.data['cibil_score']

        loan.save()
        return Response({"message": "Loan updated successfully"})
    

MODEL_PATH = os.path.join(settings.BASE_DIR, 'loans', 'ml_model', 'risk_model.pkl')
LE_PATH = os.path.join(settings.BASE_DIR, 'loans', 'ml_model', 'label_encoder.pkl')

with open(MODEL_PATH, 'rb') as f:
    risk_model = pickle.load(f)
with open(LE_PATH, 'rb') as f:
    label_encoder = pickle.load(f)


class CalculateRiskView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            loan = LoanApplication.objects.get(id=pk)
            user = loan.user
        except LoanApplication.DoesNotExist:
            return Response({"error": "Loan not found"}, status=status.HTTP_404_NOT_FOUND)

       
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT years_as_customer, total_transaction_amount, pending_loan, fixed_deposits, credit_score 
                FROM user_financial_data 
                WHERE username = %s
            """, [user.username])
            row = cursor.fetchone()

       
        if not row:
            return Response({"error": "Financial ML data not found for this user in the database."}, status=status.HTTP_400_BAD_REQUEST)

        
        years_as_customer, total_transaction_amount, pending_loan, fixed_deposits, credit_score = row

        
        input_data = {
            'years_as_customer': float(years_as_customer),
            'total_transaction_amount': float(total_transaction_amount),
            'total_loan_amount': float(loan.loan_amount),
            'tenure_months': float(loan.tenure),
            'income': float(loan.monthly_income * 12), 
            'pending_loan': float(pending_loan),
            'fixed_deposits': float(fixed_deposits),
            'credit_score': float(credit_score)
        }

        
        input_df = pd.DataFrame([input_data])
        prediction = risk_model.predict(input_df)
        predicted_label = label_encoder.inverse_transform(prediction)[0]

        
        loan.risk_score = predicted_label
        loan.save()

        return Response({"risk_score": predicted_label}, status=status.HTTP_200_OK)

class CustomerLoanStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
       
        user_loans = LoanApplication.objects.filter(user=user)
        
        total_applied = user_loans.count()
        total_approved = user_loans.filter(status='Approved').count()
        total_rejected = user_loans.filter(status='Rejected').count()
        
        return Response({
            "total_applied": total_applied,
            "total_approved": total_approved,
            "total_rejected": total_rejected
        }, status=status.HTTP_200_OK)




class OfficerLoanStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        
        gold = LoanApplication.objects.filter(loan_type__icontains='Gold').count()
        home = LoanApplication.objects.filter(loan_type__icontains='Home').count()
        personal = LoanApplication.objects.filter(loan_type__icontains='Personal').count()
        education = LoanApplication.objects.filter(loan_type__icontains='Education').count()
        pending = LoanApplication.objects.filter(status__icontains='Pending').count()
        
        
        my_approved = LoanApplication.objects.filter(status='Approved').count() 
        my_rejected = LoanApplication.objects.filter(status='Rejected').count()

        return Response({
            "gold": gold,
            "home": home,
            "personal": personal,
            "education": education,
            "pending": pending,
            "approved": my_approved,
            "rejected": my_rejected
        }, status=status.HTTP_200_OK)
    

class VerifyDocumentView(APIView):
   
    permission_classes = [IsAuthenticated]

    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        document = request.FILES.get('document')
        expected_doc_type = request.POST.get('expected_doc_type','Unknown')
        declared_org = request.POST.get('organization_name', '')
        declared_income = request.POST.get('monthly_income', '')
        declared_years = request.POST.get('years_at_previous_bank', '')
        first_name = request.POST.get('first_name', '').strip()
        last_name = request.POST.get('last_name', '').strip()
        if not document:
            return Response({"error": "No document provided."}, status=status.HTTP_400_BAD_REQUEST)

        if first_name and last_name:
            
            if not request.user.first_name or not request.user.last_name:
                request.user.first_name = first_name
                request.user.last_name = last_name
                request.user.save() 
                print(f"Permanently saved Legal Name for {request.user.username}: {first_name} {last_name}")
        try:
            ai_result = process_loan_document(image_file=document,user=request.user,declared_org=declared_org,declared_income=declared_income,declared_years=declared_years,expected_doc_type=expected_doc_type)
            print(ai_result)
            
            if ai_result.get("status") == "failed":
                return Response(ai_result, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            
            return Response(ai_result, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"CRASH IN AI PROCESSING: {str(e)}")
            return Response(
                {"error": f"Server Error during AI processing: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RecalculateCibilView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            loan = LoanApplication.objects.get(id=pk)
            user = loan.user
        except LoanApplication.DoesNotExist:
            return Response({"error": "Loan not found"}, status=status.HTTP_404_NOT_FOUND)

      
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT years_as_customer, total_transaction_amount, fixed_deposits, pending_loan 
                FROM user_financial_data 
                WHERE username = %s
            """, [user.username])
            row = cursor.fetchone()

        if not row:
            return Response({"error": "ML data not found"}, status=status.HTTP_400_BAD_REQUEST)

        years, transactions, fds, pending_loans = row

        
        income = float(loan.monthly_income)
        loan_amount = float(loan.loan_amount)
        tenure = int(loan.tenure)

  
        new_score = calculate_mock_cibil(
            years=years, 
            transactions=transactions, 
            fds=fds, 
            pending_loans=pending_loans, 
            income=income, 
            loan_amount=loan_amount, 
            tenure=tenure
        )

       
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE user_financial_data 
                SET credit_score = %s 
                WHERE username = %s
            """, [new_score, user.username])

        return Response({"new_cibil_score": new_score}, status=status.HTTP_200_OK)