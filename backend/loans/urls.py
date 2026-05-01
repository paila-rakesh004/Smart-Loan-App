from django.urls import path
from .views import CustomerLoanViewSet, OfficerLoanViewSet, UtilityViewSet

customer = CustomerLoanViewSet.as_view
officer = OfficerLoanViewSet.as_view
utility = UtilityViewSet.as_view

urlpatterns = [
    path('apply/', customer({'post': 'apply_loan'})),
    path('my-loans/', customer({'get': 'my_loans'})),
    path('customer/stats/', customer({'get': 'stats'})),
    path('verify-document/', customer({'post': 'verify_document'})),

    path('officer/all-loans/', officer({'get': 'all_loans'})),
    path('officer/<int:pk>/update-status/', officer({'patch': 'update_loan'})),
    path('officer/stats/', officer({'get': 'stats'})),

    path('officer/<int:pk>/calculate-risk/', utility({'get': 'calculate_risk'})),
    path('officer/<int:pk>/recalculate-cibil/', utility({'get': 'recalculate_cibil'})),
]