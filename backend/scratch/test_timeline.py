import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.tracking.models import Shipment
from django.utils import timezone

# Test timestamp formatter
dt = timezone.now()
day = dt.day
suffix = 'th' if 11 <= day <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
hour_12 = dt.hour % 12 or 12
ampm = 'am' if dt.hour < 12 else 'pm'
minute = dt.strftime('%M')
date_part = dt.strftime(f"%a, {day}{suffix} %b '%y")
result = f"{date_part} - {hour_12}:{minute}{ampm}"
print("Formatted timestamp:", result)

# Check available shipments
s = Shipment.objects.filter(id=14).first()
if s:
    print("Shipment 14 found, status:", s.status)
    print("History count:", s.history.count())
    for h in s.history.all().order_by('timestamp'):
        print(" -", h.status, h.timestamp)
else:
    print("Shipment 14 not found")
    s = Shipment.objects.first()
    if s:
        print("First available shipment id:", s.id, "status:", s.status)
        print("History count:", s.history.count())
