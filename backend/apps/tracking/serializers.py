from rest_framework import serializers
from .models import (
    RiderProfile, Shipment, TrackingHistory, Attendance, RiderWallet, 
    SalaryConfiguration, Transaction, CODCollection, RiderMonthlySettlement, 
    RiderWalletTransaction, RiderSalaryTransaction, LiveOrderTracking, RiderFinancialLog
)
from apps.users.serializers import UserSerializer

class LiveOrderTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveOrderTracking
        fields = ['latitude', 'longitude', 'timestamp']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class RiderWalletTransactionSerializer(serializers.ModelSerializer):
    rider_name = serializers.ReadOnlyField(source='rider.user.get_full_name')
    class Meta:
        model = RiderWalletTransaction
        fields = '__all__'
        read_only_fields = ['rider', 'status', 'created_at', 'verified_at']

class RiderSalaryTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderSalaryTransaction
        fields = '__all__'

class RiderMonthlySettlementSerializer(serializers.ModelSerializer):
    rider_name = serializers.ReadOnlyField(source='rider.user.get_full_name')
    month_display = serializers.SerializerMethodField()

    class Meta:
        model = RiderMonthlySettlement
        fields = '__all__'

    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')

class SalaryConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryConfiguration
        fields = '__all__'

class CODCollectionSerializer(serializers.ModelSerializer):
    rider_name = serializers.ReadOnlyField(source='rider.user.get_full_name')
    customer_name = serializers.SerializerMethodField()
    tracking_number = serializers.ReadOnlyField(source='shipment.tracking_number')
    order_id = serializers.ReadOnlyField(source='shipment.order.id')
    order_date = serializers.ReadOnlyField(source='shipment.order.created_at')
    def get_payment_method(self, obj):
        method = obj.shipment.order.payment_method
        if not method:
            return 'COD'
        m = method.lower()
        if m == 'cod' or 'cash' in m:
            return 'COD'
        return 'Online'
    
    payment_method = serializers.SerializerMethodField()
    
    # Financial Breakdown
    product_amount = serializers.SerializerMethodField()
    shipping_charge = serializers.SerializerMethodField()
    tax = serializers.SerializerMethodField()
    total_amount = serializers.ReadOnlyField(source='amount') # Use the collection amount as total

    class Meta:
        model = CODCollection
        fields = '__all__'

    def get_customer_name(self, obj):
        user = obj.shipment.order.user
        return f"{user.first_name} {user.last_name}" if user.first_name else user.username

    def get_product_amount(self, obj):
        order = obj.shipment.order
        total = order.total_price or 0
        ship = getattr(order, 'shipping_charge', 0) or 0
        tax = getattr(order, 'tax_amount', 0) or 0
        return total - ship - tax

    def get_shipping_charge(self, obj):
        return getattr(obj.shipment.order, 'shipping_charge', 0.00) or 0.00

    def get_tax(self, obj):
        return getattr(obj.shipment.order, 'tax_amount', 0.00) or 0.00

