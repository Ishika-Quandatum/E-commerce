from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from .models import PromotionBanner
from .serializers import PromotionBannerSerializer, VendorPromotionBannerSerializer
from apps.vendors.models import get_active_subscription

class PromotionBannerViewSet(viewsets.ModelViewSet):
    queryset = PromotionBanner.objects.filter(is_active=True)
    serializer_class = PromotionBannerSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Public view: Only currently active banners
        if self.action == 'list' and not self.request.query_params.get('vendor_view'):
            now = timezone.now()
            return queryset.filter(start_date__lte=now, end_date__gte=now)
            
        # Vendor view: Only their own banners
        if self.request.query_params.get('vendor_view') == 'true':
            if hasattr(self.request.user, 'vendor_profile'):
                return PromotionBanner.objects.filter(vendor=self.request.user.vendor_profile)
            return PromotionBanner.objects.none()
            
        return queryset

    def get_serializer_class(self):
        if self.request.user.is_authenticated and hasattr(self.request.user, 'vendor_profile'):
            if self.action in ['create', 'update', 'partial_update']:
                return VendorPromotionBannerSerializer
        return PromotionBannerSerializer

    def create(self, request, *args, **kwargs):
        vendor = getattr(request.user, 'vendor_profile', None)
        subscription = get_active_subscription(vendor) if vendor else None
        if not subscription:
            return Response(
                {
                    'code': 'SUBSCRIPTION_REQUIRED',
                    'message': 'An active subscription is required to create promotions.',
                    'error': 'An active subscription is required to create promotions.',
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        limit = subscription.plan.max_promotions
        if limit is not None and vendor.promotions.count() >= limit:
            return Response(
                {
                    'code': 'PROMOTION_LIMIT_REACHED',
                    'message': 'Your subscription promotion limit has been reached.',
                    'error': 'Your subscription promotion limit has been reached.',
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        vendor = getattr(request.user, 'vendor_profile', None)
        if not vendor or not get_active_subscription(vendor):
            return Response(
                {
                    'code': 'SUBSCRIPTION_REQUIRED',
                    'message': 'An active subscription is required to update promotions.',
                    'error': 'An active subscription is required to update promotions.',
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        if self.get_object().vendor_id != vendor.id:
            return Response({'error': 'You can only update your own promotions.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        vendor = getattr(request.user, 'vendor_profile', None)
        if not vendor or not get_active_subscription(vendor):
            return Response(
                {
                    'code': 'SUBSCRIPTION_REQUIRED',
                    'message': 'An active subscription is required to delete promotions.',
                    'error': 'An active subscription is required to delete promotions.',
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        if self.get_object().vendor_id != vendor.id:
            return Response({'error': 'You can only delete your own promotions.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
