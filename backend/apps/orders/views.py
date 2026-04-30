from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer
from apps.cart.models import Cart
from apps.payments.models import Payment
import uuid

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'user__username', 'user__first_name', 'user__last_name', 'address']

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.select_related('user').prefetch_related('items__product')
        
        if user.role in ['superadmin', 'admin'] or user.is_staff:
            return queryset.all()
        
        if user.role == 'vendor':
            vendor = getattr(user, 'vendor_profile', None)
            if vendor:
                return queryset.filter(vendor=vendor)
            return Order.objects.none()
            
        return queryset.filter(user=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # We override create because we might create multiple orders (one per vendor)
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart_items = cart.items.all()

        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Group items by vendor
        vendor_items = {}
        for item in cart_items:
            vendor = item.product.vendor
            if vendor not in vendor_items:
                vendor_items[vendor] = []
            vendor_items[vendor].append(item)

        created_orders = []
        # Create an order per vendor
        for vendor, items in vendor_items.items():
            product_total = sum((i.product.discount_price or i.product.price) * i.quantity for i in items)
            shipping_total = sum(getattr(i.product, 'shipping_charge', 0) or 0 for i in items)
            tax_total = sum(((i.product.discount_price or i.product.price) * i.quantity * (getattr(i.product, 'tax', 0) or 0)) / 100 for i in items)
            
            final_total = product_total + shipping_total + tax_total
            
            order = Order.objects.create(
                user=request.user,
                vendor=vendor,
                total_price=final_total,
                shipping_charge=shipping_total,
                tax_amount=tax_total,
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
                user=request.user,
                amount=final_total,
                method=order.payment_method,
                status='Pending',
                transaction_id=transaction_id
            )
            created_orders.append(order)

        # Clear the cart
        cart.items.all().delete()
        
        return Response(OrderSerializer(created_orders, many=True).data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        # Logic moved to create() to handle multi-vendor orders properly
        pass

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
        # Note: We rely on order.save() which triggers create_vendor_payout in the model save method.
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
            defaults={'status': 'Dispatch Queue'}
        )
        
        if not created:
            shipment.status = 'Dispatch Queue'
            shipment.save()
            
        order.status = 'Dispatch Queue'
        order.save()
        
        return Response({'message': 'Order sent to dispatch queue.', 'shipment_id': shipment.id})

