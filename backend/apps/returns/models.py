from django.db import models
from django.conf import settings
from apps.orders.models import Order, OrderItem
from apps.vendors.models import Vendor
from apps.products.models import Product
from apps.tracking.models import RiderProfile

class ReturnRequest(models.Model):
    STATUS_CHOICES = (
        ('Return Requested', 'Return Requested'),
        ('Approved by Vendor', 'Approved by Vendor'),
        ('Pickup Assigned', 'Pickup Assigned'),
        ('Picked Up from Customer', 'Picked Up from Customer'),
        ('Delivered to Vendor', 'Delivered to Vendor'),
        ('Vendor Confirmed Received', 'Vendor Confirmed Received'),
        ('Inspection Started', 'Inspection Started'),
        ('Return Accepted', 'Return Accepted'),
        ('Return Rejected by Vendor', 'Return Rejected by Vendor'),
        ('Admin Review', 'Admin Review'),
        ('Refund Approved', 'Refund Approved'),
        ('Refund Processed', 'Refund Processed'),
        ('Refund Rejected', 'Refund Rejected'),
        ('Cancelled', 'Cancelled'),
    )
    
    REFUND_METHOD_CHOICES = (
        ('Original Payment Method', 'Original Payment Method'),
        ('Wallet', 'Wallet'),
        ('Bank Transfer', 'Bank Transfer'),
        ('UPI', 'UPI'),
    )

    INSPECTION_STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='return_requests')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customer_returns')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='vendor_returns')
    rider = models.ForeignKey(RiderProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='return_pickups')
    
    reason = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Return Requested')
    refund_method = models.CharField(max_length=30, choices=REFUND_METHOD_CHOICES, default='Wallet')
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Inspection Fields
    inspection_status = models.CharField(max_length=20, choices=INSPECTION_STATUS_CHOICES, default='Pending')
    inspection_notes = models.TextField(blank=True, null=True)
    inspection_reason = models.CharField(max_length=100, blank=True, null=True)
    vendor_decision = models.CharField(max_length=30, blank=True, null=True) # Return Accepted / Return Rejected by Vendor
    inspection_completed_at = models.DateTimeField(null=True, blank=True)
    
    # Refund Audit Fields
    refund_account_details = models.TextField(blank=True, null=True) # Bank info or UPI ID
    refund_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    refund_date = models.DateTimeField(null=True, blank=True)
    
    rejection_reason = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Return Request #{self.id} for Order #{self.order.id}"

    class Meta:
        ordering = ['-created_at']

class ReturnItem(models.Model):
    return_request = models.ForeignKey(ReturnRequest, on_delete=models.CASCADE, related_name='items')
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    reason = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.quantity} x {self.order_item.product.name} in Return Request #{self.return_request.id}"

class ReturnImage(models.Model):
    return_request = models.ForeignKey(ReturnRequest, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='returns/proofs/')
    is_inspection_image = models.BooleanField(default=False) # True if uploaded by vendor during inspection
    created_at = models.DateTimeField(auto_now_add=True)

class ReturnStatusHistory(models.Model):
    return_request = models.ForeignKey(ReturnRequest, on_delete=models.CASCADE, related_name='history')
    status = models.CharField(max_length=30)
    description = models.TextField(blank=True)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Return status histories"

class ExchangeRequest(models.Model):
    return_request = models.OneToOneField(ReturnRequest, on_delete=models.CASCADE, related_name='exchange')
    new_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='exchange_requests')
    new_size = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=20, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

class ReturnPolicy(models.Model):
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE, related_name='return_policies', null=True, blank=True)
    return_window_days = models.PositiveIntegerField(default=7)
    is_returnable = models.BooleanField(default=True)
    policy_text = models.TextField()

    def __str__(self):
        return f"Policy for {self.category.name if self.category else 'Global'}"
