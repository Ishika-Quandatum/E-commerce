from rest_framework import viewsets, permissions
from .models import Product, ProductImage
from .serializers import ProductSerializer, ProductListSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').prefetch_related('images').all()

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()] # We will check role in queryset or use a custom permission

    def get_queryset(self):
        user = self.request.user
        queryset = Product.objects.select_related('category', 'vendor').prefetch_related('images').all()

        # Data Isolation
        if not user.is_anonymous:
            if user.role == 'vendor':
                vendor = getattr(user, 'vendor_profile', None)
                if vendor:
                    queryset = queryset.filter(vendor=vendor)
                else:
                    queryset = queryset.none()
            # Super Admin can see all, customers can see all (public list)

        category_param = self.request.query_params.get('category')
        if category_param:
            if category_param.isdigit():
                queryset = queryset.filter(category__id=category_param)
            else:
                queryset = queryset.filter(category__slug=category_param)
                
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
            
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
            
        deal = self.request.query_params.get('deal')
        if deal == 'true':
            queryset = queryset.filter(is_deal=True)
            
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'vendor':
            vendor = getattr(user, 'vendor_profile', None)
            serializer.save(vendor=vendor)
        else:
            serializer.save()
