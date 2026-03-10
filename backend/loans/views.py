from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import LoanApplicationSerializer
from .models import LoanApplication, ExternalFinancialHistory
from django.db import connection
from django.contrib.auth import get_user_model
import os
import pickle
import pandas as pd
from django.conf import settings
from .utils import calculate_mock_cibil 




class ApplyLoanView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        serializer = LoanApplicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyLoansView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        loans = LoanApplication.objects.filter(user=request.user).order_by('-created_at')
        serializer = LoanApplicationSerializer(loans, many=True)
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

        
        try:
            ext_data = ExternalFinancialHistory.objects.get(user=user)
            years_as_customer = ext_data.years_at_previous_bank
            total_transaction_amount = ext_data.total_transaction_amount
            pending_loan = ext_data.pending_loans_amount
            fixed_deposits = ext_data.fixed_deposits_amount
            
            credit_score = ext_data.calculated_cibil_score 
            
        except ExternalFinancialHistory.DoesNotExist:
            
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT years_as_customer, total_transaction_amount, pending_loan, fixed_deposits, credit_score 
                    FROM user_financial_data 
                    WHERE username = %s
                """, [user.username])
                row = cursor.fetchone()

            if not row:
                return Response({"error": "Financial data not found for user in either database."}, status=status.HTTP_400_BAD_REQUEST)

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

class NewUserLoanApplicationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        files = request.FILES
        user = request.user

        try:
           
            cibil_score = calculate_mock_cibil(
                years=float(data.get('years_at_previous_bank', 0)),
                transactions=float(data.get('total_transaction_amount', 0)),
                fds=float(data.get('fixed_deposits_amount', 0)),
                pending_loans=float(data.get('pending_loans_amount', 0))
            )

            
            history, created = ExternalFinancialHistory.objects.update_or_create(
                user=user,
                defaults={
                    'years_at_previous_bank': data.get('years_at_previous_bank', 0),
                    'annual_income': data.get('annual_income', 0),
                    'total_transaction_amount': data.get('total_transaction_amount', 0),
                    'fixed_deposits_amount': data.get('fixed_deposits_amount', 0),
                    'pending_loans_amount': data.get('pending_loans_amount', 0),
                    'calculated_cibil_score': cibil_score,
                }
            )

            
            if 'proof_of_oldbank' in files: history.proof_of_oldbank = files['proof_of_oldbank']
            if 'income_proof' in files: history.income_proof = files['income_proof']
            if 'bank_statements' in files: history.bank_statements = files['bank_statements']
            if 'fd_receipts' in files: history.fd_receipts = files['fd_receipts']
            if 'pending_loan_docs' in files: history.pending_loan_docs = files['pending_loan_docs']
            history.save()

            
            loan = LoanApplication.objects.create(
                user=user,
                loan_type=data.get('loan_type'),
                loan_amount=data.get('loan_amount'),
                tenure=data.get('tenure'),
                monthly_income=float(data.get('monthly_income', 0)),
                cibil_score=str(cibil_score),  
                
                
                id_proof=files.get('id_proof'),
                address_proof=files.get('address_proof'),
                salary_slips=files.get('salary_slips'),
                emp_id_card=files.get('emp_id_card'),
                nominee_name=data.get('nominee_name', ''),
                nominee_id_card=files.get('nominee_id_card'),
                nominee_address_proof=files.get('nominee_address_proof'),
                nominee_sign=files.get('nominee_sign'),
            )

            return Response({"message": "Application submitted!"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
