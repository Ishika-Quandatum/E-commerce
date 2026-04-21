from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Shipment, RiderProfile, TrackingHistory
from .serializers import ShipmentSerializer, RiderProfileSerializer, AdminRiderSerializer
import random

class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset.select_related('order', 'order__user', 'rider', 'rider__user').prefetch_related('order__items', 'order__items__product')
        if user.role == 'rider':
            return queryset.filter(rider__user=user)
        elif user.role == 'user':
            return queryset.filter(order__user=user)
        elif user.role == 'vendor':
            return queryset.filter(order__vendor__user=user)
        return queryset

    @action(detail=True, methods=['patch'])
    def update_dispatch_status(self, request, pk=None):
        shipment = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = ['Pending', 'Packed', 'Ready for Dispatch', 'Assigned']
        
        if new_status in valid_statuses:
            shipment.status = new_status
            shipment.save()
            TrackingHistory.objects.create(shipment=shipment, status=new_status, description=f'Shipment status updated to {new_status}')
            return Response({'status': 'updated', 'new_status': shipment.status})
        return Response({'error': 'Invalid status transition'}, status=400)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        user = request.user
        if user.role != 'vendor':
            return Response({'error': 'Unauthorized'}, status=403)
        
        vendor_shipments = self.get_queryset()
        
        stats = {
            'new_orders': vendor_shipments.filter(status='Pending').count(),
            'packed_orders': vendor_shipments.filter(status='Packed').count(),
            'ready_to_dispatch': vendor_shipments.filter(status='Ready for Dispatch').count(),
            'out_for_delivery': vendor_shipments.filter(status__in=['Dispatched', 'Out for Delivery']).count(),
            'delivered_today': vendor_shipments.filter(status='Delivered', updated_at__date=self.request.user.date_joined.date()).count(), # Simple mock for today
            'all_orders': vendor_shipments.count()
        }
        return Response(stats)


    @action(detail=True, methods=['post'])
    def assign_rider(self, request, pk=None):
        shipment = self.get_object()
        rider_id = request.data.get('rider_id')
        try:
            rider = RiderProfile.objects.get(id=rider_id)
            shipment.rider = rider
            shipment.status = 'Assigned'
            shipment.save()
            TrackingHistory.objects.create(shipment=shipment, status='Assigned', description=f'Assigned to rider {rider.user.username}')
            return Response({'status': 'Rider assigned successfully'})
        except RiderProfile.DoesNotExist:
            return Response({'error': 'Rider not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def dispatch(self, request, pk=None):
        shipment = self.get_object()
        parcel_weight = request.data.get('parcel_weight')
        
        shipment.status = 'Dispatched'
        shipment.delivery_otp = str(random.randint(100000, 999999))
        if parcel_weight:
            shipment.parcel_weight = parcel_weight
        shipment.label_printed = True
        shipment.save()
        
        # Synchronize Order Status
        shipment.order.status = 'Shipped'
        shipment.order.save()

        TrackingHistory.objects.create(shipment=shipment, status='Dispatched', description=f'Shipment dispatched with weight {parcel_weight}kg')
        return Response({'status': 'Dispatched', 'otp': shipment.delivery_otp, 'tracking_number': shipment.tracking_number})


    @action(detail=True, methods=['post'])
    def verify_delivery(self, request, pk=None):
        shipment = self.get_object()
        provided_otp = request.data.get('otp')
        if shipment.delivery_otp and shipment.delivery_otp == str(provided_otp):
            shipment.status = 'Delivered'
            shipment.save()
            TrackingHistory.objects.create(shipment=shipment, status='Delivered', description='Shipment delivered successfully')
            return Response({'status': 'Delivery Verified'})
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

class RiderViewSet(viewsets.ModelViewSet):
    queryset = RiderProfile.objects.all().select_related('user').prefetch_related('assigned_shipments')
    serializer_class = RiderProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create' and self.request.user.role in ['superadmin', 'admin']:
            return AdminRiderSerializer
        return self.serializer_class
    
    @action(detail=False, methods=['get'])
    def admin_rider_stats(self, request):
        if request.user.role not in ['superadmin', 'admin']:
            return Response({'error': 'Unauthorized'}, status=403)
        
        total = self.queryset.count()
        active = self.queryset.filter(is_active=True).count()
        online = self.queryset.filter(availability_status='Online').count()
        # Pending deliveries assigned to any rider
        pending = Shipment.objects.filter(status__in=['Pending', 'Packed', 'Ready for Dispatch', 'Assigned', 'Dispatched', 'Out for Delivery']).count()

        return Response({
            'total_delivery_boys': total,
            'active_riders': active,
            'online_now': online,
            'pending_deliveries': pending
        })

    @action(detail=False, methods=['get'])
    def available_riders(self, request):
        # In a real app, we'd filter by distance and current load
        riders = self.queryset.filter(is_active=True)
        return Response(self.serializer_class(riders, many=True).data)

    @action(detail=False, methods=['get'])
    def active_tasks(self, request):
        user = request.user
        if user.role != 'rider':
            return Response({'error': 'Unauthorized'}, status=403)
        tasks = Shipment.objects.filter(rider__user=user, status__in=['Assigned', 'Picked Up', 'In Transit', 'Reached'])
        return Response(ShipmentSerializer(tasks, many=True).data)

    def destroy(self, request, *args, **kwargs):
        from django.db import transaction
        instance = self.get_object()
        user = instance.user

        # Deletion Guard: Check for active shipments
        active_shipments = Shipment.objects.filter(
            rider=instance, 
            status__in=['Assigned', 'Picked Up', 'In Transit', 'Reached', 'Dispatched', 'Out for Delivery']
        )
        
        if active_shipments.exists():
            return Response({
                'error': f'Cannot delete rider. They have {active_shipments.count()} active shipments assigned. Please reassign or complete them first.'
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user.delete() # Deleting user CASCADE deletes profile due to OneToOne
            return Response(status=status.HTTP_204_NO_CONTENT)

