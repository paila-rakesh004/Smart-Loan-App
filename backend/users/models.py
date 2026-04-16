from django.contrib.auth.models import AbstractUser
from django.db import models
from django.dispatch import receiver

class User(AbstractUser):
    
    is_customer = models.BooleanField(default=False)
    is_officer = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    pan_number = models.CharField(max_length=10, blank=True, default="")
    aadhar_number = models.CharField(max_length=12, blank=True, default="")
    address = models.TextField(blank=True, default="")
    age = models.IntegerField(null=True, blank=True)
    reset_otp = models.CharField(max_length=6, blank=True,default="")
    otp_expiry = models.DateTimeField(blank=True, null=True)

    
    pan_card_file = models.FileField(upload_to='vault/pan_cards/', null=True, blank=True)
    aadhar_card_file = models.FileField(upload_to='vault/aadhar_cards/', null=True, blank=True)
    passport_photo = models.FileField(upload_to='vault/photos/', null=True, blank=True)
    
    def __str__(self):
        return self.username

@receiver(models.signals.pre_save, sender=User)
def auto_delete_file_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return False
    try:
        old_user = User.objects.get(pk=instance.pk)
    except User.DoesNotExist:
        return False

    if old_user.pan_card_file and old_user.pan_card_file != instance.pan_card_file:
        old_user.pan_card_file.delete(save=False)

    if old_user.aadhar_card_file and old_user.aadhar_card_file != instance.aadhar_card_file:
        old_user.aadhar_card_file.delete(save=False)
    
    if old_user.passport_photo and old_user.passport_photo != instance.passport_photo:
        old_user.passport_photo.delete(save=False)