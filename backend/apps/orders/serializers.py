from rest_framework import serializers
from apps.products.serializers import ProductListSerializer
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'username', 'total_price', 'status',
            'payment_method', 'address', 'phone',
            'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


class CreateOrderSerializer(serializers.ModelSerializer):
    """Used when placing a new order."""
    class Meta:
        model = Order
        fields = ['total_price', 'payment_method', 'address', 'phone']
