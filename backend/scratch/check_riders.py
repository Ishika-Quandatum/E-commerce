import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.users.models import User
from apps.tracking.models import RiderProfile

riders = User.objects.filter(role='rider')
print(f"Total Riders: {riders.count()}")

for r in riders:
    try:
        profile = r.rider_profile
        print(f"Rider: {r.username}, Profile ID: {profile.id}")
    except RiderProfile.DoesNotExist:
        print(f"Rider: {r.username}, MISSING PROFILE!")
