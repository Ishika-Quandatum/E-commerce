from django.utils import timezone
from apps.tracking.models import Shipment

dt = timezone.now()
day = dt.day
suffix = 'th' if 11 <= day <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
h12 = dt.hour % 12 or 12
ampm = 'am' if dt.hour < 12 else 'pm'
m = dt.strftime('%M')
dp = dt.strftime('%a, ') + str(day) + suffix + dt.strftime(" %b") + " '" + dt.strftime('%y')
result = dp + ' - ' + str(h12) + ':' + m + ampm
print('TIMESTAMP FORMAT OK:', result)

ships = list(Shipment.objects.order_by('-id')[:5])
for s in ships:
    print(f'Shipment {s.id}: status={s.status}, history_count={s.history.count()}, order_id={s.order_id}')
