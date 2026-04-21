from django.db import models
from apps.users.models import User
from apps.orders.models import Order
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class RiderProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='rider_profile')
    vehicle_number = models.CharField(max_length=50, blank=True)
    vehicle_type = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    current_lat = models.FloatField(null=True, blank=True)
    current_lng = models.FloatField(null=True, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    availability_status = models.CharField(
        max_length=20, 
        choices=[('Online', 'Online'), ('Offline', 'Offline')],
        default='Offline'
    )
    join_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Rider: {self.user.username}"


class Shipment(models.Model):
    STATUS_CHOICES = [
        ('Pending Assignment', 'Pending Assignment'),
        ('Assigned', 'Assigned'),
        ('Dispatched', 'Dispatched'),
        ('In Transit', 'In Transit'),
        ('Delivered', 'Delivered'),
        ('Failed', 'Failed'),
        ('Rejected', 'Rejected'),
        ('Returned', 'Returned')
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipment')
    rider = models.ForeignKey(RiderProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_shipments')
    tracking_number = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    delivery_otp = models.CharField(max_length=6, blank=True, null=True)
    parcel_weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    label_printed = models.BooleanField(default=False)
    estimated_delivery_time = models.DateTimeField(null=True, blank=True)
    failed_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Shipment {self.tracking_number} - {self.status}"


class TrackingHistory(models.Model):
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='history')
    status = models.CharField(max_length=30)
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.shipment.tracking_number} - {self.status}"





class Attendance(models.Model):
    rider = models.ForeignKey(RiderProfile, on_delete=models.CASCADE, related_name='attendance_logs')
    check_in = models.DateTimeField()
    check_out = models.DateTimeField(null=True, blank=True)
    date = models.DateField(auto_now_add=True)
    working_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.rider.user.username} - {self.date}"


class SalaryConfiguration(models.Model):
    rider = models.OneToOneField(RiderProfile, on_delete=models.CASCADE, related_name='salary_config')
    monthly_fixed_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    per_delivery_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    fuel_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Salary Rules: {self.rider.user.username}"


class RiderWallet(models.Model):
    rider = models.OneToOneField(RiderProfile, on_delete=models.CASCADE, related_name='wallet')
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_earned = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    pending_payout = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wallet: {self.rider.user.username} (${self.current_balance})"


class Transaction(models.Model):
    TYPE_CHOICES = [
        ('Credit', 'Credit (Commission)'),
        ('Debit', 'Debit (Payout)'),
        ('Bonus', 'Bonus'),
        ('Penalty', 'Penalty'),
    ]
    wallet = models.ForeignKey(RiderWallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type}: {self.amount} for {self.wallet.rider.user.username}"


# Signal to create Wallet and SalaryConfig for new Riders
@receiver(post_save, sender=RiderProfile)
def create_rider_financials(sender, instance, created, **kwargs):
    if created:
        RiderWallet.objects.create(rider=instance)
        SalaryConfiguration.objects.create(rider=instance)

