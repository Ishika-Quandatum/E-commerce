from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.utils import timezone
from decimal import Decimal
from django.db.models import Sum, Q

# Models
from .models import (
    Shipment, RiderProfile, TrackingHistory, Attendance, RiderWallet, 
    SalaryConfiguration, Transaction, CODCollection, RiderMonthlySettlement, 
    RiderWalletTransaction, RiderSalaryTransaction, LiveOrderTracking, RiderFinancialLog
)

# Serializers
from .serializers import (
    ShipmentSerializer, RiderProfileSerializer, AdminRiderSerializer,
    AttendanceSerializer, RiderWalletSerializer, SalaryConfigurationSerializer,
    CODCollectionSerializer, RiderMonthlySettlementSerializer,
    RiderWalletTransactionSerializer, RiderSalaryTransactionSerializer,
    LiveOrderTrackingSerializer, RiderFinancialLogSerializer,
    PublicRiderRegistrationSerializer
)

# Services
from .services import ShipmentService, AttendanceService, FinanceService

# Optional Pagination for backward compatibility
from rest_framework.pagination import PageNumberPagination

class OptionalPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        if 'page' not in request.query_params and 'paginate' not in request.query_params:
            return None
        return super().paginate_queryset(queryset, request, view)


class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all().select_related(
        'order', 'order__user', 'rider', 'rider__user', 'order__vendor', 'order__vendor__user'
    ).prefetch_related(
        'order__items', 'order__items__product', 'order__items__product__images', 'history'
    )
    serializer_class = ShipmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = OptionalPagination

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        
        # Role-based scoping
        if user.role == 'rider':
            queryset = queryset.filter(rider__user=user)
        elif user.role == 'user':
            queryset = queryset.filter(order__user=user)
        elif user.role == 'vendor':
            queryset = queryset.filter(order__vendor__user=user)
            
        # Filters
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        payment_method_filter = self.request.query_params.get('payment_method')
        if payment_method_filter:
            queryset = queryset.filter(order__payment_method__icontains=payment_method_filter)
            
        return queryset

    @action(detail=False, methods=['get'])
    def open_queue(self, request):
        """Returns shipments that are ready for dispatch but have no rider assigned."""
        queryset = Shipment.objects.filter(
            status='Dispatch Queue',
            rider__isnull=True
        ).select_related('order', 'order__user', 'order__vendor').prefetch_related('order__items', 'order__items__product')
        
        # Paginate if parameter is present
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def accept_shipment(self, request, pk=None):
        """Atomic logic for a rider to claim an unassigned shipment."""
        try:
            res = ShipmentService.accept_shipment(request.user, pk)
            return Response(res)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValidationError as e:
            return Response({'error': e.detail[0] if isinstance(e.detail, list) else e.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def update_dispatch_status(self, request, pk=None):
        try:
            shipment = self.get_object()
            new_status = request.data.get('status')
            res = ShipmentService.update_dispatch_status(shipment, new_status)
            return Response(res)
        except ValidationError as e:
            return Response({'error': e.detail[0] if isinstance(e.detail, list) else e.detail}, status=status.HTTP_400_BAD_REQUEST)

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
            res = ShipmentService.assign_rider(shipment, rider_id)
            return Response(res)
        except ValidationError as e:
            return Response({'error': e.detail[0] if isinstance(e.detail, list) else e.detail}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def assign_nearest_rider(self, request, pk=None):
        shipment = self.get_object()
        try:
            res = ShipmentService.assign_nearest_rider(shipment)
            return Response(res)
        except ValidationError as e:
            detail_str = e.detail[0] if isinstance(e.detail, list) else e.detail
            if "Vendor location" in str(detail_str):
                return Response({'error': detail_str}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'error': detail_str}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def finalize_dispatch(self, request, pk=None):
        shipment = self.get_object()
        parcel_weight = request.data.get('parcel_weight')
        res = ShipmentService.finalize_dispatch(shipment, parcel_weight)
        return Response(res)

    @action(detail=True, methods=['post'])
    def mark_delivered(self, request, pk=None):
        """Simple delivery confirmation with SMS notification to the customer."""
        shipment = self.get_object()
        res = ShipmentService.mark_delivered(shipment, platform_name="RainbowStore")
        return Response(res)

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
        
        request.user.rider_profile.current_lat = lat
        request.user.rider_profile.current_lng = lng
        request.user.rider_profile.save()
        
        return Response({'status': 'Location updated'})

    @action(detail=True, methods=['get'], url_path='customer-timeline')
    def customer_timeline(self, request, pk=None):
        """Returns a Flipkart-style grouped logistics timeline for the customer order page."""
        try:
            shipment = self.get_object()
            history = shipment.history.all().order_by('timestamp')
            order = shipment.order

            def fmt(dt):
                """Format: Fri, 13th Mar '26 - 9:39pm"""
                if not dt:
                    return None
                from django.utils.timezone import localtime
                dt = localtime(dt)
                day = dt.day
                suffix = 'th' if 11 <= day <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
                hour_12 = dt.hour % 12 or 12
                ampm = 'am' if dt.hour < 12 else 'pm'
                minute = dt.strftime('%M')
                date_part = dt.strftime(f"%a, {day}{suffix} %b '%y")
                return f"{date_part} - {hour_12}:{minute}{ampm}"

            def fmt_date(dt):
                """Format: Fri, 13th Mar '26"""
                if not dt:
                    return None
                from django.utils.timezone import localtime
                dt = localtime(dt)
                day = dt.day
                suffix = 'th' if 11 <= day <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
                return dt.strftime(f"%a, {day}{suffix} %b '%y")

            # ── Map internal statuses → customer section ────────────────────────
            SECTION_MAP = {
                'Dispatch Queue':    'ORDER_CONFIRMED',
                'Assigned':          'ORDER_CONFIRMED',
                'Arrived at Vendor': 'ORDER_CONFIRMED',
                'Start Pickup':      'ORDER_CONFIRMED',
                'Picked Up':         'SHIPPED',
                'Start Delivery':    'SHIPPED',
                'In Transit':        'SHIPPED',
                'Out for Delivery':  'OUT_FOR_DELIVERY',
                'Reached':           'OUT_FOR_DELIVERY',
                'Delivered':         'DELIVERED',
            }

            CUSTOMER_MESSAGES = {
                'Dispatch Queue':    'Seller has processed your order.',
                'Assigned':          'A delivery partner has been assigned to your order.',
                'Arrived at Vendor': 'Delivery partner has arrived at the pickup location.',
                'Start Pickup':      'Delivery partner is heading to pick up your parcel.',
                'Picked Up':         'Your parcel has been picked up by the delivery partner.',
                'Start Delivery':    'Your item is now in transit.',
                'In Transit':        'Your item has been received at a hub nearest to you.',
                'Out for Delivery':  'Your order is out for delivery.',
                'Reached':           'Your item is out for delivery.',
                'Delivered':         'Your item has been delivered.',
            }

            # ── Determine current section ───────────────────────────────────────
            current_shipment_status = shipment.status
            reached_sections = set()
            events_by_section = {'ORDER_CONFIRMED': [], 'SHIPPED': [], 'OUT_FOR_DELIVERY': [], 'DELIVERED': []}

            # Always add order placed event
            events_by_section['ORDER_CONFIRMED'].append({
                'message': 'Your order has been placed.',
                'timestamp': fmt(order.created_at),
                'raw_ts': order.created_at.isoformat() if order.created_at else None,
            })
            reached_sections.add('ORDER_CONFIRMED')

            for entry in history:
                section = SECTION_MAP.get(entry.status)
                if not section:
                    continue
                reached_sections.add(section)
                events_by_section[section].append({
                    'message': CUSTOMER_MESSAGES.get(entry.status, entry.description or entry.status),
                    'timestamp': fmt(entry.timestamp),
                    'raw_ts': entry.timestamp.isoformat() if entry.timestamp else None,
                })

            # ── Section date labels ─────────────────────────────────────────────
            def first_ts_in_section(section_key):
                for entry in history:
                    if SECTION_MAP.get(entry.status) == section_key:
                        return fmt_date(entry.timestamp)
                return None

            # ── Is out-for-delivery reached? (controls rider visibility) ────────
            is_out_for_delivery = current_shipment_status in ['Out for Delivery', 'Reached', 'Delivered']

            # ── Rider info (masked unless out for delivery) ─────────────────────
            rider_info = None
            if shipment.rider:
                if is_out_for_delivery:
                    full_phone = shipment.rider.user.phone or ''
                    # Mask: show first 2 and last 2 digits only
                    masked = full_phone[:2] + '****' + full_phone[-2:] if len(full_phone) >= 4 else full_phone
                    rider_info = {
                        'name': shipment.rider.user.get_full_name() or shipment.rider.user.username,
                        'vehicle': shipment.rider.vehicle_type,
                        'phone_masked': masked,
                        'phone_raw': full_phone,   # used for tel: link backend-side
                    }
                else:
                    rider_info = {'name': None, 'vehicle': None, 'phone_masked': None, 'phone_raw': None}

            # ── Build response ─────────────────────────────────────────────────
            sections = [
                {
                    'key': 'ORDER_CONFIRMED',
                    'label': 'Order Confirmed',
                    'date': fmt_date(order.created_at),
                    'active': 'ORDER_CONFIRMED' in reached_sections,
                    'events': events_by_section['ORDER_CONFIRMED'],
                },
                {
                    'key': 'SHIPPED',
                    'label': 'Shipped',
                    'date': first_ts_in_section('SHIPPED'),
                    'tracking_number': str(shipment.tracking_number),
                    'courier': 'Our Delivery Partner',
                    'active': 'SHIPPED' in reached_sections,
                    'events': events_by_section['SHIPPED'],
                },
                {
                    'key': 'OUT_FOR_DELIVERY',
                    'label': 'Out For Delivery',
                    'date': first_ts_in_section('OUT_FOR_DELIVERY'),
                    'active': 'OUT_FOR_DELIVERY' in reached_sections,
                    'events': events_by_section['OUT_FOR_DELIVERY'],
                },
                {
                    'key': 'DELIVERED',
                    'label': 'Delivered',
                    'date': fmt_date(shipment.delivered_at),
                    'active': 'DELIVERED' in reached_sections,
                    'events': events_by_section['DELIVERED'],
                },
            ]

            return Response({
                'shipment_id': shipment.id,
                'current_status': current_shipment_status,
                'is_out_for_delivery': is_out_for_delivery,
                'rider': rider_info,
                'sections': sections,
            })
        except Exception as e:
            import traceback
            return Response({'error': str(e), 'trace': traceback.format_exc()}, status=500)

    @action(detail=True, methods=['get'], url_path='track')
    def track(self, request, pk=None):
        try:
            shipment = self.get_object()
            
            latest_tracking = LiveOrderTracking.objects.filter(shipment=shipment).order_by('-timestamp').first()
            history = LiveOrderTracking.objects.filter(shipment=shipment).order_by('-timestamp')[:20]
            
            items_data = []
            for item in shipment.order.items.all():
                product = item.product
                image_url = None
                if product:
                    try:
                        first_image = product.images.first()
                        if first_image and hasattr(first_image, 'image') and first_image.image:
                            image_url = first_image.image.url
                    except Exception:
                        image_url = None

                    items_data.append({
                        'name': product.name if product else "Unknown Product",
                        'qty': item.quantity,
                        'price': float(item.price),
                        'image': image_url
                    })

            vendor = shipment.order.vendor
            data = {
                'id': shipment.id,
                'shipment_status': shipment.status,
                'order_status': shipment.order.status,
                'tracking_number': shipment.tracking_number,
                'rider_info': {
                    'name': shipment.rider.user.get_full_name() if shipment.rider else "Not Assigned",
                    'phone': shipment.rider.user.phone if shipment.rider else "",
                    'vehicle': shipment.rider.vehicle_type if shipment.rider else "Bike",
                },
                'vendor_info': {
                    'shop_name': vendor.shop_name if vendor else "N/A",
                    'address': vendor.shop_address if vendor else "N/A",
                    'phone': (vendor.pickup_contact or vendor.user.phone) if vendor else "N/A",
                    'lat': vendor.location_lat if vendor else None,
                    'lng': vendor.location_lng if vendor else None
                },
                'customer_info': {
                    'name': shipment.order.user.get_full_name() or shipment.order.user.username,
                    'address': shipment.order.address,
                    'phone': shipment.order.phone,
                    'lat': shipment.order.latitude or 12.9716,
                    'lng': shipment.order.longitude or 77.5946
                },
                'current_location': LiveOrderTrackingSerializer(latest_tracking).data if latest_tracking else None,
                'location_history': LiveOrderTrackingSerializer(history, many=True).data,
                'eta': shipment.estimated_delivery_time,
                'payment_method': shipment.order.payment_method,
                'order_date': shipment.order.created_at,
                'order_items': items_data
            }
            return Response(data)
        except Exception as e:
            print(f"[TRACKING ERROR] {str(e)}")
            return Response({'error': 'Internal server error while fetching tracking data', 'details': str(e)}, status=500)

    @action(detail=False, methods=['get'])
    def current_active_task(self, request):
        """Returns the most relevant active task for the logged-in rider."""
        if request.user.role != 'rider':
            return Response({'error': 'Unauthorized'}, status=403)
        
        active_statuses = ['Assigned', 'Start Pickup', 'Picked Up', 'Start Delivery', 'In Transit', 'Reached']
        shipment = Shipment.objects.filter(
            rider__user=request.user, 
            status__in=active_statuses
        ).first()
        
        if not shipment:
            return Response({'message': 'No active task found'}, status=404)
            
        return self.track(request, pk=shipment.pk)


class RiderViewSet(viewsets.ModelViewSet):
    queryset = RiderProfile.objects.all().select_related('user', 'wallet').prefetch_related('assigned_shipments')
    serializer_class = RiderProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = OptionalPagination

    def get_serializer_class(self):
        if self.action == 'create' and self.request.user.role in ['superadmin', 'admin']:
            return AdminRiderSerializer
        return self.serializer_class
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = PublicRiderRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            rider = serializer.save()
            return Response({
                'message': 'Registration successful. Your application is now pending verification.',
                'rider_id': rider.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def pending_requests(self, request):
        if request.user.role not in ['superadmin', 'admin']:
            return Response({'error': 'Unauthorized'}, status=403)
        
        pending = self.queryset.filter(verification_status='Pending')
        
        page = self.paginate_queryset(pending)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        return Response(self.serializer_class(pending, many=True, context={'request': request}).data)

    @action(detail=False, methods=['get'])
    def request_stats(self, request):
        if request.user.role not in ['superadmin', 'admin']:
            return Response({'error': 'Unauthorized'}, status=403)
        
        pending = self.queryset.filter(verification_status='Pending').count()
        approved = self.queryset.filter(verification_status='Approved').count()
        rejected = self.queryset.filter(verification_status='Rejected').count()
        
        return Response({
            'total_pending': pending,
            'total_approved': approved,
            'total_rejected': rejected
        })

    @action(detail=True, methods=['patch'])
    def update_verification_status(self, request, pk=None):
        if request.user.role not in ['superadmin', 'admin']:
            return Response({'error': 'Unauthorized'}, status=403)
        
        rider = self.get_object()
        new_status = request.data.get('status')
        reason = request.data.get('reason', '')
        
        if new_status not in ['Approved', 'Rejected', 'Suspended', 'Pending Verification']:
            return Response({'error': 'Invalid status'}, status=400)
            
        if rider.verification_status == 'Rejected' and new_status == 'Approved':
            return Response({'error': 'A rejected rider application cannot be approved.'}, status=400)
        
        rider.verification_status = new_status
        if new_status == 'Approved':
            rider.is_active = True
            rider.user.is_active = True
            rider.user.save()
            rider.rejection_reason = None
        elif new_status == 'Rejected':
            rider.is_active = False
            rider.user.is_active = False
            rider.user.save()
            rider.rejection_reason = reason
        elif new_status == 'Suspended':
            rider.is_active = False
            rider.user.is_active = False
            rider.user.save()
            
        rider.save()
        return Response({'status': 'Verification status updated', 'new_status': rider.verification_status})

    @action(detail=False, methods=['get', 'patch'])
    def my_profile(self, request):
        try:
            rider_profile = request.user.rider_profile
        except RiderProfile.DoesNotExist:
            return Response({'error': 'Rider profile not found for this user.'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
        
        if request.method == 'GET':
            serializer = self.get_serializer(rider_profile, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = self.get_serializer(rider_profile, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)

    @action(detail=False, methods=['get'])
    def admin_rider_stats(self, request):
        if request.user.role not in ['superadmin', 'admin']:
            return Response({'error': 'Unauthorized'}, status=403)
        
        total = self.queryset.count()
        active = self.queryset.filter(is_active=True).count()
        online = self.queryset.filter(availability_status='Online').count()
        pending = Shipment.objects.filter(status__in=['Pending', 'Packed', 'Ready for Dispatch', 'Assigned', 'Start Pickup', 'Picked Up', 'Start Delivery', 'In Transit', 'Reached']).count()

        return Response({
            'total_delivery_boys': total,
            'active_riders': active,
            'online_now': online,
            'pending_deliveries': pending
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Returns statistics for the logged-in rider."""
        if request.user.role != 'rider':
            return Response({'error': 'Unauthorized'}, status=403)
            
        rider = request.user.rider_profile
        completed = Shipment.objects.filter(rider=rider, status='Delivered').count()
        active = Shipment.objects.filter(rider=rider, status__in=['Assigned', 'Start Pickup', 'Picked Up', 'Start Delivery', 'In Transit', 'Reached']).count()
        
        total_distance = completed * 5.2 # Mock average
        
        return Response({
            'completed_deliveries': completed,
            'active_orders': active,
            'total_distance_km': round(total_distance, 1),
            'rating': rider.rating,
            'wallet_balance': rider.wallet.current_balance if hasattr(rider, 'wallet') else 0.0
        })

    @action(detail=False, methods=['get'])
    def available_riders(self, request):
        riders = self.queryset.filter(is_active=True)
        return Response(self.serializer_class(riders, many=True, context={'request': request}).data)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        user = request.user
        if user.role != 'rider':
            return Response({'error': 'Unauthorized'}, status=403)
        
        rider = user.rider_profile
        today = timezone.now().date()
        
        today_earnings = RiderSalaryTransaction.objects.filter(
            rider=rider, 
            created_at__date=today
        ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
        
        today_shipments = Shipment.objects.filter(rider=rider, created_at__date=today)
        completed_today = today_shipments.filter(status='Delivered').count()
        pending_today = today_shipments.exclude(status__in=['Delivered', 'Cancelled', 'Returned']).count()
        
        recent_shipments = Shipment.objects.filter(rider=rider).order_by('-updated_at')[:5]
        recent_data = []
        for s in recent_shipments:
            recent_data.append({
                'id': f'#ORD-{s.order.id}',
                'name': s.order.user.get_full_name() or s.order.user.username,
                'time': s.updated_at.strftime('%I:%M %p') if s.updated_at.date() == today else s.updated_at.strftime('%b %d'),
                'earn': f'₹{s.order.total_price}',
                'status': s.status
            })

        return Response({
            'earnings': float(today_earnings),
            'completed': completed_today,
            'pending': pending_today,
            'distance': f"{rider.total_distance} km",
            'rating': float(rider.rating),
            'recent_activities': recent_data,
            'online_riders_count': RiderProfile.objects.filter(availability_status='Online', is_active=True).count()
        })

    @action(detail=True, methods=['post'])
    def add_bonus(self, request, pk=None):
        if request.user.role not in ['superadmin', 'admin']:
            return Response({'error': 'Unauthorized'}, status=403)
            
        rider = self.get_object()
        amount = request.data.get('amount')
        reason = request.data.get('reason', 'Manual Admin Bonus')
        
        if not amount:
            return Response({'error': 'Amount is required'}, status=400)
            
        try:
            wallet = FinanceService.add_bonus(rider, amount, reason)
            return Response({'status': 'Bonus added successfully', 'new_balance': float(wallet.current_balance)})
        except ValidationError as e:
            return Response({'error': e.detail[0] if isinstance(e.detail, list) else e.detail}, status=400)

    @action(detail=True, methods=['post'])
    def update_salary_config(self, request, pk=None):
        if request.user.role not in ['superadmin', 'admin']:
            return Response({'error': 'Unauthorized'}, status=403)
            
        rider = self.get_object()
        per_delivery = request.data.get('per_delivery_commission')
        base_salary = request.data.get('monthly_fixed_salary')
        
        config, _ = SalaryConfiguration.objects.get_or_create(rider=rider)
        
        if per_delivery is not None:
            config.per_delivery_commission = per_delivery
        if base_salary is not None:
            config.monthly_fixed_salary = base_salary
            
        config.save()
        return Response({'status': 'Salary configuration updated', 'per_delivery': float(config.per_delivery_commission)})

    @action(detail=False, methods=['get'])
    def active_tasks(self, request):
        user = request.user
        if user.role != 'rider':
            return Response({'error': 'Unauthorized'}, status=403)
        tasks = Shipment.objects.filter(
            rider__user=user,
            status__in=[
                'Assigned', 'Arrived at Vendor',
                'Start Pickup', 'Picked Up',
                'Out for Delivery', 'Start Delivery', 'In Transit', 'Reached',
                'Delivered'
            ]
        )
        return Response(ShipmentSerializer(tasks, many=True, context={'request': request}).data)

    def destroy(self, request, *args, **kwargs):
        from django.db import transaction
        instance = self.get_object()
        user = instance.user

        active_shipments = Shipment.objects.filter(
            rider=instance, 
            status__in=['Assigned', 'Start Pickup', 'Picked Up', 'Start Delivery', 'In Transit', 'Reached']
        )
        
        if active_shipments.exists():
            return Response({
                'error': f'Cannot delete rider. They have {active_shipments.count()} active shipments assigned. Please reassign or complete them first.'
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def wallet(self, request):
        user = request.user
        if user.role != 'rider':
            return Response({'error': 'Unauthorized'}, status=403)
        
        rider = user.rider_profile
        wallet, _ = RiderWallet.objects.get_or_create(rider=rider)
        
        total_collected = CODCollection.objects.filter(rider=rider).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
        pending_in_hand = CODCollection.objects.filter(rider=rider, status='Pending').aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
        submitted_cash = total_collected - pending_in_hand
        verified_cash = CODCollection.objects.filter(rider=rider, status='Verified').aggregate(Sum('submitted_amount'))['submitted_amount__sum'] or Decimal('0.00')
        
        today = timezone.now().date()
        today_earnings = RiderSalaryTransaction.objects.filter(
            rider=rider, 
            created_at__date=today
        ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
        
        cod_qs = CODCollection.objects.filter(rider=rider).order_by('-created_at')
        recent_collections = cod_qs[:50]
        recent_subs = RiderWalletTransaction.objects.filter(rider=rider).order_by('-created_at')[:20]
        
        data = {
            'total_cod_collected': total_collected,
            'pending_cod_amount': pending_in_hand,
            'total_cod_submitted': submitted_cash,
            'verified_amount': verified_cash,
            'today_earnings': today_earnings,
            'shortage_amount': wallet.shortage_amount,
            'current_balance': wallet.current_balance,
            'total_earned': wallet.total_earned,
            'recent_cod_collections': CODCollectionSerializer(recent_collections, many=True).data,
            'recent_wallet_submissions': RiderWalletTransactionSerializer(recent_subs, many=True).data
        }
        return Response(data)

    @action(detail=False, methods=['get'])
    def salary_details(self, request):
        user = request.user
        if user.role != 'rider':
            return Response({'error': 'Unauthorized'}, status=403)
        config = SalaryConfiguration.objects.get(rider__user=user)
        return Response(SalaryConfigurationSerializer(config).data)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().select_related('rider__user')
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = OptionalPagination

    def get_queryset(self):
        return self.queryset.filter(rider__user=self.request.user)

    @action(detail=False, methods=['post'])
    def punch_in(self, request):
        rider = request.user.rider_profile
        try:
            attendance = AttendanceService.punch_in(rider)
            return Response(AttendanceSerializer(attendance).data)
        except ValidationError as e:
            return Response({'error': e.detail[0] if isinstance(e.detail, list) else e.detail}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def punch_out(self, request):
        rider = request.user.rider_profile
        try:
            attendance = AttendanceService.punch_out(rider)
            return Response(AttendanceSerializer(attendance).data)
        except ValidationError as e:
            return Response({'error': e.detail[0] if isinstance(e.detail, list) else e.detail}, status=status.HTTP_400_BAD_REQUEST)


class CODCollectionViewSet(viewsets.ModelViewSet):
    queryset = CODCollection.objects.all().select_related('rider__user', 'shipment__order')
    serializer_class = CODCollectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = OptionalPagination

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        if user.role == 'rider':
            queryset = queryset.filter(rider__user=user)
        return queryset

    @action(detail=True, methods=['post'], url_path='mark_submitted')
    def mark_submitted(self, request, pk=None):
        cod = self.get_object()
        submitted_val = request.data.get('submitted_amount', cod.amount)
        notes = request.data.get('notes', cod.admin_notes)
        try:
            shortage = FinanceService.mark_submitted(cod, submitted_val, notes)
            return Response({'status': 'Payment submitted to Admin', 'shortage': float(shortage)})
        except ValidationError as e:
            return Response({'error': e.detail[0] if isinstance(e.detail, list) else e.detail}, status=status.HTTP_400_BAD_REQUEST)


class RiderWalletTransactionViewSet(viewsets.ModelViewSet):
    queryset = RiderWalletTransaction.objects.all().select_related('rider__user', 'cod_collection')
    serializer_class = RiderWalletTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = OptionalPagination

    def get_queryset(self):
        user = self.request.user
        if user.role == 'rider':
            return self.queryset.filter(rider__user=user)
        return self.queryset

    def perform_create(self, serializer):
        rider = self.request.user.rider_profile
        instance = serializer.save(rider=rider)
        
        cod_id = self.request.data.get('cod_collection')
        if cod_id:
            try:
                cod = CODCollection.objects.get(id=cod_id, rider=rider)
                cod.status = 'Submitted'
                cod.submitted_at = timezone.now()
                cod.submitted_amount = instance.amount
                cod.save()
            except CODCollection.DoesNotExist:
                pass
        else:
            pending_cods = CODCollection.objects.filter(rider=rider, status='Pending')
            if pending_cods.exists():
                pending_cods.update(
                    status='Submitted', 
                    submitted_at=timezone.now(),
                    submitted_amount=models.F('amount')
                )

    @action(detail=True, methods=['post'], url_path='verify_submission')
    def verify_submission(self, request, pk=None):
        if request.user.role not in ['superadmin', 'admin']:
            return Response({'error': 'Unauthorized'}, status=403)
            
        trans = self.get_object()
        status_update = request.data.get('status', 'Verified')
        notes = request.data.get('notes', '')
        
        try:
            success = FinanceService.verify_submission(trans, status_update, notes)
            if success:
                return Response({'status': 'Verified successfully'})
            return Response({'status': 'Update failed'}, status=400)
        except ValidationError as e:
            return Response({'error': e.detail[0] if isinstance(e.detail, list) else e.detail}, status=status.HTTP_400_BAD_REQUEST)


class RiderSalaryTransactionViewSet(viewsets.ModelViewSet):
    queryset = RiderSalaryTransaction.objects.all().select_related('rider__user', 'order')
    serializer_class = RiderSalaryTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = OptionalPagination

    def get_queryset(self):
        user = self.request.user
        if user.role == 'rider':
            return self.queryset.filter(rider__user=user)
        return self.queryset


class RiderMonthlySettlementViewSet(viewsets.ModelViewSet):
    queryset = RiderMonthlySettlement.objects.all().select_related('rider__user')
    serializer_class = RiderMonthlySettlementSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = OptionalPagination

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        if user.role == 'rider':
            queryset = queryset.filter(rider__user=user)
        else:
            status_filter = self.request.query_params.get('status')
            search_query = self.request.query_params.get('search')
            
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            if search_query:
                queryset = queryset.filter(
                    Q(rider__user__first_name__icontains=search_query) |
                    Q(rider__user__last_name__icontains=search_query) |
                    Q(rider__user__username__icontains=search_query)
                )
                
        return queryset

    @action(detail=True, methods=['post'], url_path='pay_rider')
    def pay_rider(self, request, pk=None):
        if request.user.role not in ['superadmin', 'admin']:
            return Response({'error': 'Unauthorized'}, status=403)
            
        settlement = self.get_object()
        payment_method = request.data.get('method', 'Bank Transfer')
        
        try:
            FinanceService.pay_rider(settlement, payment_method)
            return Response({'status': 'Rider paid successfully'})
        except ValidationError as e:
            return Response({'error': e.detail[0] if isinstance(e.detail, list) else e.detail}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def run_payroll(self, request):
        if request.user.role not in ['superadmin', 'admin']:
            return Response({'error': 'Unauthorized'}, status=403)
            
        created_count = FinanceService.run_payroll()
        return Response({'status': 'Payroll generated/updated', 'created_count': created_count})


class RiderFinancialLogViewSet(viewsets.ModelViewSet):
    queryset = RiderFinancialLog.objects.all().select_related('rider__user')
    serializer_class = RiderFinancialLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = OptionalPagination

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        if user.role == 'rider':
            queryset = queryset.filter(rider__user=user)
        else:
            rider_id = self.request.query_params.get('rider_id')
            if rider_id:
                queryset = queryset.filter(rider_id=rider_id)
        return queryset
