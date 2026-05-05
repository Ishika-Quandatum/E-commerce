from rest_framework import serializers
from .models import User, UserAddress
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate


class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = '__all__'
        read_only_fields = ['user']

class UserSerializer(serializers.ModelSerializer):
    vendor_status = serializers.SerializerMethodField()

    addresses = UserAddressSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_superuser', 'vendor_status', 'phone', 'address', 'avatar', 'addresses']
        read_only_fields = ['id', 'is_staff', 'is_superuser', 'vendor_status']

    def get_vendor_status(self, obj):
        if hasattr(obj, 'vendor_profile'):
            return obj.vendor_profile.status
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer to allow authentication by either username or email.
    """
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        # Logic: If it looks like an email, find the user
        if '@' in username:
            try:
                user_obj = User.objects.get(email=username)
                username = user_obj.username
            except (User.DoesNotExist, User.MultipleObjectsReturned):
                pass 

        user = authenticate(username=username, password=password)

        if user is not None:
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            # SimpleJWT logic expects 'self.user' to be set
            refresh = self.get_token(user)

            data = {}
            data['refresh'] = str(refresh)
            data['access'] = str(refresh.access_token)

            return data
        
        raise serializers.ValidationError('No active account found with the given credentials')
