from django.db import models
from apps.tracking.models import RiderProfile
from django.conf import settings

class DeliveryBonusRule(models.Model):
    """Tier-based bonus rules for rider deliveries."""
    min_deliveries = models.IntegerField(help_text="Minimum deliveries to qualify for this bonus")
    bonus_amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['min_deliveries']

    def __str__(self):
        return f"{self.min_deliveries} Deliveries: ₹{self.bonus_amount}"

class PenaltyRule(models.Model):
    """Rules for deductions based on various conditions."""
    penalty_name = models.CharField(max_length=100, help_text="e.g. Late Delivery, Failed Delivery")
    deduction_amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.penalty_name}: ₹{self.deduction_amount}"

class PayrollConfiguration(models.Model):
    """Global configuration for payroll (Singleton pattern)."""
    petrol_km_limit = models.IntegerField(default=5, help_text="KM limit for petrol allowance")
    petrol_rate_per_km = models.DecimalField(max_digits=5, decimal_places=2, default=3.0)
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Global Payroll Configuration"

    @classmethod
    def get_config(cls):
        config, created = cls.objects.get_or_create(id=1)
        return config

class RiderPayrollRule(models.Model):
    """Global rules for payroll calculations (Legacy - to be removed)."""

class RiderSettlement(models.Model):
    """Monthly settlement record for a rider."""
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
    )
    
    rider = models.ForeignKey(RiderProfile, on_delete=models.CASCADE, related_name='payroll_settlements')
    month = models.DateField(help_text="First day of the month")
    
    # Calculated Stats
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    deliveries_count = models.IntegerField(default=0)
    delivery_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_incentive = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_distance = models.DecimalField(max_digits=10, decimal_places=2, default=0.0) # In KM
    petrol_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Penalties
    late_deliveries = models.IntegerField(default=0)
    failed_deliveries = models.IntegerField(default=0)
    penalties_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    net_payable = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('rider', 'month')
        ordering = ['-month', '-created_at']

    def __str__(self):
        return f"Payroll {self.rider.user.username} - {self.month.strftime('%B %Y')}"

class RiderPaymentLog(models.Model):
    """Logs of actual payments made to riders."""
    settlement = models.OneToOneField(RiderSettlement, on_delete=models.CASCADE, related_name='payment_log')
    transaction_id = models.CharField(max_length=255, unique=True)
    payment_method = models.CharField(max_length=50)
    paid_at = models.DateTimeField(auto_now_add=True)
    admin_notes = models.TextField(blank=True)

    def __str__(self):
        return f"Payment Log for {self.settlement}"

class RiderWallet(models.Model):
    """Dedicated wallet for payroll and salary management."""
    rider = models.OneToOneField(RiderProfile, on_delete=models.CASCADE, related_name='payroll_wallet')
    total_salary_earned = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    total_salary_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    pending_payout = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    last_payout_date = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payroll Wallet: {self.rider.user.username}"
