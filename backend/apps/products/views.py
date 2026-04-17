from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
            if search.isdigit():
                queryset = queryset.filter(id=search)
            else:
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

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def bulk_upload(self, request):
        if request.user.role != 'vendor':
            return Response({'error': 'Only vendors can upload bulk products.'}, status=status.HTTP_403_FORBIDDEN)
            
        vendor = getattr(request.user, 'vendor_profile', None)
        if not vendor:
            return Response({'error': 'Vendor profile not found.'}, status=status.HTTP_400_BAD_REQUEST)
            
        excel_file = request.FILES.get('file')
        if not excel_file:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
            
        import pandas as pd
        from django.template.defaultfilters import slugify
        try:
            df = pd.read_excel(excel_file)
        except Exception as e:
            return Response({'error': f'Invalid excel file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
            
        from apps.categories.models import Category
        created_count = 0
        updated_count = 0
        
        def get_val(row, *keys, default=''):
            for k in keys:
                if k in row and not pd.isna(row[k]):
                    val = str(row[k]).strip()
                    if val.lower() != 'nan':
                        return val
            return default

        for index, row in df.iterrows():
            try:
                name = get_val(row, 'Product Title', 'Name', 'Title')
                if not name:
                    continue
                    
                cat_name = get_val(row, 'Category', 'category', default='Uncategorized')
                category, _ = Category.objects.get_or_create(
                    name=cat_name, 
                    defaults={'slug': slugify(cat_name)}
                )
                
                price_val = get_val(row, 'Retail Price', 'Price')
                price = float(price_val.replace(',', '')) if price_val else 0.0
                
                offer_price_val = get_val(row, 'Offer Price', 'Discount Price')
                offer_price = float(offer_price_val.replace(',', '')) if offer_price_val else None
                
                qty_val = get_val(row, 'Quantity', 'Qty')
                stock_val = get_val(row, 'Stock', 'Inventory', default=qty_val if qty_val else 0)
                
                stock = int(float(stock_val)) if stock_val else 0
                quantity = float(qty_val) if qty_val else 1.0
                
                unit = get_val(row, 'Unit', default='pcs').lower()
                desc = get_val(row, 'Description')
                
                product, _created = Product.objects.update_or_create(
                    vendor=vendor,
                    name=name,
                    defaults={
                        'category': category,
                        'description': desc,
                        'price': price,
                        'discount_price': offer_price,
                        'stock': stock,
                        'quantity': quantity,
                        'unit': unit,
                    }
                )
                
                # Try to process image URL if present
                img_url = get_val(row, 'Image', 'Image URL')
                if img_url:
                    pass # Handled asynchronously or manually for now as image downloads delay the server
                    
                if _created:
                    created_count += 1
                else:
                    updated_count += 1
            except Exception as e:
                print(f"Error skipping row {index}: {str(e)}")
                continue
                
        return Response({
            'message': 'File processed successfully.',
            'created': created_count,
            'updated': updated_count
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def bulk_export(self, request):
        if request.user.role != 'vendor':
            return Response({'error': 'Only vendors can export products.'}, status=status.HTTP_403_FORBIDDEN)
            
        vendor = getattr(request.user, 'vendor_profile', None)
        products = Product.objects.filter(vendor=vendor)
        
        data = []
        for p in products:
            data.append({
                'Name': p.name,
                'Description': p.description,
                'Category': p.category.name if p.category else '',
                'Price': float(p.price) if p.price else 0.0,
                'Offer Price': float(p.discount_price) if p.discount_price else '',
                'Stock': p.stock,
                'Quantity': float(p.quantity) if p.quantity else 1.0,
                'Unit': p.unit
            })
            
        import pandas as pd
        df = pd.DataFrame(data)
        
        from io import BytesIO
        from django.http import HttpResponse
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Products')
        
        output.seek(0)
        response = HttpResponse(
            output.read(), 
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="Vendor_Products.xlsx"'
        return response
