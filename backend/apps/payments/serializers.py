from rest_framework import serializers
from .models import Payment, VendorPayout


class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.ReadOnlyField(source='order.id')
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_id', 'user', 'username',
            'amount', 'method', 'status', 'transaction_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'transaction_id', 'created_at', 'updated_at']


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
