from django.db import models
from django.conf import settings
from apps.orders.models import Order
from apps.vendors.models import Vendor
from django.db.models.signals import post_save
from django.dispatch import receiver


class Payment(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('COD Pending', 'COD Pending'),
        ('COD Collected', 'COD Collected'),
        ('Refunded', 'Refunded'),
        ('Failed', 'Failed'),
        ('Cancelled', 'Cancelled'),
        ('Chargeback', 'Chargeback'),
    )
    METHOD_CHOICES = (
        ('cod', 'Cash on Delivery'),
        ('card', 'Credit/Debit Card'),
        ('upi', 'UPI'),
        ('netbanking', 'Net Banking'),
        ('wallet', 'Wallet'),
    )
    
    REFUND_STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Success', 'Success'),
        ('Failed', 'Failed'),
    )

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='cod')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    gateway_reference = models.CharField(max_length=255, blank=True, null=True)
    refund_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    refund_status = models.CharField(max_length=20, choices=REFUND_STATUS_CHOICES, blank=True, null=True)
    refund_method = models.CharField(max_length=20, choices=METHOD_CHOICES, blank=True, null=True)
    refund_date = models.DateTimeField(blank=True, null=True)
    refund_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment #{self.id} for Order #{self.order.id} - {self.status}"

    class Meta:
        ordering = ['-created_at']


class VendorPayout(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Refund Hold', 'Refund Hold'),
        ('Cancelled', 'Cancelled'),
        ('Released', 'Released'),
        ('Failed', 'Failed'),
    )
    METHOD_CHOICES = (
        ('bank_transfer', 'Bank Transfer'),
        ('upi', 'UPI'),
        ('wallet', 'Wallet'),
        ('manual', 'Manual'),
    )

    transaction_id = models.CharField(max_length=255, unique=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='payouts')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payouts')
    product_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    payout_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='bank_transfer')
    reference_number = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payout #{self.transaction_id} to {self.vendor.shop_name}"

    class Meta:
        ordering = ['-created_at']

class CustomerWallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wallet: {self.user.username} - Balance: {self.balance}"

class WalletTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('Credit', 'Credit'),
        ('Debit', 'Debit'),
        ('Refund', 'Refund'),
    )
    wallet = models.ForeignKey(CustomerWallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    description = models.TextField()
    reference_id = models.CharField(max_length=100, blank=True, null=True) # Order ID or Return ID
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type}: {self.amount} for {self.wallet.user.username}"

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_customer_wallet(sender, instance, created, **kwargs):
    if created and instance.role == 'user':
        CustomerWallet.objects.get_or_create(user=instance)
