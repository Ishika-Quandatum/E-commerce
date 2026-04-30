from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Shipment, RiderProfile, TrackingHistory, Attendance, RiderWallet, 
    SalaryConfiguration, Transaction, CODCollection, RiderMonthlySettlement, 
    RiderWalletTransaction, RiderSalaryTransaction, LiveOrderTracking, RiderFinancialLog
)
from .serializers import (
    ShipmentSerializer, RiderProfileSerializer, AdminRiderSerializer,
    AttendanceSerializer, RiderWalletSerializer, SalaryConfigurationSerializer,
    CODCollectionSerializer, RiderMonthlySettlementSerializer,
    RiderWalletTransactionSerializer, RiderSalaryTransactionSerializer,
    LiveOrderTrackingSerializer, RiderFinancialLogSerializer
)
import random
from django.utils import timezone
from decimal import Decimal
import math
import datetime

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

    @action(detail=False, methods=['get'])
    def open_queue(self, request):
        """Returns shipments that are ready for dispatch but have no rider assigned."""
        queryset = Shipment.objects.filter(
            status='Dispatch Queue',
            rider__isnull=True
        ).select_related('order', 'order__user').prefetch_related('order__items', 'order__items__product')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def accept_shipment(self, request, pk=None):
        """Atomic logic for a rider to claim an unassigned shipment."""
        from django.db import transaction
        
        if request.user.role != 'rider':
            return Response({'error': 'Only riders can accept shipments.'}, status=403)
            
        rider_profile = request.user.rider_profile
        
        try:
            with transaction.atomic():
                # Lock the shipment record to prevent race conditions
                shipment = Shipment.objects.select_for_update().get(pk=pk)
                
                if shipment.rider is not None:
                    return Response({'error': 'This shipment has already been claimed by another rider.'}, status=400)
                
                if shipment.status != 'Dispatch Queue':
                    return Response({'error': 'This shipment is no longer available in the queue.'}, status=400)

                # Assign and update
                shipment.rider = rider_profile
                shipment.status = 'Assigned'
                shipment.save()
                
                # Sync Order
                shipment.order.status = 'Accepted' 
                shipment.order.save()

                TrackingHistory.objects.create(
                    shipment=shipment, 
                    status='Assigned', 
                    description=f'Claimed by rider {request.user.username}'
                )
                
                return Response({'status': 'claimed', 'message': 'You have successfully accepted this task.'})
        except Shipment.DoesNotExist:
            return Response({'error': 'Shipment not found.'}, status=404)

    @action(detail=True, methods=['patch'])
    def update_dispatch_status(self, request, pk=None):
        shipment = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = ['Pending', 'Packed', 'Dispatch Queue', 'Assigned', 'Picked Up', 'Dispatched', 'In Transit', 'Reached', 'Delivered']
        
        if new_status in valid_statuses:
            shipment.status = new_status
            shipment.save()

            # Sync Order Status
            if new_status in ['Picked Up', 'In Transit', 'Dispatched']:
                shipment.order.status = 'Shipped'
                shipment.order.save()
            elif new_status == 'Delivered':
                shipment.order.status = 'Delivered'
                shipment.order.save()

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
            'pending_assignment': vendor_shipments.filter(status='Dispatch Queue').count(),
            'assigned': vendor_shipments.filter(status='Assigned').count(),
            'in_transit': vendor_shipments.filter(status='In Transit').count(),
            'delivered': vendor_shipments.filter(status='Delivered').count(),
            'all_shipments': vendor_shipments.count()
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def tracking_summary(self, request):
        """Stats for Global Tracking Dashboard (Super Admin)"""
        active_riders = RiderProfile.objects.filter(availability_status='Online', is_active=True).count()
        
        in_transit = Shipment.objects.filter(status__in=['Picked Up', 'Out for Delivery', 'In Transit', 'Dispatched']).count()
        
        failed_delayed = Shipment.objects.filter(status__in=['Failed Delivery', 'Delayed', 'Returned', 'Delivery Attempt Failed']).count()
        
        return Response({
            'active_riders': active_riders,
            'in_transit_orders': in_transit,
            'failed_delayed_orders': failed_delayed
        })


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
    def finalize_dispatch(self, request, pk=None):
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
    def mark_delivered(self, request, pk=None):
        """Simple delivery confirmation with SMS notification to the customer."""
        shipment = self.get_object()
        
        if shipment.status == 'Delivered':
            return Response({'status': 'Already delivered'})

        shipment.status = 'Delivered'
        shipment.save()
        
        # Sync Order Status to trigger payout
        shipment.order.status = 'Delivered'
        shipment.order.save()
        
        TrackingHistory.objects.create(shipment=shipment, status='Delivered', description='Shipment delivered manually by rider')
        
        # SMS Simulation
        customer_phone = shipment.order.phone
        order_id = shipment.order.id
        platform_name = "RainbowStore" # Fallback if context not available in backend
        
        # COD Collection Logic
        p_method = shipment.order.payment_method.lower()
        if 'cod' in p_method or 'cash' in p_method:
            # Create COD Collection record
            cod, created = CODCollection.objects.get_or_create(
                shipment=shipment,
                rider=shipment.rider,
                defaults={'amount': shipment.order.total_price}
            )
            
            # Update Rider Wallet pending amount
            try:
                from apps.tracking.models import RiderWallet, SalaryConfiguration, RiderSalaryTransaction
                
                wallet, _ = RiderWallet.objects.get_or_create(rider=shipment.rider)
                config, _ = SalaryConfiguration.objects.get_or_create(rider=shipment.rider)
                
                delivery_earning = config.per_delivery_commission
                if delivery_earning == 0:
                    delivery_earning = Decimal('40.00') # Fallback
                
                # Update Wallet
                wallet.total_cod_collected += Decimal(str(shipment.order.total_price))
                wallet.pending_cod_amount += Decimal(str(shipment.order.total_price))
                wallet.total_earned += delivery_earning
                wallet.current_balance += delivery_earning
                wallet.save()
                
                # Professional Salary Transaction
                RiderSalaryTransaction.objects.create(
                    rider=shipment.rider,
                    order=shipment.order,
                    amount=delivery_earning,
                    transaction_type='Delivery Earnings',
                    description=f'Earnings for Order #{shipment.order.id}',
                    status='Pending'
                )
            except Exception as e:
                import traceback
                print(f"[ERROR] Rider Finance update failed: {e}")
                traceback.print_exc()
            
            print(f"[COD] Recorded {shipment.order.total_price} for Rider {shipment.rider.user.username}")

        print(f"\n[SMS SIMULATION] >>> Sent to {customer_phone}: Hello! Your order #{order_id} from {platform_name} has been successfully delivered by our partner. Enjoy your purchase!\n")

        return Response({'status': 'Delivery Successful', 'sms_sent': True})

    @action(detail=True, methods=['post'], url_path='rider-location')
    def rider_location(self, request, pk=None):
        shipment = self.get_object()
        if request.user.role != 'rider':
            return Response({'error': 'Only riders can update location'}, status=403)
        
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        
        if lat is None or lng is None:
            return Response({'error': 'Latitude and longitude are required'}, status=400)
            
        LiveOrderTracking.objects.create(
            shipment=shipment,
            rider=request.user.rider_profile,
            latitude=lat,
            longitude=lng
        )
        
        # Also update current location in rider profile for general use
        request.user.rider_profile.current_lat = lat
        request.user.rider_profile.current_lng = lng
        request.user.rider_profile.save()
        
        return Response({'status': 'Location updated'})

    @action(detail=True, methods=['get'], url_path='track')
    def track(self, request, pk=None):
        try:
            shipment = self.get_object()
            
            latest_tracking = LiveOrderTracking.objects.filter(shipment=shipment).first()
            history = LiveOrderTracking.objects.filter(shipment=shipment).order_by('-timestamp')[:20]
            
            # Map products safely
            items_data = []
            for item in shipment.order.items.all():
                product = item.product
                image_url = None
                if product:
                    first_image = product.images.first()
                    if first_image:
                        image_url = first_image.image.url

                    items_data.append({
                        'name': product.name,
                        'qty': item.quantity,
                        'price': float(item.price),
                        'image': image_url
                    })
                else:
                    items_data.append({
                        'name': "Unknown Product",
                        'qty': item.quantity,
                        'price': float(item.price),
                        'image': None
                    })

            data = {
                'shipment_status': shipment.status,
                'order_status': shipment.order.status,
                'tracking_number': shipment.tracking_number,
                'rider_info': {
                    'name': shipment.rider.user.get_full_name() if shipment.rider else "Not Assigned",
                    'phone': shipment.rider.user.phone if shipment.rider else "",
                    'vehicle': shipment.rider.vehicle_type if shipment.rider else "Bike",
                },
                'customer_location': {
                    'address': shipment.order.address,
                    'lat': shipment.order.latitude or 12.9716,
                    'lng': shipment.order.longitude or 77.5946
                },
                'current_location': LiveOrderTrackingSerializer(latest_tracking).data if latest_tracking else None,
                'location_history': LiveOrderTrackingSerializer(history, many=True).data,
                'eta': shipment.estimated_delivery_time,
                'payment_method': shipment.order.payment_method,
                'order_date': shipment.order.created_at,
                'customer_name': shipment.order.user.get_full_name() or shipment.order.user.username,
                'order_items': items_data
            }
            return Response(data)
        except Exception as e:
            print(f"[TRACKING ERROR] {str(e)}")
            return Response({'error': 'Internal server error while fetching tracking data', 'details': str(e)}, status=500)


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
        # Include 'Delivered' so Completed tab can show history
        tasks = Shipment.objects.filter(rider__user=user, status__in=['Assigned', 'Picked Up', 'In Transit', 'Reached', 'Delivered'])
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
class CODCollectionViewSet(viewsets.ModelViewSet):
    queryset = CODCollection.objects.all().select_related('rider__user', 'shipment__order')
    serializer_class = CODCollectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def mark_submitted(self, request, pk=None):
        cod = self.get_object()
        if cod.status == 'Submitted':
            return Response({'error': 'Already submitted'}, status=400)
        
        submitted_val = request.data.get('submitted_amount', cod.amount)
        try:
            submitted_val = Decimal(str(submitted_val))
        except:
            submitted_val = cod.amount

        shortage = cod.amount - submitted_val
        
        cod.status = 'Submitted' if shortage <= 0 else 'Disputed'
        cod.submitted_amount = submitted_val
        cod.submitted_at = timezone.now()
        cod.admin_notes = request.data.get('notes', cod.admin_notes)
        cod.save()
        
        # Update Rider Wallet
        try:
            wallet = cod.rider.wallet
            wallet.pending_cod_amount -= cod.amount
            wallet.total_cod_submitted += submitted_val
            if shortage > 0:
                wallet.shortage_amount += shortage
            wallet.save()

            # Create Financial Log
            RiderFinancialLog.objects.create(
                rider=cod.rider,
                amount=submitted_val,
                log_type='Submission',
                description=f"COD Submission for Order #{cod.shipment.order.id}. Collected: {cod.amount}, Submitted: {submitted_val}. Shortage: {shortage}"
            )
        except RiderWallet.DoesNotExist:
            return Response({'error': 'Rider wallet not found'}, status=400)
        
        return Response({'status': 'Payment submitted to Admin', 'shortage': float(shortage)})

