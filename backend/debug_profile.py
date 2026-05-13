import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.vendors.views import VendorViewSet
from rest_framework.test import APIRequestFactory, force_authenticate

User = get_user_model()
user = User.objects.filter(role='vendor').first()

if not user:
    print("No vendor user found.")
else:
    print(f"Testing profile for user: {user.username}")
    factory = APIRequestFactory()
    request = factory.get('/api/vendors/profile/')
    force_authenticate(request, user=user)
    
    view = VendorViewSet.as_view({'get': 'profile'})
    try:
        response = view(request)
        print(f"Response Status: {response.status_code}")
        if response.status_code == 500:
            print("Response Data:", response.data)
        else:
            print("Profile retrieved successfully!")
    except Exception as e:
        print("Profile request failed!")
        import traceback
        traceback.print_exc()
