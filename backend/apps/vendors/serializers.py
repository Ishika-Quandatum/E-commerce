from rest_framework import serializers
from .models import Vendor
from apps.users.models import User


class VendorSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Vendor
        fields = ['id', 'user', 'username', 'email', 'shop_name', 'shop_type', 'status', 'created_at']
        read_only_fields = ['user', 'status', 'created_at']


class VendorSignupSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Vendor
        fields = ['name', 'email', 'password', 'shop_name', 'shop_type']

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
