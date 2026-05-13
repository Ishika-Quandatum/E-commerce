import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.vendors.models import Vendor
from apps.vendors.serializers import VendorSerializer
from rest_framework.test import APIRequestFactory

vendor = Vendor.objects.first()
if not vendor:
    print("No vendor found.")
else:
    factory = APIRequestFactory()
    request = factory.get('/')
    
    serializer = VendorSerializer(vendor, context={'request': request})
    print("Shop Logo URL:", serializer.data.get('shop_logo'))
    print("Shop Banner URL:", serializer.data.get('shop_banner'))
