from django.contrib import admin
from .models import PromotionBanner

@admin.register(PromotionBanner)
class PromotionBannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'vendor', 'priority', 'is_active', 'start_date', 'end_date')
    list_filter = ('is_active', 'vendor', 'start_date')
    search_fields = ('title', 'short_description', 'vendor__shop_name')
    
    fieldsets = (
        ('Basic Details', {
            'fields': ('vendor', 'product', 'title', 'short_description', 'offer_price', 'discount_percent')
        }),
        ('Design Settings', {
            'fields': ('background_color', 'gradient_color_1', 'gradient_color_2', 'gradient_direction', 'title_color', 'description_color'),
            'description': 'Configure the visual appearance of the banner.'
        }),
        ('CTA Button', {
            'fields': ('button_text', 'button_text_color', 'button_bg_color'),
            'description': 'Configure the "Call To Action" button.'
        }),
        ('Layout Settings', {
            'fields': ('image_position', 'banner_image', 'border_radius', 'overlay_opacity', 'badge_text'),
            'description': 'Configure how the image and overlay are displayed.'
        }),
        ('Schedule & Status', {
            'fields': ('start_date', 'end_date', 'priority', 'is_active')
        }),
    )

    readonly_fields = ('created_at', 'updated_at')
