from rest_framework import serializers
from apps.categories.serializers import CategorySerializer
from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    category_slug = serializers.ReadOnlyField(source='category.slug')
    image = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'discount_price',
            'stock', 'category', 'category_name', 'category_slug',
            'rating', 'is_featured', 'is_deal', 'created_at', 'images', 'image'
        ]

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        product = super().create(validated_data)
        if image:
            ProductImage.objects.create(product=product, image=image)
        return product

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        product = super().update(instance, validated_data)
        if image:
            instance.images.all().delete()
            ProductImage.objects.create(product=product, image=image)
        return product


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing products."""
    category_name = serializers.ReadOnlyField(source='category.name')
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'discount_price', 'stock',
            'category', 'category_name', 'rating', 'is_featured',
            'is_deal', 'primary_image',
        ]

    def get_primary_image(self, obj):
        first = obj.images.first()
        if first and first.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first.image.url)
        return None
