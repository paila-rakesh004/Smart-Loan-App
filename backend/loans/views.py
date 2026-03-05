from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import LoanApplicationSerializer
from .models import LoanApplication
from django.db import connection
from django.contrib.auth import get_user_model

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