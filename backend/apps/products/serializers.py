from rest_framework import serializers
from apps.categories.serializers import CategorySerializer
from .models import Product, ProductImage, Brand, Review, ReviewImage

class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = ['id', 'image']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')
    user_avatar = serializers.SerializerMethodField()
    images = ReviewImageSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'user_avatar', 'order', 'product', 'rating', 'comment', 'images', 'is_approved', 'helpful_votes', 'created_at']
        read_only_fields = ['user', 'is_approved', 'helpful_votes', 'created_at']

    def get_user_avatar(self, obj):
        request = self.context.get('request')
        if obj.user and obj.user.avatar:
            if request:
                return request.build_absolute_uri(obj.user.avatar.url)
            return obj.user.avatar.url
        return None

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'created_at']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    category_slug = serializers.ReadOnlyField(source='category.slug')
    subcategory_name = serializers.ReadOnlyField(source='subcategory.name')
    brand_name = serializers.ReadOnlyField(source='brand.name')
    image = serializers.ImageField(write_only=True, required=False)

    rating = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)
    reviews = serializers.SerializerMethodField()
    review_metrics = serializers.SerializerMethodField()
    can_review = serializers.SerializerMethodField()
    eligibility_message = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'full_description', 'price', 'discount_price', 'discount_percentage',
            'discount_type', 'tax', 'sku', 'status',
            'stock', 'quantity', 'unit', 'category', 'category_name', 'category_slug',
            'subcategory', 'subcategory_name', 'brand', 'brand_name',
            'rating', 'is_featured', 'is_deal', 'created_at', 'images', 'image', 'shipping_charge',
            'reviews', 'review_metrics', 'can_review', 'eligibility_message'
        ]

    discount_percentage = serializers.SerializerMethodField()

    def get_discount_percentage(self, obj):
        if obj.discount_price and obj.price and obj.discount_price < obj.price:
            discount = ((obj.price - obj.discount_price) / obj.price) * 100
            return round(discount)
        return 0

    def get_reviews(self, obj):
        # Return only recent 5 approved reviews for the product detail page by default
        reviews = obj.reviews.filter(is_approved=True).order_by('-created_at')[:5]
        return ReviewSerializer(reviews, many=True, context=self.context).data

    def get_review_metrics(self, obj):
        approved_reviews = obj.reviews.filter(is_approved=True)
        total = approved_reviews.count()
        if total == 0:
            return {'total': 0, 'breakdown': {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}}
        
        breakdown = {}
        for i in range(5, 0, -1):
            count = approved_reviews.filter(rating=i).count()
            breakdown[i] = round((count / total) * 100)
            
        return {'total': total, 'breakdown': breakdown}

    def get_can_review(self, obj):
        request = self.context.get('request')
        if not request or not request.user or request.user.is_anonymous:
            return False
        
        # Check if already reviewed
        if obj.reviews.filter(user=request.user).exists():
            return False

        from apps.orders.models import OrderItem
        return OrderItem.objects.filter(
            order__user=request.user, 
            order__status='Delivered', 
            product=obj
        ).exists()

    def get_eligibility_message(self, obj):
        request = self.context.get('request')
        if not request or not request.user or request.user.is_anonymous:
            return "Please login to review this product."
        
        if obj.reviews.filter(user=request.user).exists():
            return "You have already reviewed this product."

        from apps.orders.models import OrderItem
        delivered_item = OrderItem.objects.filter(
            order__user=request.user, 
            order__status='Delivered', 
            product=obj
        ).order_by('-order__created_at').first()
        
        if delivered_item:
            return f"You can review this product because your order has been delivered on {delivered_item.order.updated_at.strftime('%B %d, %Y')}."
        
        return "You can only review products you have purchased and received."

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        product = super().create(validated_data)
        
        request = self.context.get('request')
        if request and hasattr(request, 'FILES') and request.FILES.getlist('images'):
            for img in request.FILES.getlist('images'):
                ProductImage.objects.create(product=product, image=img)
        elif image:
            ProductImage.objects.create(product=product, image=image)
        return product

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        product = super().update(instance, validated_data)
        
        request = self.context.get('request')
        if request and hasattr(request, 'FILES') and request.FILES.getlist('images'):
            instance.images.all().delete()
            for img in request.FILES.getlist('images'):
                ProductImage.objects.create(product=product, image=img)
        elif image:
            instance.images.all().delete()
            ProductImage.objects.create(product=product, image=image)
        return product


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing products."""
    category_name = serializers.ReadOnlyField(source='category.name')
    brand_name = serializers.ReadOnlyField(source='brand.name')
    vendor_name = serializers.ReadOnlyField(source='vendor.shop_name')
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'discount_price', 'stock', 'quantity', 'unit',
            'category', 'category_name', 'brand', 'brand_name', 'status', 'rating', 'is_featured',
            'is_deal', 'primary_image', 'discount_percentage', 'shipping_charge', 'vendor', 'vendor_name', 'sku', 'created_at'
        ]

    def get_primary_image(self, obj):
        first = obj.images.first()
        if first and first.image:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(first.image.url)
                return first.image.url
            except Exception:
                return first.image.url
        return None

    discount_percentage = serializers.SerializerMethodField()

    def get_discount_percentage(self, obj):
        if obj.discount_price and obj.price and obj.discount_price < obj.price:
            discount = ((obj.price - obj.discount_price) / obj.price) * 100
            return round(discount)
        return 0
