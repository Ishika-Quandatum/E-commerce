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
        ('Hold', 'Hold'),
        ('RETURN_HOLD', 'RETURN_HOLD'),
        ('READY_FOR_PAYOUT', 'READY_FOR_PAYOUT'),
        ('SETTLED', 'SETTLED'),
        ('REFUND_HOLD', 'REFUND_HOLD'),
        ('REFUNDED', 'REFUNDED'),
    )
    METHOD_CHOICES = (
        ('bank_transfer', 'Bank Transfer'),
        ('upi', 'UPI'),
        ('wallet', 'Wallet'),
        ('manual', 'Manual'),
    )
    SETTLEMENT_STATUS_CHOICES = (
        ('RETURN_HOLD', 'RETURN_HOLD'),
        ('READY_FOR_PAYOUT', 'READY_FOR_PAYOUT'),
        ('SETTLED', 'SETTLED'),
        ('REFUND_HOLD', 'REFUND_HOLD'),
        ('REFUNDED', 'REFUNDED'),
    )
    REFUND_STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Success', 'Success'),
        ('Failed', 'Failed'),
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

    # Professional settlement & return windows fields
    returnEligibleUntil = models.DateTimeField(null=True, blank=True)
    settlementStatus = models.CharField(
        max_length=20, 
        choices=SETTLEMENT_STATUS_CHOICES, 
        default='RETURN_HOLD'
    )
    refundStatus = models.CharField(
        max_length=20, 
        choices=REFUND_STATUS_CHOICES, 
        blank=True, 
        null=True
    )
    settlementReleasedAt = models.DateTimeField(null=True, blank=True)
    returnRequestedAt = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Auto-fill returnEligibleUntil from due_date if not present
        if not self.returnEligibleUntil and self.due_date:
            self.returnEligibleUntil = self.due_date

        # 1. Update settlementStatus if status was changed from outside
        if self.status == 'Paid' and self.settlementStatus != 'SETTLED':
            self.settlementStatus = 'SETTLED'
            from django.utils import timezone
            if not self.settlementReleasedAt:
                self.settlementReleasedAt = timezone.now()
        elif self.status == 'Refund Hold' and self.settlementStatus != 'REFUND_HOLD':
            self.settlementStatus = 'REFUND_HOLD'
            from django.utils import timezone
            if not self.returnRequestedAt:
                self.returnRequestedAt = timezone.now()
        elif self.status == 'Cancelled' and self.settlementStatus != 'REFUNDED':
            self.settlementStatus = 'REFUNDED'
            self.refundStatus = 'Success'
        elif self.status == 'Pending' and self.settlementStatus not in ['RETURN_HOLD', 'READY_FOR_PAYOUT']:
            from django.utils import timezone
            if self.returnEligibleUntil and timezone.now() > self.returnEligibleUntil:
                self.settlementStatus = 'READY_FOR_PAYOUT'
            else:
                self.settlementStatus = 'RETURN_HOLD'
        elif self.status == 'Hold' and self.settlementStatus != 'REFUND_HOLD':
            self.settlementStatus = 'RETURN_HOLD'

        # 2. Update old status based on settlementStatus
        if self.settlementStatus == 'RETURN_HOLD':
            self.status = 'Pending'
        elif self.settlementStatus == 'READY_FOR_PAYOUT':
            self.status = 'Pending'
        elif self.settlementStatus == 'SETTLED':
            self.status = 'Paid'
            from django.utils import timezone
            if not self.settlementReleasedAt:
                self.settlementReleasedAt = timezone.now()
        elif self.settlementStatus == 'REFUND_HOLD':
            self.status = 'Refund Hold'
            from django.utils import timezone
            if not self.returnRequestedAt:
                self.returnRequestedAt = timezone.now()
        elif self.settlementStatus == 'REFUNDED':
            self.status = 'Cancelled'
            self.refundStatus = 'Success'

        super().save(*args, **kwargs)

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
