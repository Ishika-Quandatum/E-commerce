from rest_framework import serializers
from .models import Payment, VendorPayout


class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.ReadOnlyField(source='order.id')
    username = serializers.ReadOnlyField(source='user.username')
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.ReadOnlyField(source='user.email')
    customer_phone = serializers.ReadOnlyField(source='order.phone')
    vendor_name = serializers.ReadOnlyField(source='order.vendor.shop_name')
    refund_lifecycle = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_id', 'user', 'username', 'customer_name', 'customer_email', 'customer_phone',
            'vendor_name', 'amount', 'method', 'status', 'transaction_id', 'gateway_reference',
            'refund_transaction_id', 'refund_status', 'refund_method', 'refund_date', 'refund_reason',
            'refund_lifecycle', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'transaction_id', 'created_at', 'updated_at']

    def get_customer_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name if name else obj.user.username

    def get_refund_lifecycle(self, obj):
        from django.utils import timezone
        from apps.returns.models import ReturnRequest
        from apps.payments.models import VendorPayout

        order = obj.order
        # 1. Check if an active return request exists
        return_req = ReturnRequest.objects.filter(order=order).exclude(status='Cancelled').first()
        
        if return_req:
            req_status = return_req.status
            if req_status == 'Return Requested':
                status_code = 'RETURN_REQUESTED'
            elif req_status in ['Approved by Vendor', 'Return Accepted']:
                status_code = 'RETURN_APPROVED'
            elif req_status == 'Pickup Assigned':
                status_code = 'PICKUP_PENDING'
            elif req_status in ['Picked Up from Customer', 'Delivered to Vendor', 'Vendor Confirmed Received', 'Inspection Started']:
                status_code = 'RETURN_PICKED'
            elif req_status in ['Admin Review', 'Refund Approved']:
                status_code = 'REFUND_PENDING'
            elif req_status == 'Refund Processed':
                status_code = 'REFUNDED'
            elif req_status in ['Return Rejected by Vendor', 'Refund Rejected']:
                status_code = 'REFUND_REJECTED'
            else:
                status_code = 'RETURN_REQUESTED'
                
            return {
                'status': status_code,
                'eligible_until': None,
                'days_remaining': 0,
                'return_request_id': return_req.id
            }

        # 2. Check if a return window hold exists
        payout = VendorPayout.objects.filter(order=order).first()
        return_eligible_until = None
        
        if payout and payout.returnEligibleUntil:
            return_eligible_until = payout.returnEligibleUntil
        else:
            if order.status == 'Delivered':
                from apps.returns.models import ReturnPolicy
                from datetime import timedelta
                delivered_date = order.updated_at
                max_days = 7
                for item in order.items.all():
                    product = item.product
                    days = None
                    if product.subcategory:
                        sub_policy = ReturnPolicy.objects.filter(category=product.subcategory).first()
                        if sub_policy:
                            days = sub_policy.return_window_days if sub_policy.is_returnable else 0
                    if days is None and product.category:
                        cat_policy = ReturnPolicy.objects.filter(category=product.category).first()
                        if cat_policy:
                            days = cat_policy.return_window_days if cat_policy.is_returnable else 0
                    if days is None:
                        global_policy = ReturnPolicy.objects.filter(category=None).first()
                        if global_policy:
                            days = global_policy.return_window_days if global_policy.is_returnable else 0
                    if days is not None and days > max_days:
                        max_days = days
                return_eligible_until = delivered_date + timedelta(days=max_days)

        if return_eligible_until:
            now = timezone.now()
            if now <= return_eligible_until:
                days_remaining = (return_eligible_until - now).days
                return {
                    'status': 'RETURN_WINDOW_ACTIVE',
                    'eligible_until': return_eligible_until.isoformat(),
                    'days_remaining': max(0, days_remaining),
                    'return_request_id': None
                }
            else:
                return {
                    'status': 'NO_RETURN_REQUESTED',
                    'eligible_until': return_eligible_until.isoformat(),
                    'days_remaining': 0,
                    'return_request_id': None
                }

        if order.status in ['Delivered', 'Returned']:
            return {
                'status': 'NO_RETURN_REQUESTED',
                'eligible_until': None,
                'days_remaining': 0,
                'return_request_id': None
            }
        else:
            return {
                'status': 'AWAITING_DELIVERY',
                'eligible_until': None,
                'days_remaining': 0,
                'return_request_id': None
            }


class CreatePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['order', 'amount', 'method']


class VendorPayoutSerializer(serializers.ModelSerializer):
    vendor_name = serializers.ReadOnlyField(source='vendor.shop_name')
    order_id = serializers.ReadOnlyField(source='order.id')
    order_payment_method = serializers.ReadOnlyField(source='order.payment_method')

    class Meta:
        model = VendorPayout
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
