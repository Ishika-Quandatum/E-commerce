import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.users.models import User
from apps.tracking.models import RiderProfile

u = User.objects.get(username='kannan')
print(f"User: {u.username}, ID: {u.id}, Role: {u.role}")
try:
    rp = u.rider_profile
    print(f"RiderProfile ID: {rp.id}")
except:
    print("No RiderProfile found for kannan")
