from rest_framework import serializers
from apps.tracking.models import RiderProfile
from apps.users.serializers import UserSerializer
from .finance import RiderWalletSerializer

class RiderProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_orders_count = serializers.SerializerMethodField()
    rider_name = serializers.ReadOnlyField(source='user.get_full_name')
    wallet = RiderWalletSerializer(read_only=True)
    last_activity = serializers.SerializerMethodField()

    class Meta:
        model = RiderProfile
        fields = [
            'id', 'user', 'rider_name', 'address', 'city', 'date_of_birth', 'gender',
            'vehicle_type', 'vehicle_number', 'rc_number', 'license_number',
            'insurance_number', 'insurance_valid_till', 'vehicle_image',
            'license_image', 'id_proof_image', 'profile_photo', 'bank_proof_image',
            'account_holder_name', 'bank_account_number', 'ifsc_code', 'bank_name',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            'verification_status', 'is_active', 'rejection_reason', 'availability_status', 
            'rating', 'total_distance', 'join_date', 'assigned_orders_count', 'wallet', 'last_activity'
        ]
    
    def get_assigned_orders_count(self, obj):
        return obj.assigned_shipments.count()

    def get_last_activity(self, obj):
        shipment = obj.assigned_shipments.order_by('-updated_at').first()
        return shipment.updated_at if shipment else getattr(obj, 'join_date', None)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and request.data:
            user = instance.user
            changed = False
            
            if 'phone' in request.data:
                user.phone = request.data['phone']
                changed = True
                
            if 'rider_name' in request.data:
                name_parts = request.data['rider_name'].split(' ', 1)
                user.first_name = name_parts[0]
                user.last_name = name_parts[1] if len(name_parts) > 1 else ''
                changed = True
                
            if changed:
                user.save()
                
        return super().update(instance, validated_data)

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
            'address', 'city', 'date_of_birth', 'gender',
            'vehicle_type', 'vehicle_number', 'rc_number', 'license_number',
            'insurance_number', 'insurance_valid_till', 'vehicle_image',
            'license_image', 'id_proof_image', 'profile_photo', 'bank_proof_image',
            'bank_account_number', 'ifsc_code', 'account_holder_name', 'bank_name',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'
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
                    is_active=False,
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
