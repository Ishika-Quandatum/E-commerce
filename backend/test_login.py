import os
import django
from django.test import Client

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from django.urls import reverse

c = Client()
login_url = "/api/users/login/" # Assuming this is the path based on urls.py

# Test with username (should succeed)
res_user = c.post(login_url, {"username": "rider", "password": "ZPQtkHI2YfqK"}, content_type="application/json")
print(f"Login with username 'rider': {res_user.status_code}")

# Test with email (expected to fail with current setup)
res_email = c.post(login_url, {"username": "rider@gmail.com", "password": "ZPQtkHI2YfqK"}, content_type="application/json")
print(f"Login with email 'rider@gmail.com': {res_email.status_code}")
if res_email.status_code != 200:
    print("Response:", res_email.json())
