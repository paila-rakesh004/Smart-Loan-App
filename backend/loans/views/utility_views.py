from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from users.permissions import IsOfficerUser
from loans.models import LoanApplication
from users.models import UserFinancialData
from loans.services import calculate_loan_risk, recalculate_cibil_score

class UtilityViewSet(ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOfficerUser]
    parser_classes = (MultiPartParser, FormParser)

    def calculate_risk(self, request, pk=None):
        try:
            predicted_label = calculate_loan_risk(pk)
            return Response({"risk_score": predicted_label})
           
        except LoanApplication.DoesNotExist:
            return Response({"error": "Loan application not found."}, status=status.HTTP_404_NOT_FOUND)
        except UserFinancialData.DoesNotExist:
            return Response({"error": "Financial ML data not found for this user."}, status=status.HTTP_400_BAD_REQUEST)


    def recalculate_cibil(self, request, pk=None):
        try:
            new_score = recalculate_cibil_score(pk)
            return Response({"new_cibil_score": new_score})

        except LoanApplication.DoesNotExist:
            return Response({"error": "Loan not found"}, status=404)
        except UserFinancialData.DoesNotExist:
            return Response({"error": "Financial data not found"}, status=404)
