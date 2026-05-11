import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.users.models import User

u = User.objects.get(username='kannan')
print(f"User: {u.username}, Email: {u.email}")

u2 = User.objects.get(email='rider@gmail.com')
print(f"User with rider@gmail.com: {u2.username}")
