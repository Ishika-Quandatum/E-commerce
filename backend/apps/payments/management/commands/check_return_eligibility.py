from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.payments.models import VendorPayout

class Command(BaseCommand):
    help = 'Automatically unlocks vendor payouts whose return eligibility window has expired'

    def handle(self, *args, **options):
        now = timezone.now()
        # Find all payouts currently in RETURN_HOLD that are past the return window
        from django.db.models import Q
        payouts = VendorPayout.objects.filter(
            settlementStatus='RETURN_HOLD'
        ).filter(
            Q(returnEligibleUntil__lt=now) | Q(returnEligibleUntil__isnull=True, due_date__lt=now)
        )
        updated_count = 0
        for payout in payouts:
            # Double check if any active return requests exist for the order
            has_return_request = payout.order.return_requests.exclude(status='Cancelled').exists()
            if not has_return_request:
                payout.settlementStatus = 'READY_FOR_PAYOUT'
                payout.save()
                updated_count += 1
                
        self.stdout.write(self.style.SUCCESS(f"Successfully unlocked {updated_count} payouts."))
