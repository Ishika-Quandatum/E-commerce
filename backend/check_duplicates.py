import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db.models import Count
User = get_user_model()

duplicates = User.objects.values('email').annotate(email_count=Count('email')).filter(email_count__gt=1, email__isnull=False).exclude(email='')
print("Duplicate emails:", list(duplicates))

if not duplicates:
    print("No duplicate emails found.")
