import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.products.models import Product
from apps.orders.models import Order, OrderItem
from apps.returns.models import ReturnRequest, ReturnItem
from apps.vendors.models import Vendor
from django.utils import timezone

User = get_user_model()

# 1. Create or get Customer user
customer, created = User.objects.get_or_create(
    username="customer@gmail.com",
    email="customer@gmail.com",
    defaults={"role": "customer", "first_name": "Jane", "last_name": "Doe"}
)
if created or not customer.check_password("password123"):
    customer.set_password("password123")
    customer.save()
    print("Test customer 'customer@gmail.com' created/updated with password 'password123'")
else:
    print("Test customer 'customer@gmail.com' already exists.")

# 2. Fetch some products to assign
products = list(Product.objects.all())
if not products:
    print("No products found in DB! Please seed products first.")
    sys.exit(1)

print(f"Found {len(products)} products in database.")

# 3. Clean up existing orders for this customer to ensure clean slate
Order.objects.filter(user=customer).delete()
print("Cleaned up old orders for customer.")

# 4. Get a vendor
vendor = Vendor.objects.first()
if not vendor:
    print("No vendors found in DB!")
    sys.exit(1)

# Order 1: Delivered order with one reviewed/reviewable item and one refunded item
order1 = Order.objects.create(
    user=customer,
    status="Delivered",
    address="123 Luxury Lane, Bangalore, Karnataka - 560001",
    total_price=0,
    created_at=timezone.now() - timezone.timedelta(days=10)
)
p1 = products[0]
p2 = products[min(1, len(products)-1)]

item1 = OrderItem.objects.create(
    order=order1,
    product=p1,
    quantity=1,
    price=p1.price,
    size="M"
)

item2 = OrderItem.objects.create(
    order=order1,
    product=p2,
    quantity=1,
    price=p2.price,
    size="L"
)

# Create Return Request for item2 (Refund Processed)
ret1 = ReturnRequest.objects.create(
    order=order1,
    customer=customer,
    vendor=getattr(p2, 'vendor', None) or vendor,
    status="Refund Processed",
    refund_amount=item2.price,
    reason="Item didn't fit",
    description="Product was smaller than expected",
    refund_method="Wallet"
)
ReturnItem.objects.create(
    return_request=ret1,
    order_item=item2,
    quantity=1
)

order1.total_price = item1.price + item2.price
order1.save()

# Order 2: Delivered order with return requested item
order2 = Order.objects.create(
    user=customer,
    status="Delivered",
    address="123 Luxury Lane, Bangalore, Karnataka - 560001",
    total_price=0,
    created_at=timezone.now() - timezone.timedelta(days=5)
)
p3 = products[min(2, len(products)-1)]
item3 = OrderItem.objects.create(
    order=order2,
    product=p3,
    quantity=2,
    price=p3.price,
    size="S"
)

# Create Return Request for item3 (Return Requested)
ret2 = ReturnRequest.objects.create(
    order=order2,
    customer=customer,
    vendor=getattr(p3, 'vendor', None) or vendor,
    status="Return Requested",
    refund_amount=item3.price * 2,
    reason="Defective item",
    description="The color was fading on the edges",
    refund_method="Wallet"
)
ReturnItem.objects.create(
    return_request=ret2,
    order_item=item3,
    quantity=2
)

order2.total_price = item3.price * 2
order2.save()

# Order 3: Shipped / Processing order
order3 = Order.objects.create(
    user=customer,
    status="Processing",
    address="123 Luxury Lane, Bangalore, Karnataka - 560001",
    total_price=0,
    created_at=timezone.now() - timezone.timedelta(days=1)
)
p4 = products[min(3, len(products)-1)]
item4 = OrderItem.objects.create(
    order=order3,
    product=p4,
    quantity=1,
    price=p4.price,
    size="XL"
)
order3.total_price = item4.price
order3.save()

# Order 4: Cancelled order
order4 = Order.objects.create(
    user=customer,
    status="Cancelled",
    address="123 Luxury Lane, Bangalore, Karnataka - 560001",
    total_price=0,
    created_at=timezone.now() - timezone.timedelta(days=15)
)
p5 = products[min(4, len(products)-1)]
item5 = OrderItem.objects.create(
    order=order4,
    product=p5,
    quantity=1,
    price=p5.price,
    size="M"
)
order4.total_price = item5.price
order4.save()

print("Seeded 4 mock orders (including full Return & Refund histories) successfully!")
