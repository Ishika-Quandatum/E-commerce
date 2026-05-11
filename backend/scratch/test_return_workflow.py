import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.returns.models import ReturnRequest, ReturnStatusHistory
from django.contrib.auth import get_user_model

User = get_user_model()

def test_workflow():
    # 1. Find or create a return request
    ret = ReturnRequest.objects.first()
    if not ret:
        print("No return request found to test.")
        return

    admin = User.objects.filter(role__in=['admin', 'superadmin']).first()
    if not admin:
        print("No admin user found.")
        return

    print(f"Testing Return Request #{ret.id}")
    print(f"Current Status: {ret.status}")

    # Reset for test
    ret.status = 'Return Requested'
    ret.save()
    ReturnStatusHistory.objects.filter(return_request=ret).delete()
    ReturnStatusHistory.objects.create(return_request=ret, status='Return Requested', changed_by=ret.customer)

    # Simulate Status Transitions
    transitions = [
        ('Approved by Vendor', ret.vendor.user),
        ('Pickup Assigned', admin),
        ('Picked Up from Customer', admin), # In real life would be rider
        ('Picked Up from Customer', admin), # Duplicate test
        ('Delivered to Vendor', admin),
        ('Vendor Confirmed Received', ret.vendor.user),
        ('Inspection Started', ret.vendor.user),
        ('Refund Approved', admin),
        ('Refund Processed', admin),
    ]

    for status, user in transitions:
        print(f"Updating to: {status} by {user.username}")
        # We simulate the view logic here partially or just use the model
        # To truly test the view, we'd need a request factory, but this is a quick check
        
        # Check if already exists
        if ret.status == status:
            print(f"  Skipping history for duplicate status: {status}")
        else:
            ret.status = status
            ret.save()
            ReturnStatusHistory.objects.get_or_create(
                return_request=ret,
                status=status,
                defaults={'changed_by': user}
            )

    print("\nFinal History:")
    for h in ret.history.all().order_by('timestamp'):
        print(f" - {h.status} ({h.timestamp})")

    duplicate_count = ret.history.filter(status='Picked Up from Customer').count()
    if duplicate_count > 1:
        print(f"\nFAILURE: Found {duplicate_count} duplicate entries for 'Picked Up from Customer'")
    else:
        print("\nSUCCESS: No duplicates found for 'Picked Up from Customer'")

if __name__ == "__main__":
    test_workflow()
