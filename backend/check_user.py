import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

email = "rider@gmail.com"
user = User.objects.filter(email=email).first()

if user:
    print(f"User found: {user.username}, Role: {user.role}, Is Active: {user.is_active}")
else:
    print(f"No user found with email: {email}")

all_users = User.objects.all().values('username', 'email', 'role')
print("All users:", list(all_users))
