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
    queryset = Product.objects.select_related('category', 'vendor').prefetch_related('images').all().order_by('-created_at')
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
        queryset = Product.objects.select_related('category', 'vendor').prefetch_related('images').all().order_by('-created_at')

        # Data Isolation
        if not user.is_anonymous:
            # Staff and Super Admin can see all (for management)
            if user.role in ['superadmin', 'admin'] or user.is_staff:
                pass 
            elif user.role == 'vendor':
                vendor = getattr(user, 'vendor_profile', None)
                if vendor:
                    queryset = queryset.filter(vendor=vendor)
                else:
                    queryset = queryset.none()
            elif user.role in ['user', 'rider']:
                queryset = queryset.filter(status='Active')
        else:
            # Anonymous users only see active products
            queryset = queryset.filter(status='Active')

        category_param = self.request.query_params.get('category')
        if category_param and category_param != 'All Categories':
            categories = [c.strip() for c in category_param.split(',') if c.strip()]
            if categories:
                q_cat = Q()
                cat_ids = [c for c in categories if c.isdigit()]
                cat_slugs = [c for c in categories if not c.isdigit()]
                if cat_ids:
                    q_cat |= Q(category__id__in=cat_ids)
                if cat_slugs:
                    q_cat |= Q(category__slug__in=cat_slugs)
                queryset = queryset.filter(q_cat)
        
        subcategory_param = self.request.query_params.get('subcategory')
        if subcategory_param and subcategory_param != 'All Subcategories':
            subcategories = [s.strip() for s in subcategory_param.split(',') if s.strip()]
            if subcategories:
                q_sub = Q()
                sub_ids = [s for s in subcategories if s.isdigit()]
                sub_slugs = [s for s in subcategories if not s.isdigit()]
                if sub_ids:
                    q_sub |= Q(subcategory__id__in=sub_ids)
                if sub_slugs:
                    q_sub |= Q(subcategory__slug__in=sub_slugs)
                queryset = queryset.filter(q_sub)
                
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
            
        # Rating Filtering
        rating_param = self.request.query_params.get('rating')
        if rating_param:
            try:
                r_val = float(rating_param)
                # If an exact star is selected (e.g. 2), show products in that range (2.0 - 2.99)
                queryset = queryset.filter(rating__gte=r_val, rating__lt=r_val + 1)
            except ValueError:
                pass

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

        new_arrival = self.request.query_params.get('new_arrival')
        if new_arrival == 'true':
            queryset = queryset.filter(is_new_arrival=True)

        best_seller = self.request.query_params.get('best_seller')
        if best_seller == 'true':
            queryset = queryset.filter(is_best_seller=True)

        offer = self.request.query_params.get('offer')
        if offer == 'true':
            queryset = queryset.filter(is_offer_product=True)
            
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
        elif user.is_staff or user.role in ['admin', 'superadmin']:
            # If staff is creating, check if a vendor was passed in the request data
            vendor_id = self.request.data.get('vendor')
            if vendor_id:
                serializer.save(vendor_id=vendor_id)
            else:
                # Default to first vendor to avoid orphaned products
                from apps.vendors.models import Vendor
                first_vendor = Vendor.objects.first()
                serializer.save(vendor=first_vendor)
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

        def get_bool(row, *keys):
            val = get_val(row, *keys).lower()
            return val in ['yes', 'true', '1', 'y']

        def get_unit(val):
            val = str(val).lower()
            if 'gram' in val or ' g' in val: return 'g'
            if 'kg' in val or 'kilogram' in val: return 'kg'
            if 'ml' in val or 'milliliter' in val: return 'ml'
            if 'liter' in val or ' l' in val: return 'l'
            return 'pcs' # Default to pcs for everything else like "Pieces (pcs)"

        def get_discount_type(val):
            if 'flat' in str(val).lower(): return 'Flat'
            return 'Percentage (%)'

        for index, row in df.iterrows():
            try:
                name = get_val(row, 'Product Title', 'Name', 'Title')
                if not name:
                    continue
                
                sku = get_val(row, 'SKU', 'sku', 'Product SKU')
                brand_name = get_val(row, 'Brand', 'brand')
                cat_name = get_val(row, 'Category', 'category', default='Uncategorized')
                subcat_name = get_val(row, 'Subcategory', 'subcategory')
                
                # Category & Subcategory
                category, _ = Category.objects.get_or_create(
                    name=cat_name, 
                    defaults={'slug': slugify(cat_name)}
                )
                
                subcategory = None
                if subcat_name:
                    subcategory, _ = Category.objects.get_or_create(
                        name=subcat_name,
                        parent=category,
                        defaults={'slug': slugify(subcat_name)}
                    )

                # Brand
                brand = None
                if brand_name:
                    brand, _ = Brand.objects.get_or_create(
                        name=brand_name,
                        defaults={'slug': slugify(brand_name)}
                    )
                
                # Pricing - Support "Regular Pri" cut off from image
                price_val = get_val(row, 'Regular Price', 'Regular Pri', 'Retail Price', 'Price', 'Regular Price (₹)', 'Price (₹)')
                price_str = price_val.replace(',', '').replace('₹', '').replace('Rs.', '').replace('Rs', '').strip() if price_val else ''
                price = float(price_str) if price_str else 0.0
                
                offer_price_val = get_val(row, 'Offer Price', 'Discount Price', 'Offer Price (₹)', 'Discount Price (₹)')
                offer_price_str = offer_price_val.replace(',', '').replace('₹', '').replace('Rs.', '').replace('Rs', '').strip() if offer_price_val else ''
                offer_price = float(offer_price_str) if offer_price_str else None
                
                discount_type = get_discount_type(get_val(row, 'Discount Type'))
                tax_val = get_val(row, 'Tax (%)', 'Tax', default='0')
                tax = float(tax_val) if tax_val else 0.0
                
                shipping_val = get_val(row, 'Shipping Charge', 'Shipping', default='0')
                shipping_charge = float(shipping_val) if shipping_val else 0.0

                # Stock
                qty_val = get_val(row, 'Quantity', 'Qty', 'Quantity / Item')
                stock_val = get_val(row, 'Stock', 'Total Stock', 'Inventory', default=qty_val if qty_val else 0)
                
                stock = int(float(stock_val)) if stock_val else 0
                quantity = float(qty_val) if qty_val else 1.0
                unit = get_unit(get_val(row, 'Unit', default='pcs'))
                
                # Descriptions
                short_desc = get_val(row, 'Short Description', 'Description')
                full_desc = get_val(row, 'Full Description', default=short_desc)
                
                # Status & Flags
                status_val = get_val(row, 'Product Status', 'Status', default='Active').capitalize()
                if 'Inactive' in status_val: status_val = 'Inactive'
                else: status_val = 'Active'
                
                is_new = get_bool(row, 'New Arrival', 'is_new_arrival')
                is_best = get_bool(row, 'Best Seller', 'is_best_seller')
                is_offer = get_bool(row, 'Offer Product', 'is_offer_product')

                # Sizes
                sizes_val = get_val(row, 'Size', 'Sizes', 'Available Sizes', default='')
                if sizes_val:
                    if isinstance(sizes_val, str):
                        sizes = [s.strip() for s in sizes_val.split(',') if s.strip()]
                    elif isinstance(sizes_val, (list, tuple)):
                        sizes = list(sizes_val)
                    else:
                        sizes = [str(sizes_val)]
                else:
                    sizes = []

                # Update or Create
                lookup_kwargs = {'vendor': vendor}
                if sku:
                    lookup_kwargs['sku'] = sku
                else:
                    lookup_kwargs['name'] = name

                product, _created = Product.objects.update_or_create(
                    **lookup_kwargs,
                    defaults={
                        'name': name,
                        'category': category,
                        'subcategory': subcategory,
                        'brand': brand,
                        'description': short_desc,
                        'full_description': full_desc,
                        'price': price,
                        'discount_price': offer_price,
                        'discount_type': discount_type,
                        'tax': tax,
                        'shipping_charge': shipping_charge,
                        'stock': stock,
                        'quantity': quantity,
                        'unit': unit,
                        'status': status_val,
                        'is_new_arrival': is_new,
                        'is_best_seller': is_best,
                        'is_offer_product': is_offer,
                        'sku': sku,
                        'sizes': sizes
                    }
                )
                
                if _created:
                    created_count += 1
                else:
                    updated_count += 1
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error skipping row {index} in bulk upload: {str(e)}", exc_info=True)
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
                'Product Title': p.name,
                'Brand': p.brand.name if p.brand else '',
                'Category': p.category.name if p.category else '',
                'Subcategory': p.subcategory.name if p.subcategory else '',
                'Short Description': p.description,
                'Full Description': p.full_description or '',
                'Total Stock': p.stock,
                'Quantity / Item': p.quantity,
                'Unit': p.unit,
                'SKU': p.sku or '',
                'Product Status': p.status,
                'Regular Price': float(p.price) if p.price else 0.0,
                'Offer Price': float(p.discount_price) if p.discount_price else '',
                'Discount Type': p.discount_type,
                'Tax (%)': float(p.tax),
                'Shipping Charge': float(p.shipping_charge),
                'New Arrival': 'Yes' if p.is_new_arrival else 'No',
                'Best Seller': 'Yes' if p.is_best_seller else 'No',
                'Offer Product': 'Yes' if p.is_offer_product else 'No',
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

