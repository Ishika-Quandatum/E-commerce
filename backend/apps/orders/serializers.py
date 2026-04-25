from rest_framework import serializers
from apps.products.serializers import ProductListSerializer
from .models import Order, OrderItem
from apps.users.serializers import UserSerializer


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
    user = UserSerializer(read_only=True)
    items = serializers.SerializerMethodField()
    username = serializers.ReadOnlyField(source='user.username')

    shipment_id = serializers.SerializerMethodField()
    shipment_status = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'username', 'total_price', 'status',
            'payment_method', 'address', 'phone',
            'created_at', 'updated_at', 'items',
            'shipment_id', 'shipment_status'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_shipment_id(self, obj):
        try:
            return obj.shipment.id
        except:
            return None

    def get_shipment_status(self, obj):
        try:
            return obj.shipment.status
        except:
            return None
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
