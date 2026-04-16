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
        if user.is_staff:
            return Order.objects.prefetch_related('items__product').all()
        return Order.objects.prefetch_related('items__product').filter(user=user)

    def perform_create(self, serializer):
        # 1. Save the order
        order = serializer.save(user=self.request.user)

        # 2. Get user's cart
        cart, created = Cart.objects.get_or_create(user=self.request.user)

        # 3. Create order items from cart items
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.discount_price or item.product.price
            )

        # 4. Clear the cart
        cart.items.all().delete()

        # 5. Create a corresponding Payment record
        transaction_id = str(uuid.uuid4()).replace('-', '').upper()[:16]
        Payment.objects.create(
            order=order,
            user=self.request.user,
            amount=order.total_price,
            method=order.payment_method,
            status='Pending', # Default status
            transaction_id=transaction_id
        )

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
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
