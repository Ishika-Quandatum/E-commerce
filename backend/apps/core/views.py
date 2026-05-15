from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import PlatformSetting
from .serializers import PlatformSettingSerializer

class PlatformSettingViewSet(viewsets.ModelViewSet):
    queryset = PlatformSetting.objects.all()
    serializer_class = PlatformSettingSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'platform_stats']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def list(self, request, *args, **kwargs):
        settings = PlatformSetting.get_settings()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

    @action(detail=False, methods=['patch', 'post'])
    def update_settings(self, request):
        settings = PlatformSetting.get_settings()
        serializer = self.get_serializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def platform_stats(self, request):
        from apps.users.models import User
        from apps.products.models import Product
        from apps.vendors.models import Vendor
        
        customers = User.objects.filter(role='customer').count()
        products = Product.objects.filter(status='Active').count()
        vendors = Vendor.objects.filter(status='Approved').count()
        cities = Vendor.objects.filter(status='Approved').exclude(city__isnull=True).values('city').distinct().count()
        
        return Response({
            'customers': customers + 150,
            'products': products + 120,
            'sellers': vendors + 15,
            'cities': cities + 5
        })
