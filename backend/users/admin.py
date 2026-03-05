from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_customer', 'is_officer', 'phone_number')
    list_filter = ('is_customer', 'is_officer', 'is_staff', 'is_active')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Profile Fields', {
            'fields': ('is_customer', 'is_officer', 'phone_number', 'pan_number', 'aadhar_number', 'address')
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Profile Fields', {
            'fields': ('is_customer', 'is_officer', 'phone_number', 'pan_number', 'aadhar_number', 'address')
        }),
    )