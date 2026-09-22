from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify
from datetime import timedelta
import uuid
import hashlib
import hmac
from django.conf import settings
from .models import Vendor, SubscriptionPlan, VendorSubscription, get_active_subscription
from .serializers import VendorSerializer, VendorSignupSerializer, SubscriptionPlanSerializer, VendorSubscriptionSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.serializers import UserSerializer


class IsMarketplaceAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated
            and (user.is_staff or user.is_superuser or getattr(user, 'role', None) in ['admin', 'superadmin'])
        )


class IsVendorOrMarketplaceAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated
            and (
                getattr(user, 'vendor_profile', None) is not None
                or user.is_staff
                or user.is_superuser
                or getattr(user, 'role', None) in ['admin', 'superadmin']
            )
        )


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

    def get_permissions(self):
        if self.action in ['signup', 'retrieve', 'list', 'is_following', 'store']:
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

    @action(detail=False, methods=['get'], url_path=r'store/(?P<store_slug>[-\w]+)')
    def store(self, request, store_slug=None):
        vendor = self.get_queryset().filter(
            store_slug=store_slug,
            status='Approved',
        ).first()
        if not vendor:
            return Response(
                {'detail': 'Store not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(self.get_serializer(vendor).data)

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
        
        with transaction.atomic():
            vendor = Vendor.objects.select_for_update().get(pk=self.get_object().pk)
            vendor.status = 'Approved'
            if not vendor.store_slug:
                base_slug = slugify(vendor.shop_name) or f'vendor-{vendor.pk}'
                candidate = base_slug
                counter = 2
                while Vendor.objects.filter(store_slug=candidate).exclude(pk=vendor.pk).exists():
                    candidate = f'{base_slug}-{counter}'
                    counter += 1
                vendor.store_slug = candidate
            vendor.save(update_fields=['status', 'store_slug', 'updated_at'])
        
        # Update user role to vendor
        user = vendor.user
        user.role = 'vendor'
        user.save()
        
        return Response({
            'message': f'Vendor {vendor.shop_name} approved and role updated.',
            'store_slug': vendor.store_slug,
        })

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

        if self.action in ['approve', 'reject'] and (
            user.role in ['admin', 'superadmin'] or user.is_staff
        ):
            return Vendor.objects.all()
        
        # If it's a list or retrieve action for public info, allow seeing approved vendors
        if self.action in ['list', 'retrieve', 'is_following', 'follow', 'store']:
            queryset = Vendor.objects.filter(status='Approved')
            
            # If user is admin, let them see all for management
            if user.is_authenticated and (user.role in ['superadmin', 'admin'] or user.is_staff):
                queryset = Vendor.objects.all()

            # Apply status filter if provided
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            return queryset

        # Otherwise, restrict to user's own vendor profile
        queryset = Vendor.objects.none()
        if user.is_authenticated:
            if user.role == 'superadmin' or user.is_staff:
                queryset = Vendor.objects.all()
            elif hasattr(user, 'vendor_profile'):
                queryset = Vendor.objects.filter(user=user)
        return queryset


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsMarketplaceAdmin()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'superadmin'] or user.is_staff:
            return SubscriptionPlan.objects.all()
        return SubscriptionPlan.objects.filter(is_active=True)

    @action(detail=True, methods=['post'], permission_classes=[IsMarketplaceAdmin])
    def toggle_active(self, request, pk=None):
        plan = self.get_object()
        plan.is_active = not plan.is_active
        plan.save(update_fields=['is_active', 'updated_at'])
        return Response(self.get_serializer(plan).data)


class VendorSubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VendorSubscriptionSerializer

    def get_permissions(self):
        return [IsVendorOrMarketplaceAdmin()]

    def get_queryset(self):
        user = self.request.user
        queryset = VendorSubscription.objects.select_related('vendor', 'plan')
        if user.role in ['admin', 'superadmin'] or user.is_staff:
            return queryset
        vendor = getattr(user, 'vendor_profile', None)
        return queryset.filter(vendor=vendor) if vendor else queryset.none()

    @action(detail=False, methods=['get'])
    def current(self, request):
        vendor = getattr(request.user, 'vendor_profile', None)
        if not vendor:
            return Response({'error': 'Vendor profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        subscription = self.get_queryset().filter(vendor=vendor, status='ACTIVE').first()
        if subscription and not subscription.is_active:
            subscription.status = 'EXPIRED'
            subscription.save(update_fields=['status', 'updated_at'])
            subscription = None
        return Response(self.get_serializer(subscription).data if subscription else None)

    @action(detail=False, methods=['post'])
    def initiate(self, request):
        vendor = getattr(request.user, 'vendor_profile', None)
        if not vendor:
            return Response({'error': 'Vendor profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        plan = SubscriptionPlan.objects.filter(pk=request.data.get('plan_id'), is_active=True).first()
        if not plan:
            return Response({'error': 'Active subscription plan not found.'}, status=status.HTTP_400_BAD_REQUEST)
        if get_active_subscription(vendor):
            return Response(
                {'error': 'An active subscription already exists. Use upgrade after the current payment is verified.'},
                status=status.HTTP_409_CONFLICT,
            )
        payment_id = f'SUB-{uuid.uuid4().hex.upper()}'
        payment_payload = f'{payment_id}:{plan.pk}:{plan.price}:{vendor.pk}'
        subscription = VendorSubscription.objects.create(vendor=vendor, plan=plan, payment_id=payment_id)
        return Response({
            'subscription': self.get_serializer(subscription).data,
            'payment_id': payment_id,
            'payment_payload': payment_payload,
            'message': 'Payment initiated. Complete payment and submit the gateway verification reference.'
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def verify_payment(self, request):
        vendor = getattr(request.user, 'vendor_profile', None)
        payment_id = request.data.get('payment_id')
        gateway_signature = request.data.get('gateway_signature')
        plan_id = request.data.get('plan_id')
        amount = request.data.get('amount')
        vendor_id = request.data.get('vendor_id')
        if not vendor or not payment_id:
            return Response({'error': 'Vendor and payment reference are required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not settings.SUBSCRIPTION_PAYMENT_WEBHOOK_SECRET:
            return Response(
                {'error': 'Payment gateway verification is not configured.', 'code': 'PAYMENT_GATEWAY_UNAVAILABLE'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        subscription = VendorSubscription.objects.filter(
            vendor=vendor, payment_id=payment_id, status='PENDING'
        ).select_related('plan').first()
        if not subscription:
            return Response({'error': 'Pending subscription payment not found.'}, status=status.HTTP_404_NOT_FOUND)
        if str(plan_id) != str(subscription.plan_id) or str(vendor_id) != str(vendor.pk) or str(amount) != str(subscription.plan.price):
            return Response(
                {'error': 'Payment details do not match the pending subscription.', 'code': 'PAYMENT_DETAILS_MISMATCH'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        payment_payload = f'{payment_id}:{subscription.plan_id}:{subscription.plan.price}:{vendor.pk}'
        expected_signature = hmac.new(
            settings.SUBSCRIPTION_PAYMENT_WEBHOOK_SECRET.encode(),
            payment_payload.encode(),
            hashlib.sha256,
        ).hexdigest()
        if not gateway_signature or not hmac.compare_digest(gateway_signature, expected_signature):
            return Response(
                {'error': 'Payment gateway signature could not be verified.', 'code': 'PAYMENT_VERIFICATION_FAILED'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        now = timezone.now()
        with transaction.atomic():
            VendorSubscription.objects.filter(
                vendor=vendor, status='ACTIVE'
            ).update(status='CANCELLED', updated_at=now)
            subscription.start_date = now
            subscription.end_date = now + timedelta(days=subscription.plan.duration_days)
            subscription.status = 'ACTIVE'
            subscription.save(update_fields=['start_date', 'end_date', 'status', 'updated_at'])
        return Response(self.get_serializer(subscription).data)
