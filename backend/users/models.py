from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_customer = models.BooleanField(default=False)
    is_officer = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15,unique=True,blank=True, null=True)
    pan_number = models.CharField(max_length=10, blank=True, null=True)
    aadhar_number = models.CharField(max_length=12, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.username