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
from apps.users.models import Notification
from django.utils import timezone

class ReturnRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ReturnRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ReturnRequest.objects.all()
        
        if user.role == 'vendor':
            queryset = queryset.filter(vendor__user=user)
        elif user.role == 'rider':
            from django.db.models import Q
            queryset = queryset.filter(Q(rider__user=user) | Q(rider__isnull=True, status__in=['Approved by Vendor', 'Pickup Assigned']))
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
            
            # Check if an active return already exists for this item
            from .models import ReturnItem
            if ReturnItem.objects.filter(order_item=order_item).exclude(return_request__status='Cancelled').exists():
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"error": f"A return request already exists for {order_item.product.name}."})

            total_refund += order_item.price * item_data['quantity']
        
        with transaction.atomic():
            return_request = serializer.save(
                customer=self.request.user,
                vendor=order.vendor,
                refund_amount=total_refund,
                status='Return Requested'
            )
            
            # Put related VendorPayout on Refund Hold
            from apps.payments.models import VendorPayout
            VendorPayout.objects.filter(order=order).update(status='Refund Hold')
            
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
        
        # Prevent duplicate history if same status
        if return_request.status == new_status:
            return Response(ReturnRequestSerializer(return_request).data)

        # Role-based validation for status transitions
        user = request.user
        
        # Vendor Actions
        if user.role == 'vendor':
            allowed_vendor_statuses = [
                'Approved by Vendor', 
                'Refund Rejected', 
                'Vendor Confirmed Received',
                'Inspection Started',
                'Admin Review' # Vendor might push to review if they want
            ]
            if new_status not in allowed_vendor_statuses:
                 return Response({"error": f"Invalid status transition for vendor: {new_status}"}, status=status.HTTP_400_BAD_REQUEST)
            
            if new_status == 'Refund Rejected':
                return_request.rejection_reason = description
        
        # Rider Actions
        elif user.role == 'rider':
            allowed_rider_statuses = ['Pickup Assigned', 'Picked Up from Customer', 'Delivered to Vendor']
            if new_status not in allowed_rider_statuses:
                 return Response({"error": "Invalid status transition for rider"}, status=status.HTTP_400_BAD_REQUEST)
            # Auto-assign rider if not assigned
            if return_request.rider is None:
                return_request.rider = user.rider_profile
        
        # Admin Actions
        elif user.role in ['admin', 'superadmin']:
            allowed_admin_statuses = [
                'Pickup Assigned', 
                'Admin Review', 
                'Refund Approved', 
                'Refund Processed', 
                'Refund Rejected',
                'Return Rejected by Vendor' # Admin can also set this if needed
            ]
            if new_status not in allowed_admin_statuses:
                 return Response({"error": f"Invalid status transition for admin: {new_status}"}, status=status.HTTP_400_BAD_REQUEST)

            if new_status == 'Refund Processed':
                # Process Refund with additional data
                return_request.refund_method = request.data.get('refund_method', return_request.refund_method)
                return_request.refund_transaction_id = request.data.get('refund_transaction_id', '')
                return_request.refund_date = timezone.now()
                self._process_refund(return_request)
            elif new_status == 'Refund Approved':
                # If admin approves refund, settlement for vendor is CANCELLED
                from apps.payments.models import VendorPayout
                VendorPayout.objects.filter(order=return_request.order).update(status='Cancelled')
            elif new_status == 'Refund Rejected':
                # If admin rejects refund (meaning product was rejected or something else), 
                # settlement for vendor is RELEASED (so they get paid)
                from apps.payments.models import VendorPayout
                VendorPayout.objects.filter(order=return_request.order).update(status='Released')
        
        with transaction.atomic():
            return_request.status = new_status
            return_request.save()
            
            ReturnStatusHistory.objects.get_or_create(
                return_request=return_request,
                status=new_status,
                defaults={
                    'description': description,
                    'changed_by': user
                }
            )
            
        return Response(ReturnRequestSerializer(return_request).data)

    @decorators.action(detail=True, methods=['post'])
    def inspect(self, request, pk=None):
        return_request = self.get_object()
        if request.user.role != 'vendor':
            return Response({"error": "Only vendors can perform inspection"}, status=status.HTTP_403_FORBIDDEN)
        
        decision = request.data.get('vendor_decision') # 'Return Accepted' or 'Return Rejected by Vendor'
        notes = request.data.get('inspection_notes', '')
        reason = request.data.get('inspection_reason', '')
        
        if decision not in ['Return Accepted', 'Return Rejected by Vendor']:
            return Response({"error": "Invalid decision. Must be 'Return Accepted' or 'Return Rejected by Vendor'"}, status=status.HTTP_400_BAD_REQUEST)

        from django.utils import timezone
        with transaction.atomic():
            return_request.inspection_status = 'Accepted' if decision == 'Return Accepted' else 'Rejected'
            return_request.vendor_decision = decision
            return_request.inspection_notes = notes
            return_request.inspection_reason = reason
            return_request.inspection_completed_at = timezone.now()
            
            # After vendor inspection, move to Admin Review
            return_request.status = 'Admin Review'
            return_request.save()
            
            # Handle inspection images
            images = request.FILES.getlist('inspection_images')
            for img in images:
                ReturnImage.objects.create(
                    return_request=return_request, 
                    image=img, 
                    is_inspection_image=True
                )
            
            ReturnStatusHistory.objects.create(
                return_request=return_request,
                status='Admin Review',
                description=f"Inspection performed by vendor. Decision: {decision}. Reason: {reason}. Waiting for Admin Review.",
                changed_by=request.user
            )

        return Response(ReturnRequestSerializer(return_request, context={'request': request}).data)

    @decorators.action(detail=True, methods=['post'])
    def assign_rider(self, request, pk=None):
        if request.user.role not in ['admin', 'superadmin']:
            return Response({"error": "Only admins can assign riders"}, status=status.HTTP_403_FORBIDDEN)
        
        return_request = self.get_object()
        rider_id = request.data.get('rider_id')
        rider = get_object_or_404(RiderProfile, id=rider_id)
        
        with transaction.atomic():
            return_request.rider = rider
            return_request.status = 'Pickup Assigned'
            return_request.save()
            
            ReturnStatusHistory.objects.get_or_create(
                return_request=return_request,
                status='Pickup Assigned',
                defaults={
                    'description': f"Rider {rider.user.username} assigned for pickup",
                    'changed_by': request.user
                }
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
            
        return_request.status = 'Refund Processed'
        return_request.save()
        
        # Create Notification
        Notification.objects.create(
            user=return_request.customer,
            title="Refund Processed Successfully",
            message=f"Your refund of ₹{return_request.refund_amount} for Return Request #{return_request.id} has been processed via {return_request.refund_method}.",
            notification_type="Refund"
        )
        
        # Email & SMS Stubs (As requested)
        print(f"DEBUG: Sending Email to {return_request.customer.email}: Your refund of ₹{return_request.refund_amount} has been processed successfully.")
        print(f"DEBUG: Sending SMS to {return_request.customer.phone}: Your refund of ₹{return_request.refund_amount} has been processed successfully.")

class ReturnPolicyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ReturnPolicy.objects.all()
    serializer_class = ReturnPolicySerializer
    permission_classes = [permissions.AllowAny]
