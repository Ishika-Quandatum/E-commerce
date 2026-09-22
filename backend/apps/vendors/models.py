from django.db import models
from django.conf import settings
from django.utils import timezone


class Vendor(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vendor_profile')
    shop_name = models.CharField(max_length=255)
    shop_type = models.CharField(max_length=100)
    # Branding & Info
    shop_logo = models.ImageField(upload_to='vendor_logos/', null=True, blank=True)
    shop_banner = models.ImageField(upload_to='vendor_banners/', null=True, blank=True)
    shop_description = models.TextField(null=True, blank=True)
    
    # Logistics & Address
    shop_address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    pincode = models.CharField(max_length=10, null=True, blank=True)
    pickup_contact = models.CharField(max_length=15, null=True, blank=True)
    alternative_contact = models.CharField(max_length=15, null=True, blank=True)
    
    # Shop Timing
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    working_days = models.JSONField(default=list, blank=True) # e.g. ["Mon", "Tue", ...]
    
    # Logistics Settings
    pickup_availability = models.BooleanField(default=True)
    delivery_radius = models.DecimalField(max_digits=10, decimal_places=2, default=10.0) # In KM
    estimated_dispatch_time = models.CharField(max_length=50, null=True, blank=True) # e.g. "24 Hours"

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    store_slug = models.SlugField(max_length=255, unique=True, null=True, blank=True)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)  # Percentage
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.shop_name} ({self.user.username})"

    class Meta:
        ordering = ['-created_at']

class Follower(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='followers')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='following_vendors')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('vendor', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} following {self.vendor.shop_name}"


class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField()
    max_promotions = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['price', 'duration_days']

    def __str__(self):
        return self.name


class VendorSubscription(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACTIVE', 'Active'),
        ('EXPIRED', 'Expired'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    )

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name='subscriptions')
    payment_id = models.CharField(max_length=255, unique=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def is_active(self):
        now = timezone.now()
        return (
            self.status == 'ACTIVE'
            and self.start_date is not None
            and self.end_date is not None
            and self.start_date <= now <= self.end_date
        )


def has_active_subscription(vendor):
    now = timezone.now()
    return VendorSubscription.objects.filter(
        vendor=vendor,
        status='ACTIVE',
        start_date__lte=now,
        end_date__gte=now,
    ).exists()


def get_active_subscription(vendor):
    now = timezone.now()
    return VendorSubscription.objects.filter(
        vendor=vendor,
        status='ACTIVE',
        start_date__lte=now,
        end_date__gte=now,
    ).select_related('plan').order_by('-end_date').first()
