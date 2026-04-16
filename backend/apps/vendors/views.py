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
        if self.action == 'signup':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

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
        serializer.is_valid(raise_exception=True)
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
        if user.role == 'superadmin' or user.is_staff:
            # Admins see all vendor applications EXCEPT those from fellow admins
            return Vendor.objects.exclude(user__role='superadmin').exclude(user__is_staff=True)
        if hasattr(user, 'vendor_profile'):
            return Vendor.objects.filter(user=user)
        return Vendor.objects.none()
