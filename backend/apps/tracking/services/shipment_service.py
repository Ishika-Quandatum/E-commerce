import random
import math
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied
from apps.tracking.models import Shipment, TrackingHistory, RiderProfile, CODCollection
from .finance_service import FinanceService

class ShipmentService:
    @staticmethod
    def accept_shipment(user, shipment_id):
        if user.role != 'rider':
            raise PermissionDenied('Only riders can accept shipments.')

        rider_profile = user.rider_profile

        try:
            with transaction.atomic():
                shipment = Shipment.objects.select_for_update().get(pk=shipment_id)

                if shipment.rider is not None:
                    raise ValidationError('This shipment has already been claimed by another rider.')

                if shipment.status != 'Dispatch Queue':
                    raise ValidationError('This shipment is no longer available in the queue.')

                # Calculate vendor -> customer distance on assignment
                try:
                    vendor = shipment.order.vendor
                    order = shipment.order
                    if (vendor and vendor.location_lat and vendor.location_lng
                            and order.latitude and order.longitude):
                        def _hav(lat1, lon1, lat2, lon2):
                            R = 6371
                            p1, p2 = math.radians(lat1), math.radians(lat2)
                            dp = math.radians(lat2 - lat1)
                            dl = math.radians(lon2 - lon1)
                            a = math.sin(dp / 2)**2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2)**2
                            return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

                        dist_km = round(_hav(
                            vendor.location_lat, vendor.location_lng,
                            order.latitude, order.longitude
                        ), 2)
                        
                        est_minutes = max(5, round((dist_km / 20) * 60))
                        shipment.distance_km = dist_km
                        shipment.estimated_minutes = est_minutes
                except Exception as dist_err:
                    print(f"[WARN] Distance calc failed on accept: {dist_err}")

                shipment.rider = rider_profile
                shipment.status = 'Assigned'
                shipment.save()

                shipment.order.status = 'Accepted'
                shipment.order.save()

                TrackingHistory.objects.create(
                    shipment=shipment,
                    status='Assigned',
                    description=f'Claimed by rider {user.username}'
                )

                return {
                    'status': 'claimed',
                    'message': 'You have successfully accepted this task.',
                    'distance_km': float(shipment.distance_km) if shipment.distance_km else None,
                    'estimated_minutes': shipment.estimated_minutes,
                }
        except Shipment.DoesNotExist:
            raise ValidationError('Shipment not found.')

    @staticmethod
    def update_dispatch_status(shipment, new_status):
        valid_statuses = [
            'Dispatch Queue', 'Assigned', 'Start Pickup', 'Picked Up', 
            'Start Delivery', 'In Transit', 'Reached', 'Delivered',
            'Rejected', 'Failed', 'Returned'
        ]
        
        if new_status not in valid_statuses:
            raise ValidationError(f'Invalid status transition: {new_status}')
            
        shipment.status = new_status
        now = timezone.now()
        
        if new_status == 'Assigned' and not shipment.assigned_at:
            shipment.assigned_at = now
        elif new_status == 'Picked Up' and not shipment.picked_up_at:
            shipment.picked_up_at = now
        elif new_status == 'Start Delivery' and not shipment.start_delivery_at:
            shipment.start_delivery_at = now
        elif new_status == 'Delivered' and not shipment.delivered_at:
            shipment.delivered_at = now
            
        shipment.save()

        # Sync Order Status
        if new_status in ['Picked Up', 'Start Delivery', 'In Transit']:
            shipment.order.status = 'Shipped'
            shipment.order.save()
        elif new_status == 'Delivered':
            shipment.order.status = 'Delivered'
            shipment.order.save()

        TrackingHistory.objects.create(
            shipment=shipment, 
            status=new_status, 
            description=f'Shipment status updated to {new_status}'
        )
        return {'status': 'updated', 'new_status': shipment.status}

    @staticmethod
    def assign_rider(shipment, rider_id):
        try:
            rider = RiderProfile.objects.get(id=rider_id)
            shipment.rider = rider
            shipment.status = 'Assigned'
            shipment.save()
            TrackingHistory.objects.create(
                shipment=shipment, 
                status='Assigned', 
                description=f'Assigned to rider {rider.user.username}'
            )
            return {'status': 'Rider assigned successfully'}
        except RiderProfile.DoesNotExist:
            raise ValidationError('Rider not found')

    @staticmethod
    def assign_nearest_rider(shipment):
        vendor = shipment.order.vendor
        if not vendor or not vendor.location_lat or not vendor.location_lng:
            raise ValidationError('Vendor location not configured.')
            
        def get_distance(lat1, lon1, lat2, lon2):
            R = 6371
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
            TrackingHistory.objects.create(
                shipment=shipment, 
                status='Assigned', 
                description=f'Auto-assigned to nearest rider {nearest_rider.user.username} ({min_distance:.2f} km)'
            )
            
            from apps.tracking.serializers import RiderProfileSerializer
            return {
                'message': f'Rider {nearest_rider.user.username} assigned (Distance: {min_distance:.2f} km)',
                'rider': RiderProfileSerializer(nearest_rider).data,
                'distance': round(min_distance, 2)
            }
            
        raise ValidationError('No available riders found nearby.')

    @staticmethod
    def finalize_dispatch(shipment, parcel_weight):
        shipment.status = 'Dispatched'
        shipment.delivery_otp = str(random.randint(100000, 999999))
        if parcel_weight:
            shipment.parcel_weight = parcel_weight
        shipment.label_printed = True
        shipment.save()
        
        shipment.order.status = 'Shipped'
        shipment.order.save()

        TrackingHistory.objects.create(
            shipment=shipment, 
            status='Dispatched', 
            description=f'Shipment dispatched with weight {parcel_weight}kg'
        )
        return {'status': 'Dispatched', 'otp': shipment.delivery_otp, 'tracking_number': shipment.tracking_number}

    @staticmethod
    def mark_delivered(shipment, platform_name="RainbowStore"):
        if shipment.status == 'Delivered':
            return {'status': 'Already delivered'}

        shipment.status = 'Delivered'
        shipment.save()
        
        shipment.order.status = 'Delivered'
        shipment.order.save()
        
        TrackingHistory.objects.create(
            shipment=shipment, 
            status='Delivered', 
            description='Shipment delivered manually by rider'
        )
        
        customer_phone = shipment.order.phone
        order_id = shipment.order.id
        p_method = shipment.order.payment_method.lower()
        
        # 1. COD Collection Logic
        if 'cod' in p_method or 'cash' in p_method:
            CODCollection.objects.get_or_create(
                shipment=shipment,
                rider=shipment.rider,
                defaults={'amount': shipment.order.total_price}
            )

        # 2. Universal Delivery Earning Logic
        delivery_earning = Decimal('0.00')
        try:
            delivery_earning = FinanceService.process_delivery_earnings(shipment, p_method)
        except Exception as finance_err:
            print(f"[ERROR] Rider Finance update failed: {finance_err}")

        print(f"\n[SMS SIMULATION] >>> Sent to {customer_phone}: Hello! Your order #{order_id} from {platform_name} has been successfully delivered by our partner. Enjoy your purchase!\n")

        return {'status': 'Delivered successfully', 'earning': float(delivery_earning)}
