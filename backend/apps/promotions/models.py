from django.db import models
from apps.vendors.models import Vendor
from apps.products.models import Product

class PromotionBanner(models.Model):
    DIRECTION_CHOICES = [
        ('to right', 'Horizontal (To Right)'),
        ('to left', 'Horizontal (To Left)'),
        ('to bottom', 'Vertical (To Bottom)'),
        ('to top', 'Vertical (To Top)'),
        ('135deg', 'Diagonal (135deg)'),
        ('45deg', 'Diagonal (45deg)'),
    ]

    IMAGE_POSITION_CHOICES = [
        ('left', 'Left'),
        ('right', 'Right'),
        ('center', 'Center/Full Background'),
    ]

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='promotions')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='promotions')
    
    title = models.CharField(max_length=255, help_text="Catchy title for the banner")
    short_description = models.TextField(help_text="Brief marketing text")
    
    offer_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percent = models.IntegerField(default=0)
    
    banner_image = models.ImageField(upload_to='promotions/banners/', null=True, blank=True, help_text="Optional custom banner image.")
    
    # Design Settings
    background_color = models.CharField(max_length=255, default='#6D28D9', help_text="Base background color")
    gradient_color_1 = models.CharField(max_length=7, null=True, blank=True, help_text="Starting color for gradient")
    gradient_color_2 = models.CharField(max_length=7, null=True, blank=True, help_text="Ending color for gradient")
    gradient_direction = models.CharField(max_length=20, choices=DIRECTION_CHOICES, default='135deg')
    
    title_color = models.CharField(max_length=7, default='#FFFFFF')
    description_color = models.CharField(max_length=7, default='#F3F4F6')
    
    # CTA Button
    button_text = models.CharField(max_length=50, default='Shop Now')
    button_text_color = models.CharField(max_length=7, default='#0F172A')
    button_bg_color = models.CharField(max_length=7, default='#FFFFFF')
    
    # Layout & UI
    image_position = models.CharField(max_length=10, choices=IMAGE_POSITION_CHOICES, default='right')
    border_radius = models.IntegerField(default=16, help_text="Border radius in pixels")
    overlay_opacity = models.FloatField(default=0.2, help_text="Opacity of overlay if image exists (0.0 to 1.0)")
    badge_text = models.CharField(max_length=50, null=True, blank=True, help_text="e.g. 'Limited Offer' or 'Bestseller'")
    
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    priority = models.IntegerField(default=0, help_text="Higher priority banners show first")
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.vendor.shop_name}"

    @property
    def computed_background(self):
        if self.gradient_color_1 and self.gradient_color_2:
            return f"linear-gradient({self.gradient_direction}, {self.gradient_color_1}, {self.gradient_color_2})"
        return self.background_color

    @property
    def is_currently_active(self):
        from django.utils import timezone
        now = timezone.now()
        return self.is_active and self.start_date <= now <= self.end_date
