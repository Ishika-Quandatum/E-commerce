import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.users.models import User

u = User.objects.get(username='rider')
u.set_password('password123')
u.save()

print(f"Password set for user: {u.username}")
