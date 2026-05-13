import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.vendors.models import Vendor
from apps.vendors.serializers import VendorSerializer
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
request = factory.get('/')
# Use a real user if possible, but here we just need to see if it crashes
vendor = Vendor.objects.first()

if vendor:
    print(f"Testing serialization for vendor: {vendor.shop_name}")
    try:
        serializer = VendorSerializer(vendor, context={'request': request})
        data = serializer.data
        print("Serialization successful!")
        # print(data)
    except Exception as e:
        print("Serialization failed!")
        import traceback
        traceback.print_exc()
else:
    print("No vendor found in database.")
