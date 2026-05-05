from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
import secrets
import sys

def generate_and_send_otp(user):
    
    if user.otp_expiry and timezone.now() < user.otp_expiry:
        time_remaining = (user.otp_expiry - timezone.now()).total_seconds()
        if time_remaining > 90:
            return False, f"OTP already sent. Please wait {int(time_remaining)} seconds."

    otp = str(secrets.randbelow(1000000)).zfill(6)
    user.reset_otp = otp
    user.otp_expiry = timezone.now() + timedelta(minutes=2)
    user.save()

    if user.email:
        mail_sender = getattr(sys.modules.get("users.views"), "send_mail", send_mail)
        mail_sender(
            subject="Your Password Reset OTP",
            message=f"Hello {user.username},\n\nYour OTP for password reset is: {otp}\n\nThis OTP is valid for exactly 2 minutes.",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True, "OTP sent successfully to your registered email."
    
    return False, "No email address linked to this username."
