import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

user = User.objects.get(username="rider")
user.set_password("ZPQtkHI2YfqK")
user.save()
print("Password reset for 'rider'")
