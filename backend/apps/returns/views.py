from rest_framework import viewsets, permissions, status, decorators
import json
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import ReturnRequest, ReturnItem, ReturnImage, ReturnStatusHistory, ReturnPolicy
from .serializers import ReturnRequestSerializer, ReturnImageSerializer, ReturnPolicySerializer
from apps.orders.models import Order, OrderItem
from apps.payments.models import CustomerWallet, WalletTransaction
from apps.tracking.models import RiderProfile, Shipment

class ReturnRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ReturnRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ReturnRequest.objects.all()
        
        if user.role == 'vendor':
            queryset = queryset.filter(vendor__user=user)
        elif user.role == 'rider':
            queryset = queryset.filter(rider__user=user)
        elif user.role not in ['admin', 'superadmin']:
            queryset = queryset.filter(customer=user)
            
        # Filtering
        status_param = self.request.query_params.get('status')
        search_param = self.request.query_params.get('search')
        
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        if search_param:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(id__icontains=search_param) |
                Q(order__id__icontains=search_param) |
                Q(customer__username__icontains=search_param) |
                Q(reason__icontains=search_param)
            )
            
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        order_id = self.request.data.get('order')
        order = get_object_or_404(Order, id=order_id, user=self.request.user)
        
        # Calculate refund amount (simplified: sum of selected items)
        # In a real app, this would be more complex (tax, shipping, coupons)
        items_data = self.request.data.get('items', [])
        if isinstance(items_data, str):
            try:
                items_data = json.loads(items_data)
            except json.JSONDecodeError:
                items_data = []

        total_refund = 0
        for item_data in items_data:
            order_item = get_object_or_404(OrderItem, id=item_data['order_item'], order=order)
            total_refund += order_item.price * item_data['quantity']
        
        with transaction.atomic():
            return_request = serializer.save(
                customer=self.request.user,
                vendor=order.vendor,
                refund_amount=total_refund,
                status='Return Requested'
            )
            
            # Create ReturnItems
            for item_data in items_data:
                order_item = get_object_or_404(OrderItem, id=item_data['order_item'], order=order)
                ReturnItem.objects.create(
                    return_request=return_request,
                    order_item=order_item,
                    quantity=item_data['quantity'],
                    reason=item_data.get('reason', return_request.reason)
                )
            
            # Handle Images
            images = self.request.FILES.getlist('images')
            for image in images:
                ReturnImage.objects.create(return_request=return_request, image=image)
            
            # History
            ReturnStatusHistory.objects.create(
                return_request=return_request,
                status='Return Requested',
                description="Return request submitted by customer",
                changed_by=self.request.user
            )

    @decorators.action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        return_request = self.get_object()
        new_status = request.data.get('status')
        description = request.data.get('description', '')
        
        # Role-based validation for status transitions
        user = request.user
        
        # Vendor Actions
        if user.role == 'vendor':
            if new_status not in ['Approved', 'Rejected', 'Product Inspection']:
                 return Response({"error": "Invalid status for vendor"}, status=status.HTTP_400_BAD_REQUEST)
            if new_status == 'Rejected':
                return_request.rejection_reason = description
        
        # Rider Actions
        elif user.role == 'rider':
            if new_status not in ['Picked Up', 'Delivered to Vendor']:
                 return Response({"error": "Invalid status for rider"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Admin Actions
        elif user.role in ['admin', 'superadmin']:
            if new_status == 'Refund Completed':
                # Process Refund
                self._process_refund(return_request)
        
        with transaction.atomic():
            return_request.status = new_status
            return_request.save()
            
            ReturnStatusHistory.objects.create(
                return_request=return_request,
                status=new_status,
                description=description,
                changed_by=user
            )
            
        return Response(ReturnRequestSerializer(return_request).data)

    @decorators.action(detail=True, methods=['post'])
    def assign_rider(self, request, pk=None):
        if request.user.role not in ['admin', 'superadmin']:
            return Response({"error": "Only admins can assign riders"}, status=status.HTTP_403_FORBIDDEN)
        
        return_request = self.get_object()
        rider_id = request.data.get('rider_id')
        rider = get_object_or_404(RiderProfile, id=rider_id)
        
        with transaction.atomic():
            return_request.rider = rider
            return_request.status = 'Approved' # Or 'Pending Pickup'
            return_request.save()
            
            ReturnStatusHistory.objects.create(
                return_request=return_request,
                status='Rider Assigned',
                description=f"Rider {rider.user.username} assigned for pickup",
                changed_by=request.user
            )
            
        return Response(ReturnRequestSerializer(return_request).data)

    def _process_refund(self, return_request):
        if return_request.refund_method == 'Wallet':
            wallet, _ = CustomerWallet.objects.get_or_create(user=return_request.customer)
            wallet.balance += return_request.refund_amount
            wallet.save()
            
            WalletTransaction.objects.create(
                wallet=wallet,
                amount=return_request.refund_amount,
                transaction_type='Refund',
                description=f"Refund for Return Request #{return_request.id}",
                reference_id=str(return_request.id)
            )
        # Add other methods as needed (Bank Transfer, etc.)

class ReturnPolicyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ReturnPolicy.objects.all()
    serializer_class = ReturnPolicySerializer
    permission_classes = [permissions.AllowAny]
