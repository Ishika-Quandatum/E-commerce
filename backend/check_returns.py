import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.returns.models import ReturnRequest
from apps.users.models import User

print("--- All Return Requests ---")
for r in ReturnRequest.objects.all():
    print(f"ID: {r.id}, Order: {r.order.id}, Status: {r.status}, Rider: {r.rider}")

print("\n--- All Riders ---")
for u in User.objects.filter(role='rider'):
    print(f"User: {u.username}, Role: {u.role}")
