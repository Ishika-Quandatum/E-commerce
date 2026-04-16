from django.db import models
from apps.categories.models import Category


class Product(models.Model):
    UNIT_CHOICES = (
        ('g', 'Gram (g)'),
        ('kg', 'Kilogram (kg)'),
        ('ml', 'Milliliter (ml)'),
        ('l', 'Liter (l)'),
        ('pcs', 'Pieces (pcs)'),
    )

    name = models.CharField(max_length=255)
    description = models.TextField()

    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    stock = models.IntegerField(default=0)

    quantity = models.FloatField(default=1)  
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='pcs')

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.CASCADE, related_name='products', null=True, blank=True)

    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    is_featured = models.BooleanField(default=False)
    is_deal = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')

    def __str__(self):
        return f"Image for {self.product.name}"