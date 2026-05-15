from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Vendor
from .serializers import VendorSerializer, VendorSignupSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.serializers import UserSerializer

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

    def get_permissions(self):
        if self.action in ['signup', 'retrieve', 'list', 'is_following']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def follow(self, request, pk=None):
        vendor = self.get_object()
        from .models import Follower
        follower, created = Follower.objects.get_or_create(vendor=vendor, user=request.user)
        if not created:
            follower.delete()
            return Response({'following': False, 'followers_count': vendor.followers.count()})
        return Response({'following': True, 'followers_count': vendor.followers.count()})

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def is_following(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'is_following': False})
        vendor = self.get_object()
        from .models import Follower
        is_following = Follower.objects.filter(vendor=vendor, user=request.user).exists()
        return Response({'is_following': is_following})

    @action(detail=False, methods=['post'])
    def signup(self, request):
        user = request.user
        # Check if user is superadmin (admins shouldn't be vendors usually)
        if user.is_authenticated and (user.role == 'superadmin' or user.is_staff):
            return Response({'error': 'Admins cannot apply to be vendors.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if already a vendor
        if user.is_authenticated and hasattr(user, 'vendor_profile'):
            return Response({'error': 'You are already a vendor or have a pending application.'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = VendorSignupSerializer(data=request.data)
        if not serializer.is_valid():
            print("--- VENDOR SIGNUP VALIDATION ERRORS ---")
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        vendor = serializer.save(user=user if user.is_authenticated else None, status='Pending')
        
        # Generate tokens for the user (whether newly created or existing)
        new_user = vendor.user
        refresh = RefreshToken.for_user(new_user)
        
        return Response({
            'message': 'Vendor application submitted successfully!',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(new_user).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def profile(self, request):
        try:
            vendor = request.user.vendor_profile
        except Vendor.DoesNotExist:
            if request.user.role in ['superadmin', 'admin'] or request.user.is_staff:
                # Return mock data for admins to prevent 404 during testing
                return Response({
                    'id': 0,
                    'shop_name': 'Admin Test Store',
                    'shop_description': 'This is a mock vendor profile for testing as an administrator.',
                    'shop_address': 'Admin Headquarters',
                    'city': 'Admin City',
                    'state': 'Admin State',
                    'pincode': '000000',
                    'email': request.user.email,
                    'pickup_contact': getattr(request.user, 'phone', '0000000000') or '0000000000',
                    'followers_count': 0,
                    'products_count': 0,
                    'rating': 5.0,
                    'total_orders_count': 0,
                    'shop_type': 'Test',
                    'created_at': '2026-05-15T00:00:00Z',
                    'pickup_availability': True,
                    'delivery_radius': 10,
                    'estimated_dispatch_time': 'Immediate'
                })
            return Response({'error': 'Vendor profile not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = self.get_serializer(vendor)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            data = request.data
            user = request.user
            user_updated = False
            
            # Handle User updates
            if 'email' in data and data['email'] != user.email:
                from apps.users.models import User
                if User.objects.filter(email=data['email']).exclude(id=user.id).exists():
                    return Response({'email': ['A user with this email already exists.']}, status=status.HTTP_400_BAD_REQUEST)
                user.email = data['email']
                user.username = data['email']
                user_updated = True
            
            if 'phone' in data:
                user.phone = data['phone']
                user_updated = True
                
            if 'password' in data and data['password']:
                user.set_password(data['password'])
                user_updated = True
                
            if user_updated:
                user.save()

            serializer = self.get_serializer(vendor, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def vendor_settings(self, request):
        try:
            vendor = request.user.vendor_profile
        except Vendor.DoesNotExist:
            return Response({'error': 'Vendor profile not found'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        data = request.data

        # Update User fields if provided
        user_updated = False
        if 'email' in data and data['email'] != user.email:
            from apps.users.models import User
            if User.objects.filter(email=data['email']).exclude(id=user.id).exists():
                return Response({'email': ['A user with this email already exists.']}, status=status.HTTP_400_BAD_REQUEST)
            user.email = data['email']
            user.username = data['email'] # Assuming email is username
            user_updated = True
        
        if 'phone' in data:
            user.phone = data['phone']
            user_updated = True
            
        if 'password' in data and data['password']:
            user.set_password(data['password'])
            user_updated = True
            
        if user_updated:
            user.save()

        # Update Vendor fields (partial update)
        serializer = self.get_serializer(vendor, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Settings updated successfully',
                'vendor': serializer.data,
                'user': UserSerializer(user).data if user_updated else None
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        isAdmin = request.user.role in ['superadmin', 'admin'] or request.user.is_staff
        if not isAdmin:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        vendor = self.get_object()
        vendor.status = 'Approved'
        vendor.save()
        
        # Update user role to vendor
        user = vendor.user
        user.role = 'vendor'
        user.save()
        
        return Response({'message': f'Vendor {vendor.shop_name} approved and role updated.'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        isAdmin = request.user.role in ['superadmin', 'admin'] or request.user.is_staff
        if not isAdmin:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        vendor = self.get_object()
        vendor.status = 'Rejected'
        vendor.save()
        return Response({'message': f'Vendor {vendor.shop_name} rejected.'})

    def get_queryset(self):
        user = self.request.user
        
        # If it's a list or retrieve action for public info, allow seeing approved vendors
        if self.action in ['list', 'retrieve', 'is_following', 'follow']:
            queryset = Vendor.objects.filter(status='Approved')
            
            # If user is admin, let them see all for management
            if user.is_authenticated and (user.role in ['superadmin', 'admin'] or user.is_staff):
                queryset = Vendor.objects.all()
            
            return queryset

        # Otherwise, restrict to user's own vendor profile
        queryset = Vendor.objects.none()
        if user.is_authenticated:
            if user.role == 'superadmin' or user.is_staff:
                queryset = Vendor.objects.all()
            elif hasattr(user, 'vendor_profile'):
                queryset = Vendor.objects.filter(user=user)
        
        return queryset
