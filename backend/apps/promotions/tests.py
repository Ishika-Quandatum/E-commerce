from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from apps.categories.models import Category
from apps.products.models import Product
from apps.vendors.models import SubscriptionPlan, Vendor, VendorSubscription
from .models import PromotionBanner


User = get_user_model()


class PromotionSubscriptionGateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='vendor', role='vendor')
        self.vendor = Vendor.objects.create(user=self.user, shop_name='Vendor', shop_type='Retail')
        other_user = User.objects.create_user(username='other-vendor', role='vendor')
        self.other_vendor = Vendor.objects.create(
            user=other_user, shop_name='Other Vendor', shop_type='Retail',
        )
        category = Category.objects.create(name='General')
        self.product = Product.objects.create(
            name='Own Product', description='Description', price=10,
            category=category, vendor=self.vendor,
        )
        self.other_product = Product.objects.create(
            name='Other Product', description='Description', price=10,
            category=category, vendor=self.other_vendor,
        )
        self.payload = {
            'product': self.product.pk, 'title': 'Offer',
            'short_description': 'Offer description', 'offer_price': '8',
            'discount_percent': 20,
            'start_date': timezone.now().isoformat(),
            'end_date': (timezone.now() + timedelta(days=1)).isoformat(),
        }

    def test_vendor_without_subscription_gets_required_code_and_message(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(reverse('banner-list'), self.payload, format='json')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data['code'], 'SUBSCRIPTION_REQUIRED')
        self.assertEqual(
            response.data['message'],
            'An active subscription is required to create promotions.',
        )

    def activate_plan(self, max_promotions=None):
        plan = SubscriptionPlan.objects.create(
            name='Plan', price=Decimal('10.00'), duration_days=30,
            max_promotions=max_promotions,
        )
        now = timezone.now()
        VendorSubscription.objects.create(
            vendor=self.vendor, plan=plan, payment_id=f'payment-{plan.pk}',
            start_date=now - timedelta(minutes=1),
            end_date=now + timedelta(days=1), status='ACTIVE',
        )

    def test_product_ownership_is_enforced_after_subscription(self):
        self.activate_plan()
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse('banner-list'),
            {**self.payload, 'product': self.other_product.pk},
            format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_promotion_limit_is_enforced(self):
        self.activate_plan(max_promotions=1)
        now = timezone.now()
        PromotionBanner.objects.create(
            vendor=self.vendor, product=self.product, title='Existing',
            short_description='Existing', offer_price=Decimal('8'),
            start_date=now, end_date=now + timedelta(days=1),
        )
        self.client.force_authenticate(self.user)
        response = self.client.post(reverse('banner-list'), self.payload, format='json')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data['code'], 'PROMOTION_LIMIT_REACHED')

    def test_public_list_remains_available(self):
        response = self.client.get(reverse('banner-list'))
        self.assertEqual(response.status_code, 200)
