from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from .models import PromotionBanner
from .serializers import PromotionBannerSerializer, VendorPromotionBannerSerializer

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
