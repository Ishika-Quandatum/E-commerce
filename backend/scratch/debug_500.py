import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.tracking.views import ShipmentViewSet
from rest_framework.test import APIRequestFactory, force_authenticate
from apps.users.models import User

factory = APIRequestFactory()
# Find a vendor user
vendor = User.objects.filter(role='vendor').first()

if vendor:
    request = factory.get('/api/tracking/shipments/')
    force_authenticate(request, user=vendor)
    view = ShipmentViewSet.as_view({'get': 'list'})
    try:
        response = view(request)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 500:
            print("Error data:", response.data)
    except Exception as e:
        import traceback
        print("Exception occurred:")
        traceback.print_exc()
else:
    print("No vendor user found to test.")
