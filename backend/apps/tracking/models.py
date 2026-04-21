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
        ('Pending', 'Pending'),
        ('Packed', 'Packed'),
        ('Ready for Dispatch', 'Ready for Dispatch'),
        ('Assigned', 'Assigned'),
        ('Dispatched', 'Dispatched'),
        ('Out for Delivery', 'Out for Delivery'),
        ('In Transit', 'In Transit'),
        ('Reached', 'Reached'),
        ('Delivered', 'Delivered'),
        ('Failed', 'Failed'),
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


@receiver(post_save, sender=Order)
def create_shipment(sender, instance, created, **kwargs):
    if created:
        Shipment.objects.create(order=instance, status='Pending')
