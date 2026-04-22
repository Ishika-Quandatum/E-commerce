import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.orders.models import Order

print("--- Order Data Audit ---")
orders = Order.objects.all()
for order in orders:
    print(f"ID: #{order.id} | User: {order.user.username} ({order.user.email}) | Status: {order.status}")
