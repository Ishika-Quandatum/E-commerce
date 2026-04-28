from rest_framework import serializers
from apps.categories.serializers import CategorySerializer
from .models import Product, ProductImage, Brand

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

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'full_description', 'price', 'discount_price', 'discount_percentage',
            'discount_type', 'tax', 'sku', 'status',
            'stock', 'quantity', 'unit', 'category', 'category_name', 'category_slug',
            'subcategory', 'subcategory_name', 'brand', 'brand_name',
            'rating', 'is_featured', 'is_deal', 'created_at', 'images', 'image', 'shipping_charge'
        ]

    discount_percentage = serializers.SerializerMethodField()

    def get_discount_percentage(self, obj):
        if obj.discount_price and obj.price and obj.discount_price < obj.price:
            discount = ((obj.price - obj.discount_price) / obj.price) * 100
            return round(discount)
        return 0

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
