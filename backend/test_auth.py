import os
import django
from django.contrib.auth import authenticate

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Test credentials
username = "rider"
email = "rider@gmail.com"
password = "ZPQtkHI2YfqK"

user_by_username = authenticate(username=username, password=password)
print(f"Authenticate with username '{username}': {user_by_username}")

user_by_email = authenticate(username=email, password=password)
print(f"Authenticate with email '{email}': {user_by_email}")

# Check if email login works if we find the username first (which is what my serializer does)
try:
    user_obj = User.objects.get(email=email)
    print(f"Found user by email: {user_obj.username}")
    user_by_found_username = authenticate(username=user_obj.username, password=password)
    print(f"Authenticate with found username: {user_by_found_username}")
except Exception as e:
    print(f"Error: {e}")
