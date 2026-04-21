from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer
from apps.cart.models import Cart
from apps.payments.models import Payment
import uuid

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'superadmin':
            return Order.objects.prefetch_related('items__product').all()
        if user.role == 'vendor':
            vendor = getattr(user, 'vendor_profile', None)
            if vendor:
                return Order.objects.prefetch_related('items__product').filter(vendor=vendor)
            return Order.objects.none()
        return Order.objects.prefetch_related('items__product').filter(user=user)

    def perform_create(self, serializer):
        # 1. Get user's cart
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        cart_items = cart.items.all()

        if not cart_items.exists():
            return

        # 2. Group items by vendor
        vendor_items = {}
        for item in cart_items:
            vendor = item.product.vendor
            if vendor not in vendor_items:
                vendor_items[vendor] = []
            vendor_items[vendor].append(item)

        # 3. Create an order per vendor
        for vendor, items in vendor_items.items():
            vendor_total = sum((i.product.discount_price or i.product.price) * i.quantity for i in items)
            
            order = Order.objects.create(
                user=self.request.user,
                vendor=vendor,
                total_price=vendor_total,
                payment_method=serializer.validated_data['payment_method'],
                address=serializer.validated_data['address'],
                phone=serializer.validated_data['phone'],
                status='Pending'
            )

            for item in items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.product.discount_price or item.product.price
                )

            transaction_id = str(uuid.uuid4()).replace('-', '').upper()[:16]
            Payment.objects.create(
                order=order,
                user=self.request.user,
                amount=vendor_total,
                method=order.payment_method,
                status='Pending',
                transaction_id=transaction_id
            )

        # 4. Clear the cart
        cart.items.all().delete()
        
        # Note: We don't call serializer.save() because we're creating multiple orders manually.
        # This might mean serializer.data won't contain the created orders, 
        # but the frontend usually navigates away or relies on the status code.

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = [s[0] for s in Order.STATUS_CHOICES]
        
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Choose from {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Logic: Create VendorPayout when order is marked as 'Delivered'
        if new_status == 'Delivered' and order.status != 'Delivered':
            from apps.payments.models import VendorPayout
            import uuid
            
            # Check if payout already exists to prevent duplicates
            if not VendorPayout.objects.filter(order=order).exists():
                product_amount = order.total_price  # Sale amount
                vendor = order.vendor
                commission_rate = vendor.commission_rate
                commission_amount = (product_amount * commission_rate) / 100
                final_amount = product_amount - commission_amount
                
                payout_id = f"PAY-{uuid.uuid4().hex[:8].upper()}"
                
                VendorPayout.objects.create(
                    transaction_id=payout_id,
                    vendor=vendor,
                    order=order,
                    product_amount=product_amount,
                    total_amount=product_amount,
                    commission_rate=commission_rate,
                    commission_amount=commission_amount,
                    final_amount=final_amount,
                    status='Pending'
                )

        order.status = new_status
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def initialize_dispatch(self, request, pk=None):
        order = self.get_object()
        if order.status != 'Packed':
            return Response({'error': 'Order must be Packed before sending to dispatch.'}, status=400)
        
        from apps.tracking.models import Shipment
        shipment, created = Shipment.objects.get_or_create(
            order=order,
            defaults={'status': 'Pending Assignment'}
        )
        
        if not created:
            shipment.status = 'Pending Assignment'
            shipment.save()
            
        order.status = 'Ready for Dispatch'
        order.save()
        
        return Response({'message': 'Order sent to dispatch queue.', 'shipment_id': shipment.id})

