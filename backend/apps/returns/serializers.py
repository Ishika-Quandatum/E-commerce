from rest_framework import serializers
from .models import ReturnRequest, ReturnItem, ReturnImage, ReturnStatusHistory, ExchangeRequest, ReturnPolicy
from apps.orders.serializers import OrderItemSerializer

class ReturnImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturnImage
        fields = ['id', 'image', 'is_inspection_image', 'created_at']

class ReturnItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='order_item.product.name')
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = ReturnItem
        fields = ['id', 'order_item', 'quantity', 'reason', 'product_name', 'product_image']

    def get_product_image(self, obj):
        product = obj.order_item.product
        first_image = product.images.first()
        if first_image and first_image.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_image.image.url)
            return first_image.image.url
        return None

class ReturnStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.ReadOnlyField(source='changed_by.username')
    
    class Meta:
        model = ReturnStatusHistory
        fields = ['id', 'status', 'description', 'changed_by_name', 'timestamp']

class ReturnRequestSerializer(serializers.ModelSerializer):
    items = ReturnItemSerializer(many=True, read_only=True)
    images = ReturnImageSerializer(many=True, read_only=True)
    history = ReturnStatusHistorySerializer(many=True, read_only=True)
    customer_name = serializers.ReadOnlyField(source='customer.username')
    customer_phone = serializers.ReadOnlyField(source='order.phone')
    pickup_address = serializers.ReadOnlyField(source='order.address')
    vendor_name = serializers.ReadOnlyField(source='vendor.shop_name')
    vendor_phone = serializers.ReadOnlyField(source='vendor.user.phone')
    vendor_address = serializers.ReadOnlyField(source='vendor.user.address')
    rider_name = serializers.ReadOnlyField(source='rider.user.username', default="Not Assigned")
    
    class Meta:
        model = ReturnRequest
        fields = [
            'id', 'order', 'customer', 'customer_name', 'customer_phone', 'pickup_address',
            'vendor', 'vendor_name', 'vendor_phone', 'vendor_address',
            'rider', 'rider_name', 'reason', 'description', 'status', 
            'refund_method', 'refund_amount', 'rejection_reason', 
            'inspection_status', 'inspection_notes', 'inspection_reason', 'vendor_decision',
            'inspection_completed_at', 'refund_account_details', 'refund_transaction_id', 'refund_date',
            'items', 'images', 'history', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['customer', 'vendor', 'rider', 'status', 'refund_amount', 'created_at', 'updated_at']

class ExchangeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeRequest
        fields = '__all__'

class ReturnPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturnPolicy
        fields = '__all__'