class RiderWalletTransactionViewSet(viewsets.ModelViewSet):
    queryset = RiderWalletTransaction.objects.all().select_related('rider__user')
    serializer_class = RiderWalletTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'rider':
            return self.queryset.filter(rider__user=user)
        return self.queryset

    @action(detail=True, methods=['post'])
    def verify_submission(self, request, pk=None):
        if request.user.role not in ['superadmin', 'admin']:
            return Response({'error': 'Unauthorized'}, status=403)
            
        trans = self.get_object()
        if trans.status == 'Verified':
            return Response({'error': 'Already verified'}, status=400)
            
        status_update = request.data.get('status', 'Verified')
        notes = request.data.get('notes', '')
        
        if status_update == 'Verified':
            trans.status = 'Verified'
            trans.verified_at = timezone.now()
            trans.notes = notes
            trans.save()
            
            # Update Rider Wallet
            wallet = trans.rider.wallet
            wallet.pending_cod_amount -= trans.amount
            wallet.total_cod_submitted += trans.amount
            wallet.save()
            
            return Response({'status': 'Verified successfully'})
        
        return Response({'status': 'Update failed'}, status=400)

class RiderSalaryTransactionViewSet(viewsets.ModelViewSet):
    queryset = RiderSalaryTransaction.objects.all().select_related('rider__user', 'order')
    serializer_class = RiderSalaryTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'rider':
            return self.queryset.filter(rider__user=user)
        return self.queryset

