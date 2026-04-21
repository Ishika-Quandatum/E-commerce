from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Shipment, RiderProfile, TrackingHistory, Attendance, RiderWallet, SalaryConfiguration, Transaction
from .serializers import (
    ShipmentSerializer, RiderProfileSerializer, AdminRiderSerializer,
    AttendanceSerializer, RiderWalletSerializer, SalaryConfigurationSerializer
)
import random
from django.utils import timezone
from decimal import Decimal
import math
from .models import RiderProfile

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
            'pending_assignment': vendor_shipments.filter(status='Pending Assignment').count(),
            'assigned': vendor_shipments.filter(status='Assigned').count(),
            'in_transit': vendor_shipments.filter(status='In Transit').count(),
            'delivered': vendor_shipments.filter(status='Delivered').count(),
            'all_shipments': vendor_shipments.count()
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
    def assign_nearest_rider(self, request, pk=None):
        shipment = self.get_object()
        vendor = shipment.order.vendor
        
        if not vendor.location_lat or not vendor.location_lng:
            return Response({'error': 'Vendor location not configured.'}, status=400)
            
        # Haversine distance function
        def get_distance(lat1, lon1, lat2, lon2):
            R = 6371 # km
            dLat = math.radians(lat2 - lat1)
            dLon = math.radians(lon2 - lon1)
            a = math.sin(dLat / 2) * math.sin(dLat / 2) + \
                math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
                math.sin(dLon / 2) * math.sin(dLon / 2)
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return R * c

        online_riders = RiderProfile.objects.filter(
            availability_status='Online', 
            is_active=True,
            current_lat__isnull=False,
            current_lng__isnull=False
        )

        nearest_rider = None
        min_distance = float('inf')

        for rider in online_riders:
            dist = get_distance(vendor.location_lat, vendor.location_lng, rider.current_lat, rider.current_lng)
            if dist < min_distance:
                min_distance = dist
                nearest_rider = rider

        if nearest_rider:
            shipment.rider = nearest_rider
            shipment.status = 'Assigned'
            shipment.save()
            TrackingHistory.objects.create(shipment=shipment, status='Assigned', description=f'Auto-assigned to nearest rider {nearest_rider.user.username} ({min_distance:.2f} km)')
            return Response({
                'message': f'Rider {nearest_rider.user.username} assigned (Distance: {min_distance:.2f} km)',
                'rider': RiderProfileSerializer(nearest_rider).data,
                'distance': round(min_distance, 2)
            })
            
        return Response({'error': 'No available riders found nearby.'}, status=404)


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

    @action(detail=False, methods=['get'])
    def wallet(self, request):
        user = request.user
        if user.role != 'rider':
            return Response({'error': 'Unauthorized'}, status=403)
        wallet = RiderWallet.objects.get(rider__user=user)
        return Response(RiderWalletSerializer(wallet).data)

    @action(detail=False, methods=['get'])
    def salary_details(self, request):
        user = request.user
        if user.role != 'rider':
            return Response({'error': 'Unauthorized'}, status=403)
        config = SalaryConfiguration.objects.get(rider__user=user)
        return Response(SalaryConfigurationSerializer(config).data)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(rider__user=self.request.user)

    @action(detail=False, methods=['post'])
    def punch_in(self, request):
        rider = request.user.rider_profile
        today = timezone.now().date()
        
        if Attendance.objects.filter(rider=rider, date=today, check_out__isnull=True).exists():
            return Response({'error': 'You are already punched in'}, status=400)
            
        attendance = Attendance.objects.create(
            rider=rider,
            check_in=timezone.now()
        )
        rider.availability_status = 'Online'
        rider.save()
        return Response(AttendanceSerializer(attendance).data)

    @action(detail=False, methods=['post'])
    def punch_out(self, request):
        rider = request.user.rider_profile
        attendance = Attendance.objects.filter(rider=rider, check_out__isnull=True).order_by('-check_in').first()
        
        if not attendance:
            return Response({'error': 'No active session found. Please punch in first.'}, status=400)
            
        attendance.check_out = timezone.now()
        
        # Calculate working hours
        duration = attendance.check_out - attendance.check_in
        hours = Decimal(duration.total_seconds() / 3600).quantize(Decimal('0.00'))
        attendance.working_hours = hours
        attendance.save()
        
        rider.availability_status = 'Offline'
        rider.save()
        
        return Response(AttendanceSerializer(attendance).data)