class RiderWalletSerializer(serializers.ModelSerializer):
    total_orders_delivered = serializers.SerializerMethodField()
    recent_cod_collections = serializers.SerializerMethodField()
    recent_wallet_submissions = serializers.SerializerMethodField()
    today_earnings = serializers.SerializerMethodField()
    
    # Dynamic calculations to ensure accuracy
    total_cod_collected = serializers.SerializerMethodField()
    total_cod_submitted = serializers.SerializerMethodField()
    pending_cod_amount = serializers.SerializerMethodField()
    total_incentives = serializers.SerializerMethodField()

    class Meta:
        model = RiderWallet
        fields = '__all__'

    def get_total_orders_delivered(self, obj):
        return Shipment.objects.filter(rider=obj.rider, status='Delivered').count()

    def get_recent_cod_collections(self, obj):
        cods = CODCollection.objects.filter(rider=obj.rider).order_by('-created_at')[:20]
        return CODCollectionSerializer(cods, many=True, context=self.context).data

    def get_recent_wallet_submissions(self, obj):
        subs = RiderWalletTransaction.objects.filter(rider=obj.rider).order_by('-created_at')[:10]
        return RiderWalletTransactionSerializer(subs, many=True, context=self.context).data

    def get_today_earnings(self, obj):
        from django.db.models import Sum
        from django.utils import timezone
        today = timezone.now().date()
        earnings = RiderSalaryTransaction.objects.filter(
            rider=obj.rider, 
            created_at__date=today
        ).aggregate(total=Sum('amount'))['total'] or 0
        return float(earnings)

    def get_total_cod_collected(self, obj):
        from django.db.models import Sum
        total = CODCollection.objects.filter(rider=obj.rider).aggregate(total=Sum('amount'))['total'] or 0
        return float(total)

    def get_pending_cod_amount(self, obj):
        from django.db.models import Sum
        pending = CODCollection.objects.filter(rider=obj.rider, status='Pending').aggregate(total=Sum('amount'))['total'] or 0
        return float(pending)

    def get_total_cod_submitted(self, obj):
        collected = self.get_total_cod_collected(obj)
        pending = self.get_pending_cod_amount(obj)
        return collected - pending

    def get_total_incentives(self, obj):
        from django.db.models import Sum
        incentives = RiderSalaryTransaction.objects.filter(
            rider=obj.rider,
            transaction_type__in=['Distance Bonus', 'Peak Hour Bonus', 'Referral Bonus']
        ).aggregate(total=Sum('amount'))['total'] or 0
        return float(incentives)

class RiderProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_orders_count = serializers.SerializerMethodField()
    rider_name = serializers.ReadOnlyField(source='user.get_full_name')
    wallet = RiderWalletSerializer(read_only=True)
    last_activity = serializers.SerializerMethodField()

    class Meta:
        model = RiderProfile
        fields = [
            'id', 'user', 'rider_name', 'address', 'city', 'vehicle_type', 'vehicle_number',
            'license_number', 'license_image', 'id_proof_image', 'profile_photo',
            'bank_account_number', 'ifsc_code', 'emergency_contact', 'verification_status',
            'is_active', 'rejection_reason', 'availability_status', 'rating',
            'total_distance', 'join_date', 'assigned_orders_count', 'wallet', 'last_activity'
        ]
    
    def get_assigned_orders_count(self, obj):
        return obj.assigned_shipments.count()

    def get_last_activity(self, obj):
        shipment = obj.assigned_shipments.order_by('-updated_at').first()
        return shipment.updated_at if shipment else getattr(obj, 'join_date', None)

class AdminRiderSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    phone = serializers.CharField(write_only=True)
    address = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(read_only=True)

    class Meta:
        model = RiderProfile
        fields = ['id', 'full_name', 'username', 'email', 'phone', 'address', 'vehicle_type', 'license_number', 'password']

    def create(self, validated_data):
        import secrets
        import string
        from apps.users.models import User
        from django.db import transaction

        full_name = validated_data.pop('full_name').split(' ')
        first_name = full_name[0]
        last_name = " ".join(full_name[1:]) if len(full_name) > 1 else ""
        
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        phone = validated_data.pop('phone')
        address = validated_data.pop('address', '')

        alphabet = string.ascii_letters + string.digits
        password = ''.join(secrets.choice(alphabet) for i in range(12))

        from django.db import IntegrityError
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    role='rider',
                    phone=phone,
                    address=address
                )
                
                rider_profile = RiderProfile.objects.create(
                    user=user,
                    vehicle_type=validated_data.get('vehicle_type', ''),
                    license_number=validated_data.get('license_number', ''),
                    is_active=True,
                    verification_status='Approved'
                )
                
                rider_profile.generated_password = password
                return rider_profile
        except IntegrityError as e:
            error_msg = str(e).lower()
            if 'username' in error_msg:
                raise serializers.ValidationError({"username": "This username is already taken."})
            if 'email' in error_msg:
                raise serializers.ValidationError({"email": "This email is already registered."})
            if 'phone' in error_msg:
                raise serializers.ValidationError({"phone": "This phone number is already registered."})
            raise serializers.ValidationError({"error": f"Failed to create rider account: {str(e)}"})

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['password'] = getattr(instance, 'generated_password', None)
        return data

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
            'picked_up_at', 'start_delivery_at', 'delivered_at'
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
            'lng': vendor.location_lng
        }

    def get_customer_info(self, obj):
        order = obj.order
        return {
            'name': f"{order.user.first_name} {order.user.last_name}" if order.user.first_name else order.user.username,
            'address': order.address,
            'phone': order.phone,
            'lat': order.latitude,
            'lng': order.longitude
        }

    def get_estimated_earning(self, obj):
        try:
            # Always try to use the assigned rider's config first
            rider = obj.rider
            if not rider:
                # Fallback to logged-in rider (for new task queue)
                request = self.context.get('request')
                rider = getattr(request.user, 'rider_profile', None) if request and request.user else None
            
            if rider:
                from apps.tracking.models import SalaryConfiguration
                config, _ = SalaryConfiguration.objects.get_or_create(rider=rider)
                return float(config.per_delivery_commission)
            
            return 40.0 # Global fallback if no rider context at all
        except Exception as e:
            return 40.0

    def get_distance(self, obj):
        import math
        rider = obj.rider
        
        if not rider or not rider.current_lat or not rider.current_lng:
            return 0.0
            
        # Destination logic: If not picked up -> Vendor. If picked up -> Customer.
        if obj.status in ['Picked Up', 'Start Delivery', 'In Transit', 'Reached']:
            dest_lat = obj.order.latitude
            dest_lng = obj.order.longitude
        else:
            dest_lat = obj.order.vendor.location_lat if obj.order.vendor else None
            dest_lng = obj.order.vendor.location_lng if obj.order.vendor else None

        if not dest_lat or not dest_lng:
            return 0.0
            
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371  # earth radius in km
            phi1, phi2 = math.radians(lat1), math.radians(lat2)
            dphi = math.radians(lat2 - lat1)
            dlambda = math.radians(lon2 - lon1)
            a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
            return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        dist = haversine(rider.current_lat, rider.current_lng, dest_lat, dest_lng)
        return round(dist, 1)

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

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'

class RiderFinancialLogSerializer(serializers.ModelSerializer):
    rider_name = serializers.ReadOnlyField(source='rider.user.get_full_name')

    class Meta:
        model = RiderFinancialLog
        fields = '__all__'

class PublicRiderRegistrationSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    email = serializers.EmailField()
    phone = serializers.CharField()
    
    class Meta:
        model = RiderProfile
        fields = [
            'full_name', 'email', 'phone', 'password', 'confirm_password',
            'address', 'city', 'vehicle_type', 'vehicle_number', 'license_number',
            'license_image', 'id_proof_image', 'profile_photo',
            'bank_account_number', 'ifsc_code', 'emergency_contact'
        ]

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        from apps.users.models import User
        from django.db import transaction, IntegrityError
        
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        full_name = validated_data.pop('full_name').split(' ')
        first_name = full_name[0]
        last_name = " ".join(full_name[1:]) if len(full_name) > 1 else ""
        
        email = validated_data.pop('email')
        phone = validated_data.pop('phone')
        
        # Ensure unique username
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    role='rider',
                    is_active=False,  # Rider cannot login until admin approves
                    phone=phone,
                    address=validated_data.get('address', '')
                )
                
                rider_profile = RiderProfile.objects.create(
                    user=user,
                    **validated_data
                )
                return rider_profile
        except IntegrityError as e:
            error_msg = str(e).lower()
            if 'email' in error_msg:
                raise serializers.ValidationError({"email": "This email is already registered."})
            if 'phone' in error_msg:
                raise serializers.ValidationError({"phone": "This phone number is already registered."})
            raise serializers.ValidationError({"error": f"Registration failed: {str(e)}"})
