from rest_framework import serializers
from apps.tracking.models import Shipment, TrackingHistory, LiveOrderTracking
from .rider import RiderProfileSerializer

class LiveOrderTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveOrderTracking
        fields = ['latitude', 'longitude', 'timestamp']

class TrackingHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackingHistory
        fields = '__all__'

class ShipmentSerializer(serializers.ModelSerializer):
    rider = RiderProfileSerializer(read_only=True)
    history = TrackingHistorySerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    product_summary = serializers.SerializerMethodField()
    address = serializers.ReadOnlyField(source='order.address')
    phone = serializers.ReadOnlyField(source='order.phone')
    payment_method = serializers.ReadOnlyField(source='order.payment_method')
    order_id = serializers.ReadOnlyField(source='order.id')
    estimated_earning = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()

    vendor_info = serializers.SerializerMethodField()
    customer_info = serializers.SerializerMethodField()

    class Meta:
        model = Shipment
        fields = [
            'id', 'order', 'rider', 'tracking_number', 'status', 'delivery_otp',
            'parcel_weight', 'label_printed', 'estimated_delivery_time',
            'failed_reason', 'created_at', 'updated_at', 'customer_name',
            'product_summary', 'address', 'phone', 'payment_method', 'order_id',
            'estimated_earning', 'distance', 'history', 'vendor_info', 'customer_info',
            'picked_up_at', 'start_delivery_at', 'delivered_at',
            'distance_km', 'estimated_minutes',
        ]
        read_only_fields = ['tracking_number', 'created_at', 'updated_at', 'delivery_otp']

    def get_vendor_info(self, obj):
        vendor = obj.order.vendor
        if not vendor:
            return None
        return {
            'shop_name': vendor.shop_name,
            'address': vendor.shop_address,
            'city': vendor.city,
            'pincode': vendor.pincode,
            'phone': vendor.pickup_contact or vendor.user.phone,
            'lat': vendor.location_lat,
            'lng': vendor.location_lng,
        }

    def get_customer_info(self, obj):
        order = obj.order
        return {
            'name': f"{order.user.first_name} {order.user.last_name}" if order.user.first_name else order.user.username,
            'address': order.address,
            'phone': order.phone,
            'lat': order.latitude,
            'lng': order.longitude,
        }

    def _vendor_to_customer_km(self, obj):
        import math
        if obj.distance_km:
            return float(obj.distance_km)

        vendor = obj.order.vendor
        if not vendor or not vendor.location_lat or not vendor.location_lng:
            return 0.0
        dest_lat = obj.order.latitude
        dest_lng = obj.order.longitude
        if not dest_lat or not dest_lng:
            return 0.0

        def haversine(lat1, lon1, lat2, lon2):
            R = 6371
            phi1, phi2 = math.radians(lat1), math.radians(lat2)
            dphi = math.radians(lat2 - lat1)
            dlambda = math.radians(lon2 - lon1)
            a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
            return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return round(haversine(vendor.location_lat, vendor.location_lng, dest_lat, dest_lng), 2)

    def get_estimated_earning(self, obj):
        try:
            rider = obj.rider
            if not rider:
                request = self.context.get('request')
                rider = getattr(request.user, 'rider_profile', None) if request and hasattr(request, 'user') else None

            base_pay = 30.0
            if rider:
                from apps.tracking.models import SalaryConfiguration
                config, _ = SalaryConfiguration.objects.get_or_create(rider=rider)
                bp = float(config.per_delivery_commission or 0)
                base_pay = bp if bp > 0 else 30.0

            distance_km = self._vendor_to_customer_km(obj)
            petrol_rate = 10.0
            distance_allowance = round(distance_km * petrol_rate, 2)

            from django.utils import timezone as tz
            now = tz.now()
            bonus_incentive = 15.0 if 18 <= now.hour < 21 else 0.0
            penalty_risk = 0.0

            total = round(base_pay + distance_allowance + bonus_incentive - penalty_risk, 2)

            return {
                'total': total,
                'base_pay': base_pay,
                'distance_km': distance_km,
                'distance_allowance': distance_allowance,
                'petrol_rate': petrol_rate,
                'bonus_incentive': bonus_incentive,
                'penalty_risk': penalty_risk,
            }
        except Exception:
            return {
                'total': 40.0,
                'base_pay': 30.0,
                'distance_km': 0.0,
                'distance_allowance': 0.0,
                'petrol_rate': 10.0,
                'bonus_incentive': 0.0,
                'penalty_risk': 0.0,
            }

    def get_distance(self, obj):
        import math
        rider = obj.rider
        if not rider or not rider.current_lat or not rider.current_lng:
            return 0.0

        if obj.status in ['Picked Up', 'Start Delivery', 'In Transit', 'Reached']:
            dest_lat = obj.order.latitude
            dest_lng = obj.order.longitude
        else:
            dest_lat = obj.order.vendor.location_lat if obj.order.vendor else None
            dest_lng = obj.order.vendor.location_lng if obj.order.vendor else None

        if not dest_lat or not dest_lng:
            return 0.0

        def haversine(lat1, lon1, lat2, lon2):
            R = 6371
            phi1, phi2 = math.radians(lat1), math.radians(lat2)
            dphi = math.radians(lat2 - lat1)
            dlambda = math.radians(lon2 - lon1)
            a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
            return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return round(haversine(rider.current_lat, rider.current_lng, dest_lat, dest_lng), 1)

    def get_customer_name(self, obj):
        user = obj.order.user
        return f"{user.first_name} {user.last_name}" if user.first_name else user.username

    def get_product_summary(self, obj):
        items = obj.order.items.all()
        if not items.exists():
            return "No items"
        first_item = items.first().product.name
        count = items.count()
        if count > 1:
            return f"{first_item} + {count - 1} more"
        return first_item
