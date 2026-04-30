from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import LoanApplicationSerializer
from .models import LoanApplication
from users.models import UserFinancialData
from users.permissions import IsOfficerUser
from .services import (process_loan_submission, calculate_loan_risk, verify_document_with_ai, recalculate_cibil_score)

User = get_user_model()
class ApplyLoanView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            loan, vault_updated = process_loan_submission(request.user, request.data, request.FILES)
            
            return Response({
                "message": "Loan application submitted successfully!",
                "loan_id": loan.id,
                "vault_updated": vault_updated
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MyLoansView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        loans = LoanApplication.objects.filter(user=request.user).order_by('-created_at')
        serializer = LoanApplicationSerializer(loans, many=True)
        return Response(serializer.data)
    
class OfficerAllLoansView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOfficerUser]
    def get(self, request):
        loans = LoanApplication.objects.all().order_by('-created_at')
        serializer = LoanApplicationSerializer(loans, many=True, context={'request': request})
        data = serializer.data
        for item in data:
            try:
                user = User.objects.get(id=item['user'])
                item['applicant_name'] = user.username
            except User.DoesNotExist:
                item['applicant_name'] = "Unknown"
        return Response(data)

class OfficerUpdateLoanView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOfficerUser]
    def patch(self, request, pk):
        try:
            loan = LoanApplication.objects.get(id=pk)
        except LoanApplication.DoesNotExist:
            return Response({"error": "Loan not found"}, status=status.HTTP_404_NOT_FOUND)
            
        loan.status = request.data.get('status', loan.status)
        loan.officer_notes = request.data.get('officer_notes', loan.officer_notes)
        loan.risk_score = request.data.get('risk_score', loan.risk_score)
        loan.save()
        return Response({"message": "Loan updated successfully"})

class CalculateRiskView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOfficerUser]
    
    def get(self, request, pk):
        try:
            predicted_label = calculate_loan_risk(pk)
            return Response({"risk_score": predicted_label}, status=status.HTTP_200_OK)
            
        except LoanApplication.DoesNotExist:
            return Response({"error": "Loan application not found."}, status=status.HTTP_404_NOT_FOUND)
        except UserFinancialData.DoesNotExist:
            return Response({"error": "Financial ML data not found for this user."}, status=status.HTTP_400_BAD_REQUEST)

class CustomerLoanStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        user_loans = LoanApplication.objects.filter(user=request.user)
        return Response({
            "total_applied": user_loans.count(),
            "total_approved": user_loans.filter(status='Eligible').count(),
            "total_rejected": user_loans.filter(status='Not Eligible').count()
        }, status=status.HTTP_200_OK)

class OfficerLoanStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOfficerUser]
    def get(self, request):
        return Response({
            "gold": LoanApplication.objects.filter(loan_type__icontains='Gold').count(),
            "home": LoanApplication.objects.filter(loan_type__icontains='Home').count(),
            "personal": LoanApplication.objects.filter(loan_type__icontains='Personal').count(),
            "education": LoanApplication.objects.filter(loan_type__icontains='Education').count(),
            "pending": LoanApplication.objects.filter(status__icontains='Pending').count(),
            "approved": LoanApplication.objects.filter(status='Eligible').count(),
            "rejected": LoanApplication.objects.filter(status='Not Eligible').count()
        }, status=status.HTTP_200_OK)

class VerifyDocumentView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        if not request.data.get('document'):
            return Response({"error": "No document provided."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            ai_result = verify_document_with_ai(request.user, request.data)
            
            if ai_result.get("status") == "failed":
                return Response(ai_result, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            return Response(ai_result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": f"Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RecalculateCibilView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOfficerUser]
    
    def get(self, request, pk):
        try:
            new_score = recalculate_cibil_score(pk)
            return Response({"new_cibil_score": new_score}, status=status.HTTP_200_OK)
            
        except LoanApplication.DoesNotExist:
            return Response({"error": "Loan not found"}, status=status.HTTP_404_NOT_FOUND)
        except UserFinancialData.DoesNotExist:
            return Response({"error": "Financial data not found"}, status=status.HTTP_404_NOT_FOUND)