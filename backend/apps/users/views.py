from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import UserAddress
from .serializers import UserSerializer, RegisterSerializer, ChangePasswordSerializer, CustomTokenObtainPairSerializer, UserAddressSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': 'Wrong password.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password updated successfully.'})


from django.db.models import Sum
from apps.orders.models import Order
from apps.products.models import Product

class UserViewSet(viewsets.ModelViewSet):
    """Admin-only user management."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class UserAddressViewSet(viewsets.ModelViewSet):
    serializer_class = UserAddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DashboardStatsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        orders = Order.objects.all()
        products = Product.objects.all()
        
        if user.role == 'vendor':
            vendor = getattr(user, 'vendor_profile', None)
            if vendor:
                orders = orders.filter(vendor=vendor)
                products = products.filter(vendor=vendor)
            else:
                orders = orders.none()
                products = products.none()
        elif user.role not in ['admin', 'superadmin'] and not user.is_staff:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        total_revenue = orders.filter(status='Delivered').aggregate(Sum('total_price'))['total_price__sum'] or 0
        total_products = products.count()
        total_orders = orders.count()
        total_vendors = User.objects.filter(role='vendor').count() if user.role in ['admin', 'superadmin'] else 0

        return Response({
            'total_revenue': float(total_revenue),
            'total_products': total_products,
            'total_orders': total_orders,
            'total_vendors': total_vendors,
        })
