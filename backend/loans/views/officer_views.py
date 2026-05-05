from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import permissions

from django.contrib.auth import get_user_model
from loans.models import LoanApplication
from loans.serializers import LoanApplicationSerializer
from users.permissions import IsOfficerUser

User = get_user_model()


class OfficerLoanViewSet(ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOfficerUser]

    def all_loans(self, request):
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

    def update_loan(self, request, pk=None):
        try:
            loan = LoanApplication.objects.get(id=pk)
        except LoanApplication.DoesNotExist:
            return Response({"error": "Loan not found"}, status=404)
        
        loan.status = request.data.get('status', loan.status)
        loan.officer_notes = request.data.get('officer_notes', loan.officer_notes)
        loan.risk_score = request.data.get('risk_score', loan.risk_score)
        loan.save()

        return Response({"message": "Loan updated successfully"})

    def stats(self, request):
        return Response({
            "gold": LoanApplication.objects.filter(loan_type__icontains='Gold').count(),
            "home": LoanApplication.objects.filter(loan_type__icontains='Home').count(),
            "personal": LoanApplication.objects.filter(loan_type__icontains='Personal').count(),
            "education": LoanApplication.objects.filter(loan_type__icontains='Education').count(),
            "pending": LoanApplication.objects.filter(status__icontains='Pending').count(),
            "approved": LoanApplication.objects.filter(status='Eligible').count(),
            "rejected": LoanApplication.objects.filter(status='Not Eligible').count()
        })
