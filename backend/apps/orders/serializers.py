from rest_framework import serializers
from apps.products.serializers import ProductListSerializer
from .models import Order, OrderItem
from apps.users.serializers import UserSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    product_id = serializers.IntegerField(write_only=True)
    return_status = serializers.SerializerMethodField()
    has_active_return = serializers.SerializerMethodField()
    can_return = serializers.SerializerMethodField()
    refund_details = serializers.SerializerMethodField()
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price', 'subtotal', 'return_status', 'has_active_return', 'can_return', 'refund_details']
    def get_product(self, obj):
        request = self.context.get('request')
        return ProductListSerializer(obj.product, context={'request': request}).data

    def get_return_status(self, obj):
        from apps.returns.models import ReturnItem
        # Return the latest status if a return request exists for this item
        return_item = ReturnItem.objects.filter(order_item=obj).order_by('-return_request__created_at').first()
        if return_item:
            return return_item.return_request.status
        return None

    def get_has_active_return(self, obj):
        from apps.returns.models import ReturnItem
        return ReturnItem.objects.filter(order_item=obj).exclude(return_request__status='Cancelled').exists()

    def get_can_return(self, obj):
        if obj.order.status != 'Delivered':
            return False
        
        # Check if already has active return
        if self.get_has_active_return(obj):
            return False

        # Check return window (7 days by default)
        from django.utils import timezone
        from datetime import timedelta
        if obj.order.updated_at < timezone.now() - timedelta(days=7):
            return False
            
        return True
        
    def get_refund_details(self, obj):
        from apps.returns.models import ReturnItem
        return_item = ReturnItem.objects.filter(order_item=obj, return_request__status='Refund Processed').first()
        if return_item:
            req = return_item.return_request
            return {
                'amount': req.refund_amount,
                'date': req.refund_date,
                'method': req.refund_method,
                'transaction_id': req.refund_transaction_id
            }
        return None


class OrderSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    items = serializers.SerializerMethodField()
    username = serializers.ReadOnlyField(source='user.username')

    shipment_id = serializers.SerializerMethodField()
    shipment_status = serializers.SerializerMethodField()
    display_status = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'username', 'total_price', 'shipping_charge', 'tax_amount', 'status', 'display_status',
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

    def get_display_status(self, obj):
        # Check if there's any return request associated with this order
        latest_return = obj.return_requests.order_by('-created_at').first()
        if latest_return:
            status_map = {
                'Return Requested': 'RETURN_REQUESTED',
                'Approved by Vendor': 'RETURN_APPROVED',
                'Pickup Assigned': 'RETURN_IN_PROGRESS',
                'Picked Up from Customer': 'RETURN_IN_PROGRESS',
                'Delivered to Vendor': 'RETURN_DELIVERED',
                'Vendor Confirmed Received': 'RETURN_DELIVERED',
                'Inspection Started': 'RETURN_DELIVERED',
                'Refund Approved': 'RETURN_DELIVERED',
                'Refund Processed': 'REFUNDED',
                'Refund Rejected': 'RETURN_REJECTED',
            }
            return status_map.get(latest_return.status, latest_return.status)
        return obj.status


class CreateOrderSerializer(serializers.ModelSerializer):
    """Used when placing a new order."""
    class Meta:
        model = Order
        fields = ['total_price', 'payment_method', 'address', 'phone']
