from rest_framework import serializers
from .models import Payment, VendorPayout


class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.ReadOnlyField(source='order.id')
    username = serializers.ReadOnlyField(source='user.username')
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.ReadOnlyField(source='user.email')
    customer_phone = serializers.ReadOnlyField(source='order.phone')
    vendor_name = serializers.ReadOnlyField(source='order.vendor.shop_name')

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_id', 'user', 'username', 'customer_name', 'customer_email', 'customer_phone',
            'vendor_name', 'amount', 'method', 'status', 'transaction_id', 'gateway_reference',
            'refund_transaction_id', 'refund_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'transaction_id', 'created_at', 'updated_at']

    def get_customer_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name if name else obj.user.username


class CreatePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['order', 'amount', 'method']


class VendorPayoutSerializer(serializers.ModelSerializer):
    vendor_name = serializers.ReadOnlyField(source='vendor.shop_name')
    order_id = serializers.ReadOnlyField(source='order.id')

    class Meta:
        model = VendorPayout
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
