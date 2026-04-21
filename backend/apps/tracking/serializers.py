from rest_framework import serializers
from .models import RiderProfile, Shipment, TrackingHistory, Attendance, RiderWallet, SalaryConfiguration, Transaction
from apps.users.serializers import UserSerializer

class RiderProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_orders_count = serializers.SerializerMethodField()

    class Meta:
        model = RiderProfile
        fields = '__all__'
    
    def get_assigned_orders_count(self, obj):
        return obj.assigned_shipments.count()

class AdminRiderSerializer(serializers.ModelSerializer):
    """
    Serializer for Super Admin to create a Delivery Boy account.
    Handles nested User account creation with auto-password generation.
    """
    full_name = serializers.CharField(write_only=True)
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    phone = serializers.CharField(write_only=True)
    address = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(read_only=True) # Return the generated password to admin

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

        # Generate secure password
        alphabet = string.ascii_letters + string.digits
        password = ''.join(secrets.choice(alphabet) for i in range(12))

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
                is_active=True
            )
            
            # Attaching the password temporarily to the instance so the serializer can return it
            rider_profile.generated_password = password
            return rider_profile

    def update(self, instance, validated_data):
        from django.db import transaction
        
        user = instance.user
        full_name_input = validated_data.pop('full_name', None)
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', None)
        phone = validated_data.pop('phone', None)
        address = validated_data.pop('address', None)
        
        with transaction.atomic():
            # Update User fields if provided
            if full_name_input:
                parts = full_name_input.split(' ')
                user.first_name = parts[0]
                user.last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
            
            if username: user.username = username
            if email: user.email = email
            if phone: user.phone = phone
            if address: user.address = address
            user.save()
            
            # Update Profile fields
            instance.vehicle_type = validated_data.get('vehicle_type', instance.vehicle_type)
            instance.license_number = validated_data.get('license_number', instance.license_number)
            instance.save()
            
            return instance

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
    order_id = serializers.ReadOnlyField(source='order.id')
    
    class Meta:
        model = Shipment
        fields = '__all__'
        read_only_fields = ['tracking_number', 'created_at', 'updated_at', 'delivery_otp']

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


class SalaryConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryConfiguration
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'


class RiderWalletSerializer(serializers.ModelSerializer):
    transactions = TransactionSerializer(many=True, read_only=True)
    
    class Meta:
        model = RiderWallet
        fields = '__all__'
