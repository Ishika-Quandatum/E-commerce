import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.tracking.models import Shipment
from apps.tracking.serializers import ShipmentSerializer
from rest_framework.request import Request
from django.test import RequestFactory
from django.contrib.auth import get_user_model

User = get_user_model()

factory = RequestFactory()
request = factory.get('/')
# Simulate a user without a rider profile
user = User.objects.filter(is_superuser=True).first()
request.user = user

shipment = Shipment.objects.all().first()
if shipment:
    serializer = ShipmentSerializer(shipment, context={'request': Request(request)})
    try:
        data = serializer.data
        print("Success!")
        print(f"Earning: {data.get('estimated_earning')}")
        print(f"Distance: {data.get('distance')}")
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("No shipments found to test")
