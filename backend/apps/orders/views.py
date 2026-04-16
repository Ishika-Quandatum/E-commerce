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
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order).data)
