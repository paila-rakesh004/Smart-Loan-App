from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status, permissions

from loans.models import LoanApplication
from loans.serializers import LoanApplicationSerializer
from loans.services import process_loan_submission, verify_document_with_ai


class CustomerLoanViewSet(ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def apply_loan(self, request):
        try:
            loan, vault_updated = process_loan_submission(request.user, request.data, request.FILES)
            return Response({
                "message": "Loan application submitted successfully!",
                "loan_id": loan.id,
                "vault_updated": vault_updated
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def my_loans(self, request):
        loans = LoanApplication.objects.filter(user=request.user).order_by('-created_at')
        serializer = LoanApplicationSerializer(loans, many=True, context={'request': request})
        return Response(serializer.data)

    def stats(self, request):
        user_loans = LoanApplication.objects.filter(user=request.user)

        return Response({
            "total_applied": user_loans.count(),
            "total_approved": user_loans.filter(status='Eligible').count(),
            "total_rejected": user_loans.filter(status='Not Eligible').count()
        })
    
    def verify_document(self, request):
        if not request.data.get('document'):
            return Response({"error": "No document provided."}, status=400)

        try:
            ai_result = verify_document_with_ai(request.user, request.data)

            if ai_result.get("status") == "failed":
                return Response(ai_result, status=422)

            return Response(ai_result)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
