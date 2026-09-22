from django.db import migrations
from django.utils.text import slugify


def backfill_approved_slugs(apps, schema_editor):
    Vendor = apps.get_model('vendors', 'Vendor')
    for vendor in Vendor.objects.filter(status='Approved', store_slug__isnull=True).order_by('pk'):
        base_slug = slugify(vendor.shop_name) or f'vendor-{vendor.pk}'
        candidate = base_slug
        counter = 2
        while Vendor.objects.filter(store_slug=candidate).exists():
            candidate = f'{base_slug}-{counter}'
            counter += 1
        Vendor.objects.filter(pk=vendor.pk).update(store_slug=candidate)


class Migration(migrations.Migration):
    dependencies = [
        ('vendors', '0007_subscriptionplan_vendor_store_slug_and_more'),
    ]

    operations = [
        migrations.RunPython(backfill_approved_slugs, migrations.RunPython.noop),
    ]
