import os
import django
from rest_framework.test import APIClient

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

client = APIClient()
login_url = "/api/users/login/"

# Verify user details again
email = "rider@gmail.com"
rider = User.objects.get(email=email)
print(f"Rider: {rider.username}, Active: {rider.is_active}, Email: {rider.email}")

# Explicitly test the serializer
from apps.users.serializers import CustomTokenObtainPairSerializer

serializer = CustomTokenObtainPairSerializer(data={
    "username": "rider@gmail.com",
    "password": "ZPQtkHI2YfqK"
})

try:
    is_valid = serializer.is_valid(raise_exception=True)
    print("Serializer is valid:", is_valid)
    print("Validated data:", serializer.validated_data)
except Exception as e:
    print("Serializer failed:", str(e))

# Test via API
res = client.post(login_url, {"username": "rider@gmail.com", "password": "ZPQtkHI2YfqK"}, format="json")
print(f"API Response Code: {res.status_code}")
if res.status_code != 200:
    print("API Error:", res.data)
