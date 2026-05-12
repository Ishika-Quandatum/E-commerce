from rest_framework import serializers
from .models import Vendor
from apps.users.models import User


class VendorSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    vendor_name = serializers.ReadOnlyField(source='user.first_name')
    avatar = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    total_ratings = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = [
            'id', 'user', 'username', 'email', 'vendor_name', 'shop_name', 'shop_type', 
            'shop_address', 'city', 'state', 'pincode', 'pickup_contact',
            'location_lat', 'location_lng',
            'status', 'created_at', 'avatar', 'rating', 'total_ratings', 
            'followers_count', 'products_count'
        ]
        read_only_fields = ['user', 'status', 'created_at']

    def get_avatar(self, obj):
        if obj.user and obj.user.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.avatar.url)
            return obj.user.avatar.url
        return None

    def get_rating(self, obj):
        from django.db.models import Avg
        from apps.products.models import Review
        avg = Review.objects.filter(product__vendor=obj, is_approved=True).aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg is not None else 0.0

    def get_total_ratings(self, obj):
        from apps.products.models import Review
        return Review.objects.filter(product__vendor=obj, is_approved=True).count()

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_products_count(self, obj):
        return obj.products.filter(status='Active').count()


class VendorSignupSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6, required=False, allow_blank=True)

    class Meta:
        model = Vendor
        fields = [
            'name', 'email', 'password', 'shop_name', 'shop_type',
            'shop_address', 'city', 'state', 'pincode', 'pickup_contact',
            'location_lat', 'location_lng'
        ]
        extra_kwargs = {
            'shop_address': {'required': False},
            'city': {'required': False},
            'state': {'required': False},
            'pincode': {'required': False},
            'pickup_contact': {'required': False},
            'location_lat': {'required': False, 'allow_null': True},
            'location_lng': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        name = validated_data.pop('name', None)
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)
        
        # Check if a user was passed from the view (authenticated user)
        user = validated_data.pop('user', None)
        if user and user.is_authenticated:
            # User is already logged in, we use them
            pass
        else:
            if not email or not password or not name:
                raise serializers.ValidationError({"error": "Name, email, and password are required for new users."})
            
            # Check if user with this email already exists
            if User.objects.filter(email=email).exists():
                raise serializers.ValidationError({"email": "A user with this email already exists. Please log in first."})
            
            # Create new user
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=name
            )
        
        # Pop status to avoid duplicate kwarg
        validated_data.pop('status', None)
        
        # Create vendor application
        vendor = Vendor.objects.create(user=user, status='Pending', **validated_data)
        return vendor
