from django.contrib import admin
from .models import LoanApplication

@admin.register(LoanApplication)
class LoanApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'loan_type', 'loan_amount', 'status', 'created_at')
    list_filter = ('status', 'loan_type')
    search_fields = ('user__username', 'nominee_name')