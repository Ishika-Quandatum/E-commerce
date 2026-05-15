import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce_backend.settings")
django.setup()

from apps.users.models import User
from apps.vendors.models import Vendor
from apps.products.models import Product

users = User.objects.all()
print('USERS:')
for u in users:
    print(f'User: {u.username}, Role: {u.role}, ID: {u.id}')

vendors = Vendor.objects.all()
print('\nVENDORS:')
for v in vendors:
    print(f'Vendor: {v.shop_name}, User: {v.user.username if v.user else "NONE"}, ID: {v.id}, Status: {v.status}')

products = Product.objects.all()
print('\nPRODUCTS:')
for p in products:
    print(f'Product: {p.name}, Vendor: {p.vendor.shop_name if p.vendor else "NONE"}, Status: {p.status}')
