from rest_framework import serializers
from .models import (
    RiderPayrollRule, RiderSettlement, RiderPaymentLog, RiderWallet,
    DeliveryBonusRule, PenaltyRule, PayrollConfiguration, VehicleTypePaySetting
)
from apps.users.serializers import UserSerializer

class DeliveryBonusRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryBonusRule
        fields = ['id', 'min_deliveries', 'bonus_amount', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class PenaltyRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PenaltyRule
        fields = ['id', 'penalty_name', 'deduction_amount', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class PayrollConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollConfiguration
        fields = ['id', 'petrol_km_limit', 'petrol_rate_per_km', 'updated_at']
        read_only_fields = ['id', 'updated_at']

class RiderPayrollRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderPayrollRule
        fields = '__all__'

class RiderPaymentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderPaymentLog
        fields = '__all__'

class RiderSettlementSerializer(serializers.ModelSerializer):
    rider_name = serializers.CharField(source='rider.user.username', read_only=True)
    payment_log = RiderPaymentLogSerializer(read_only=True)
    
    class Meta:
        model = RiderSettlement
        fields = '__all__'

class RiderWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderWallet
        fields = '__all__'


class VehicleTypePaySettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleTypePaySetting
        fields = ['id', 'vehicle_type', 'base_pay', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

