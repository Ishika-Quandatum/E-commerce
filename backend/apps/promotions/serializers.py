from rest_framework import serializers
from .models import PromotionBanner
from apps.products.serializers import ProductSerializer

class PromotionBannerSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    vendor_name = serializers.ReadOnlyField(source='vendor.shop_name')
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PromotionBanner
        fields = [
            'id', 'title', 'short_description', 'offer_price', 'discount_percent', 
            'image_url', 'background_color', 'gradient_color_1', 'gradient_color_2',
            'gradient_direction', 'computed_background', 'title_color', 'description_color',
            'button_text', 'button_text_color', 'button_bg_color', 'image_position',
            'border_radius', 'overlay_opacity', 'badge_text', 'priority', 
            'product', 'product_details', 'vendor_name', 'start_date', 'end_date'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        url = None
        if obj.banner_image:
            url = obj.banner_image.url
        elif obj.product and obj.product.images.exists():
            url = obj.product.images.first().image.url
        
        if url and request:
            return request.build_absolute_uri(url)
        return url

class VendorPromotionBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionBanner
        fields = [
            'id', 'product', 'title', 'short_description', 'offer_price', 
            'discount_percent', 'banner_image', 'background_color', 
            'gradient_color_1', 'gradient_color_2', 'gradient_direction',
            'title_color', 'description_color', 'button_text', 
            'button_text_color', 'button_bg_color', 'image_position',
            'border_radius', 'overlay_opacity', 'badge_text',
            'start_date', 'end_date', 'priority'
        ]

    def validate_product(self, value):
        user = self.context['request'].user
        if not hasattr(user, 'vendor_profile'):
            raise serializers.ValidationError("Only vendors can submit promotions.")
        if value.vendor != user.vendor_profile:
            raise serializers.ValidationError("You can only promote your own products.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['vendor'] = user.vendor_profile
        return super().create(validated_data)
