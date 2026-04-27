from django.db import models
from apps.vendors.models import Vendor
from apps.products.models import Product

class PromotionBanner(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='promotions')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='promotions')
    
    title = models.CharField(max_length=255, help_text="Catchy title for the banner")
    short_description = models.TextField(help_text="Brief marketing text")
    
    offer_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percent = models.IntegerField(default=0)
    
    banner_image = models.ImageField(upload_to='promotions/banners/', null=True, blank=True, help_text="Optional custom banner image. If empty, product image will be used.")
    background_color = models.CharField(max_length=7, default='#6D28D9', help_text="Hex color for banner background")
    
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
    def is_currently_active(self):
        from django.utils import timezone
        now = timezone.now()
        return self.is_active and self.start_date <= now <= self.end_date
