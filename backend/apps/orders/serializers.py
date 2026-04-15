from rest_framework import serializers
from apps.products.serializers import ProductListSerializer
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price', 'subtotal']
    def get_product(self, obj):
        request = self.context.get('request')
        return ProductListSerializer(obj.product, context={'request': request}).data


class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'username', 'total_price', 'status',
            'payment_method', 'address', 'phone',
            'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    def get_items(self, obj):
        return OrderItemSerializer(
            obj.items.all(),
            many=True,
            context=self.context
        ).data


class CreateOrderSerializer(serializers.ModelSerializer):
    """Used when placing a new order."""
    class Meta:
        model = Order
        fields = ['total_price', 'payment_method', 'address', 'phone']
