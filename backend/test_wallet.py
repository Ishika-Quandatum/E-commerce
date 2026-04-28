import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.orders.models import Order
from apps.tracking.models import Shipment, RiderWallet, SalaryConfiguration, Transaction
from decimal import Decimal
import traceback

try:
    s = Shipment.objects.filter(status='Delivered').last()
    print("Shipment:", s.id, "Order:", s.order.id, "Total:", s.order.total_price)
    wallet, _ = RiderWallet.objects.get_or_create(rider=s.rider)
    config, _ = SalaryConfiguration.objects.get_or_create(rider=s.rider)
    print("Wallet:", wallet.id, "Current Balance:", wallet.current_balance)
    
    delivery_earning = config.per_delivery_commission
    print("Delivery Earning type:", type(delivery_earning), "Value:", delivery_earning)
    
    if delivery_earning == 0:
        delivery_earning = Decimal('40.00') # Fallback
    
    payable_to_admin = s.order.total_price - delivery_earning
    print("Payable to Admin:", payable_to_admin)
    
    wallet.pending_cod_amount += payable_to_admin
    wallet.total_cod_collected += s.order.total_price
    wallet.total_earned += delivery_earning
    print("Saving wallet...")
    wallet.save()
    
    Transaction.objects.create(
        wallet=wallet,
        amount=delivery_earning,
        transaction_type='Credit',
        description=f'Delivery Earning for Order #{s.order.id}'
    )
    print("Success!")
except Exception as e:
    print("Error:", e)
    traceback.print_exc()
