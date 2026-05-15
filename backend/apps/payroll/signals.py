from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.tracking.models import RiderProfile
from .models import RiderWallet

@receiver(post_save, sender=RiderProfile)
def create_payroll_wallet(sender, instance, created, **kwargs):
    if created:
        RiderWallet.objects.get_or_create(rider=instance)
