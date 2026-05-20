import sys
import os
# Add current directory and backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
customers = User.objects.filter(role='customer')
for customer in customers:
    print(f"Customer User: {customer.username} | Email: {customer.email} | ID: {customer.id}")

vendors = User.objects.filter(role='vendor')
for vendor in vendors:
    print(f"Vendor User: {vendor.username} | Email: {vendor.email} | ID: {vendor.id}")
