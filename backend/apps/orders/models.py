from django.db import models
from django.conf import settings
from apps.products.models import Product


class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Packed', 'Packed'),
        ('Dispatch Queue', 'Dispatch Queue'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Returned', 'Returned'),
        ('Cancelled', 'Cancelled'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.CASCADE, related_name='orders', null=True, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    payment_method = models.CharField(max_length=50)
    address = models.TextField()
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    phone = models.CharField(max_length=20)
    alternative_phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None
        if not is_new:
            old_status = Order.objects.get(pk=self.pk).status
        
        super().save(*args, **kwargs)
        
        if self.status == 'Delivered' and old_status != 'Delivered':
            self.create_vendor_payout()
        
        if self.status == 'Returned' and old_status != 'Returned':
            self.hold_vendor_payout()

    def create_vendor_payout(self):
        from apps.payments.models import VendorPayout
        import uuid
        from django.utils import timezone
        from django.apps import apps
        from datetime import timedelta
        
        if not self.vendor:
            return

        # Check if payout already exists
        if VendorPayout.objects.filter(order=self).exists():
            return

        from apps.core.models import PlatformSetting
        platform_settings = PlatformSetting.get_settings()
        
        commission_rate = platform_settings.global_commission
        product_amount = self.total_price - self.shipping_charge - self.tax_amount
        commission_amount = (product_amount * commission_rate) / 100
        final_amount = product_amount - commission_amount
        transaction_id = f"PAY-{uuid.uuid4().hex[:8].upper()}"

        delivered_date = timezone.now()
        max_days = 7  # default fallback if no policies exist
        
        ReturnPolicy = apps.get_model('returns', 'ReturnPolicy')
        
        # Iterate over items in the order to calculate return deadline
        for item in self.items.all():
            product = item.product
            days = None
            
            # 1. Try Subcategory policy
            if product.subcategory:
                sub_policy = ReturnPolicy.objects.filter(category=product.subcategory).first()
                if sub_policy:
                    days = sub_policy.return_window_days if sub_policy.is_returnable else 0
                    
            # 2. Try Category policy if no subcategory policy
            if days is None and product.category:
                cat_policy = ReturnPolicy.objects.filter(category=product.category).first()
                if cat_policy:
                    days = cat_policy.return_window_days if cat_policy.is_returnable else 0
                    
            # 3. Try global default policy (category is null)
            if days is None:
                global_policy = ReturnPolicy.objects.filter(category=None).first()
                if global_policy:
                    days = global_policy.return_window_days if global_policy.is_returnable else 0
                    
            # 4. Fallback if no policy at all
            if days is None:
                days = 7
                
            max_days = max(max_days, days)

        return_eligible_until = delivered_date + timedelta(days=max_days)
        due_date = return_eligible_until  # Match due date to return eligibility date

        VendorPayout.objects.create(
            transaction_id=transaction_id,
            vendor=self.vendor,
            order=self,
            product_amount=product_amount,
            total_amount=self.total_price,
            commission_rate=commission_rate,
            commission_amount=commission_amount,
            final_amount=final_amount,
            status='Pending',
            settlementStatus='RETURN_HOLD',
            returnEligibleUntil=return_eligible_until,
            due_date=due_date
        )

    def hold_vendor_payout(self):
        from apps.payments.models import VendorPayout
        payout = VendorPayout.objects.filter(order=self).first()
        if payout and payout.settlementStatus != 'SETTLED':
            payout.settlementStatus = 'REFUND_HOLD'
            payout.save()

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"

    class Meta:
        ordering = ['-created_at']


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    size = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in Order #{self.order.id}"

    @property
    def subtotal(self):
        return self.price * self.quantity
