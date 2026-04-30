from rest_framework import serializers
from decimal import Decimal
from apps.products.serializers import ProductListSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    total_tax = serializers.SerializerMethodField()
    total_shipping = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total', 'total_tax', 'total_shipping', 'grand_total', 'item_count', 'created_at']
        read_only_fields = ['user']

    def get_total(self, obj):
        return sum((item.subtotal for item in obj.items.all()), Decimal('0.00'))

    def get_total_tax(self, obj):
        return sum(((item.subtotal * (Decimal(str(item.product.tax or 0)) / Decimal('100'))) for item in obj.items.all()), Decimal('0.00'))

    def get_total_shipping(self, obj):
        return sum(((Decimal(str(item.product.shipping_charge or 0)) * item.quantity) for item in obj.items.all()), Decimal('0.00'))

    def get_grand_total(self, obj):
        return self.get_total(obj) + self.get_total_tax(obj) + self.get_total_shipping(obj)

    def get_item_count(self, obj):
        return obj.items.count()
