import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.tracking.models import RiderWallet, CODCollection, Transaction
from decimal import Decimal

print("Recalculating Rider Wallets based on existing COD Collections...")
count = 0
for wallet in RiderWallet.objects.all():
    wallet.total_earned = Decimal('0.00')
    wallet.pending_cod_amount = Decimal('0.00')
    wallet.total_cod_collected = Decimal('0.00')
    
    Transaction.objects.filter(wallet=wallet).delete()
    
    cods = CODCollection.objects.filter(rider=wallet.rider)
    for cod in cods:
        earning = Decimal('40.00') # default config
        try:
            if hasattr(wallet.rider, 'salary_config') and wallet.rider.salary_config.per_delivery_commission > 0:
                earning = Decimal(str(wallet.rider.salary_config.per_delivery_commission))
        except:
            pass
            
        payable = Decimal(str(cod.amount)) - earning
        wallet.total_earned += earning
        wallet.pending_cod_amount += payable
        wallet.total_cod_collected += Decimal(str(cod.amount))
        
        Transaction.objects.create(
            wallet=wallet,
            amount=earning,
            transaction_type='Credit',
            description=f'Delivery Earning for Order #{cod.shipment.order.id}'
        )
    wallet.save()
    count += 1
    print(f"Recalculated wallet for {wallet.rider.user.username}: Total Earned={wallet.total_earned}, Pending COD={wallet.pending_cod_amount}")

print(f"Successfully processed {count} wallets.")
