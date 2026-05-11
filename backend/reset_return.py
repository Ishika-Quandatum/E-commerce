import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.returns.models import ReturnRequest

r = ReturnRequest.objects.get(id=1)
r.status = 'Approved'
r.rider = None
r.save()

print(f"Reset Return Request #1: Status={r.status}, Rider={r.rider}")