class RiderMonthlySettlementViewSet(viewsets.ModelViewSet):
    queryset = RiderMonthlySettlement.objects.all().select_related('rider__user')
    serializer_class = RiderMonthlySettlementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'rider':
            return self.queryset.filter(rider__user=user)
        return self.queryset

    @action(detail=True, methods=['post'])
    def pay_salary(self, request, pk=None):
        if request.user.role not in ['superadmin', 'admin']:
            return Response({'error': 'Unauthorized'}, status=403)
            
        settlement = self.get_object()
        if settlement.status == 'Paid':
            return Response({'error': 'Already paid'}, status=400)
            
        settlement.status = 'Paid'
        settlement.paid_at = timezone.now()
        settlement.save()
        
        # Update Wallet balance
        wallet = settlement.rider.wallet
        wallet.current_balance -= settlement.final_salary
        wallet.save()
        
        return Response({'status': 'Salary paid successfully'})

    @action(detail=False, methods=['post'])
    def run_payroll(self, request):
        if request.user.role not in ['superadmin', 'admin']:
            return Response({'error': 'Unauthorized'}, status=403)
            
        from django.utils import timezone
        import calendar
        from decimal import Decimal
        from apps.tracking.models import RiderProfile, RiderMonthlySettlement, RiderSalaryTransaction, RiderWallet
        
        today = timezone.now().date()
        month_start = today.replace(day=1)
        _, last_day = calendar.monthrange(today.year, today.month)
        month_end = today.replace(day=last_day)
        
        riders = RiderProfile.objects.filter(is_active=True)
        created_count = 0
        
        for rider in riders:
            # Check if already exists for this month
            if RiderMonthlySettlement.objects.filter(rider=rider, month=month_start).exists():
                continue
                
            # Calculate from transactions
            txs = RiderSalaryTransaction.objects.filter(
                rider=rider, 
                created_at__date__range=[month_start, month_end],
                status='Processed'
            )
            
            base_salary = Decimal('0.00')
            if hasattr(rider, 'salary_config'):
                base_salary = rider.salary_config.monthly_fixed_salary
                
            incentives = txs.filter(transaction_type__icontains='Earning').aggregate(models.Sum('amount'))['amount__sum'] or Decimal('0.00')
            bonuses = txs.filter(transaction_type__icontains='Bonus').aggregate(models.Sum('amount'))['amount__sum'] or Decimal('0.00')
            penalties = txs.filter(transaction_type__icontains='Penalty').aggregate(models.Sum('amount'))['amount__sum'] or Decimal('0.00')
            
            # Cash Shortage from COD collections
            shortage = rider.cod_collections.filter(status='Shortage', created_at__date__range=[month_start, month_end]).aggregate(models.Sum('amount'))['amount__sum'] or Decimal('0.00')
            
            final_salary = base_salary + incentives + bonuses - penalties - shortage
            
            RiderMonthlySettlement.objects.create(
                rider=rider,
                month=month_start,
                base_salary=base_salary,
                per_order_incentive=incentives,
                attendance_bonus=bonuses,
                late_penalty=penalties,
                cash_shortage_deduction=shortage,
                final_salary=max(final_salary, Decimal('0.00')),
                completed_deliveries=txs.filter(transaction_type__icontains='Earning').count(),
                status='Pending'
            )
            created_count += 1
            
        return Response({'status': 'Payroll generated', 'created_count': created_count})
class RiderFinancialLogViewSet(viewsets.ModelViewSet):
    queryset = RiderFinancialLog.objects.all().select_related('rider__user')
    serializer_class = RiderFinancialLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'rider':
            return self.queryset.filter(rider__user=user)
        return self.queryset
