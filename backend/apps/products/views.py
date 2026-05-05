from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Product, ProductImage, Brand, Review
from .serializers import ProductSerializer, ProductListSerializer, BrandSerializer, ReviewSerializer
from .pagination import StandardResultsSetPagination

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny] # Can restrict if needed


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').prefetch_related('images').all()
    pagination_class = StandardResultsSetPagination

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
        if category_param and category_param != 'All Categories':
            categories = [c.strip() for c in category_param.split(',') if c.strip()]
            if categories:
                if categories[0].isdigit():
                    queryset = queryset.filter(category__id__in=categories)
                else:
                    queryset = queryset.filter(category__slug__in=categories)
                
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(sku__icontains=search) | 
                Q(vendor__shop_name__icontains=search)
            )
            
        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'All Status':
            queryset = queryset.filter(status=status_param)

        stock_status = self.request.query_params.get('stock_status')
        if stock_status == 'Out of Stock':
            queryset = queryset.filter(stock=0)
        elif stock_status == 'Low Stock':
            queryset = queryset.filter(stock__gt=0, stock__lte=10)
        elif stock_status == 'In Stock':
            queryset = queryset.filter(stock__gt=10)

        vendor_param = self.request.query_params.get('vendor')
        if vendor_param and vendor_param != 'All Vendors':
            if vendor_param.isdigit():
                queryset = queryset.filter(vendor_id=vendor_param)

        min_price = self.request.query_params.get('min_price')
        if min_price and min_price.isdigit():
            queryset = queryset.filter(price__gte=min_price)
            
        max_price = self.request.query_params.get('max_price')
        if max_price and max_price.isdigit():
            queryset = queryset.filter(price__lte=max_price)
            
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            try:
                queryset = queryset.filter(rating__gte=float(min_rating))
            except ValueError:
                pass

        max_rating = self.request.query_params.get('max_rating')
        if max_rating:
            try:
                queryset = queryset.filter(rating__lte=float(max_rating))
            except ValueError:
                pass
            
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
            
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
            
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
            
        deal = self.request.query_params.get('deal')
        if deal == 'true':
            queryset = queryset.filter(is_deal=True)
            
        sort_by = self.request.query_params.get('sort')
        if sort_by == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-price')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'popularity':
            queryset = queryset.order_by('-rating')
        else:
            queryset = queryset.order_by('-created_at')
            
        return queryset.distinct()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def admin_stats(self, request):
        if request.user.role not in ['admin', 'superadmin', 'vendor']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        base_qs = Product.objects.all()
        if request.user.role == 'vendor':
            vendor = getattr(request.user, 'vendor_profile', None)
            base_qs = base_qs.filter(vendor=vendor)
            
        return Response({
            'total_products': base_qs.count(),
            'active_products': base_qs.filter(status='Active').count(),
            'inactive_products': base_qs.filter(status='Inactive').count(),
            'out_of_stock': base_qs.filter(stock=0).count(),
            'low_stock': base_qs.filter(stock__gt=0, stock__lte=10).count()
        })

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
                
                price_val = get_val(row, 'Regular Price', 'Retail Price', 'Price', 'Regular Price (₹)', 'Price (₹)')
                price_str = price_val.replace(',', '').replace('₹', '').replace('Rs.', '').replace('Rs', '').strip() if price_val else ''
                price = float(price_str) if price_str else 0.0
                
                offer_price_val = get_val(row, 'Offer Price', 'Discount Price', 'Offer Price (₹)', 'Discount Price (₹)')
                offer_price_str = offer_price_val.replace(',', '').replace('₹', '').replace('Rs.', '').replace('Rs', '').strip() if offer_price_val else ''
                offer_price = float(offer_price_str) if offer_price_str else None
                
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
        user = request.user
        if user.role not in ['admin', 'superadmin', 'vendor']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        if user.role == 'vendor':
            vendor = getattr(user, 'vendor_profile', None)
            products = Product.objects.filter(vendor=vendor)
        else:
            products = Product.objects.all()
        
        data = []
        for p in products:
            data.append({
                'Name': p.name,
                'SKU': p.sku or '',
                'Description': p.description,
                'Category': p.category.name if p.category else '',
                'Vendor': p.vendor.shop_name if p.vendor else 'Official Store',
                'Regular Price': float(p.price) if p.price else 0.0,
                'Offer Price': float(p.discount_price) if p.discount_price else '',
                'Stock': p.stock,
                'Status': p.status,
                'Created At': p.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
            
        import pandas as pd
        df = pd.DataFrame(data)
        
        from io import BytesIO
        from django.http import HttpResponse
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Products')
        
        output.seek(0)
        filename = "All_Products.xlsx" if user.role != 'vendor' else "Vendor_Products.xlsx"
        response = HttpResponse(
            output.read(), 
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Review.objects.all()
        
        # Super admin sees all, including unapproved. Customers only see approved.
        user = self.request.user
        if not (user.is_authenticated and user.role in ['admin', 'superadmin']):
            queryset = queryset.filter(is_approved=True)

        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
            
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
            
        return queryset

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product')
        order_id = request.data.get('order')
        user = request.user
        
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        from apps.orders.models import Order, OrderItem
        
        if order_id:
            try:
                order = Order.objects.get(id=order_id, user=user)
            except Order.DoesNotExist:
                return Response({'error': 'Order not found or does not belong to you'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Auto-find a delivered order for this product
            order_items = OrderItem.objects.filter(order__user=user, order__status='Delivered', product_id=product_id).order_by('-order__created_at')
            if not order_items.exists():
                return Response({'error': 'You can only review products you have purchased and received.'}, status=status.HTTP_400_BAD_REQUEST)
            order = order_items.first().order
            
        if order.status != 'Delivered':
            return Response({'error': 'You can only review products from delivered orders'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not OrderItem.objects.filter(order=order, product_id=product_id).exists():
            return Response({'error': 'This product is not part of the specified order'}, status=status.HTTP_400_BAD_REQUEST)
            
        if Review.objects.filter(user=user, product_id=product_id).exists():
            return Response({'error': 'You have already reviewed this product.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Add order to request data
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        data['order'] = order.id
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(user=user)
        
        # Handle images
        if hasattr(request, 'FILES'):
            images = request.FILES.getlist('images')
            for image in images:
                ReviewImage.objects.create(review=review, image=image)
        
        # Re-serialize to include fresh images
        full_serializer = self.get_serializer(review)
        return Response(full_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.AllowAny])
    def helpful(self, request, pk=None):
        review = self.get_object()
        review.helpful_votes += 1
        review.save(update_fields=['helpful_votes'])
        return Response({'status': 'Helpful vote counted', 'helpful_votes': review.helpful_votes})

