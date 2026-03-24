from django.urls import path
from .views import ApplyLoanView, MyLoansView, OfficerAllLoansView, OfficerUpdateLoanView, CalculateRiskView, NewUserLoanApplicationView, CustomerLoanStatsView, OfficerLoanStatsView,VerifyDocumentView

urlpatterns = [
    path('apply/', ApplyLoanView.as_view(), name='apply-loan'),
    path('my-loans/', MyLoansView.as_view(), name='my-loans'),
    path('officer/all-loans/', OfficerAllLoansView.as_view(), name='officer-all-loans'),
    path('officer/<int:pk>/update-status/', OfficerUpdateLoanView.as_view(), name='officer-update-loan'),
    path('officer/<int:pk>/calculate-risk/', CalculateRiskView.as_view(), name='calculate-risk'),
    path('apply-new-user/', NewUserLoanApplicationView.as_view(), name='apply-new-user'),
    path('customer/stats/', CustomerLoanStatsView.as_view(), name='customer-stats'),
    path('officer/stats/', OfficerLoanStatsView.as_view(), name='officer-stats'),
    path('verify-document/', VerifyDocumentView.as_view(), name='verify-document'),
]
