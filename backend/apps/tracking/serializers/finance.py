from rest_framework import serializers
from django.db import models
from apps.tracking.models import (
    RiderWallet, SalaryConfiguration, Transaction, CODCollection,
    RiderMonthlySettlement, RiderWalletTransaction, RiderSalaryTransaction, RiderFinancialLog, Shipment
)

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class RiderWalletTransactionSerializer(serializers.ModelSerializer):
    rider_name = serializers.ReadOnlyField(source='rider.user.get_full_name')
    class Meta:
        model = RiderWalletTransaction
        fields = '__all__'
        read_only_fields = ['rider', 'status', 'created_at', 'verified_at']

class RiderSalaryTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderSalaryTransaction
        fields = '__all__'

class RiderMonthlySettlementSerializer(serializers.ModelSerializer):
    rider_name = serializers.ReadOnlyField(source='rider.user.get_full_name')
    month_display = serializers.SerializerMethodField()

    class Meta:
        model = RiderMonthlySettlement
        fields = '__all__'

    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')

class SalaryConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryConfiguration
        fields = '__all__'

class CODCollectionSerializer(serializers.ModelSerializer):
    rider_name = serializers.ReadOnlyField(source='rider.user.get_full_name')
    customer_name = serializers.SerializerMethodField()
    tracking_number = serializers.ReadOnlyField(source='shipment.tracking_number')
    order_id = serializers.ReadOnlyField(source='shipment.order.id')
    order_date = serializers.ReadOnlyField(source='shipment.order.created_at')
    
    def get_payment_method(self, obj):
        method = obj.shipment.order.payment_method
        if not method:
            return 'COD'
        m = method.lower()
        if m == 'cod' or 'cash' in m:
            return 'COD'
        return 'Online'
    
    payment_method = serializers.SerializerMethodField()
    
    # Financial Breakdown
    product_amount = serializers.SerializerMethodField()
    shipping_charge = serializers.SerializerMethodField()
    tax = serializers.SerializerMethodField()
    total_amount = serializers.ReadOnlyField(source='amount')

    class Meta:
        model = CODCollection
        fields = '__all__'

    def get_customer_name(self, obj):
        user = obj.shipment.order.user
        return f"{user.first_name} {user.last_name}" if user.first_name else user.username

    def get_product_amount(self, obj):
        order = obj.shipment.order
        total = order.total_price or 0
        ship = getattr(order, 'shipping_charge', 0) or 0
        tax = getattr(order, 'tax_amount', 0) or 0
        return total - ship - tax

    def get_shipping_charge(self, obj):
        return getattr(obj.shipment.order, 'shipping_charge', 0.00) or 0.00

    def get_tax(self, obj):
        return getattr(obj.shipment.order, 'tax_amount', 0.00) or 0.00

class RiderWalletSerializer(serializers.ModelSerializer):
    total_orders_delivered = serializers.SerializerMethodField()
    recent_cod_collections = serializers.SerializerMethodField()
    recent_wallet_submissions = serializers.SerializerMethodField()
    today_earnings = serializers.SerializerMethodField()
    
    # Dynamic calculations to ensure accuracy
    total_cod_collected = serializers.SerializerMethodField()
    total_cod_submitted = serializers.SerializerMethodField()
    pending_cod_amount = serializers.SerializerMethodField()
    total_incentives = serializers.SerializerMethodField()

    class Meta:
        model = RiderWallet
        fields = '__all__'

    def get_total_orders_delivered(self, obj):
        return Shipment.objects.filter(rider=obj.rider, status='Delivered').count()

    def get_recent_cod_collections(self, obj):
        cods = CODCollection.objects.filter(rider=obj.rider).order_by('-created_at')[:20]
        return CODCollectionSerializer(cods, many=True, context=self.context).data

    def get_recent_wallet_submissions(self, obj):
        subs = RiderWalletTransaction.objects.filter(rider=obj.rider).order_by('-created_at')[:10]
        return RiderWalletTransactionSerializer(subs, many=True, context=self.context).data

    def get_today_earnings(self, obj):
        from django.db.models import Sum
        from django.utils import timezone
        today = timezone.now().date()
        earnings = RiderSalaryTransaction.objects.filter(
            rider=obj.rider, 
            created_at__date=today
        ).aggregate(total=Sum('amount'))['total'] or 0
        return float(earnings)

    def get_total_cod_collected(self, obj):
        from django.db.models import Sum
        total = CODCollection.objects.filter(rider=obj.rider).aggregate(total=Sum('amount'))['total'] or 0
        return float(total)

    def get_pending_cod_amount(self, obj):
        from django.db.models import Sum
        pending = CODCollection.objects.filter(rider=obj.rider, status='Pending').aggregate(total=Sum('amount'))['total'] or 0
        return float(pending)

    def get_total_cod_submitted(self, obj):
        collected = self.get_total_cod_collected(obj)
        pending = self.get_pending_cod_amount(obj)
        return collected - pending

    def get_total_incentives(self, obj):
        from django.db.models import Sum
        incentives = RiderSalaryTransaction.objects.filter(
            rider=obj.rider,
            transaction_type__in=['Distance Bonus', 'Peak Hour Bonus', 'Referral Bonus']
        ).aggregate(total=Sum('amount'))['total'] or 0
        return float(incentives)

class RiderFinancialLogSerializer(serializers.ModelSerializer):
    rider_name = serializers.ReadOnlyField(source='rider.user.get_full_name')

    class Meta:
        model = RiderFinancialLog
        fields = '__all__'
