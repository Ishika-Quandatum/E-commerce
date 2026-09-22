from datetime import timedelta
from decimal import Decimal
import hashlib
import hmac

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from .models import SubscriptionPlan, Vendor, VendorSubscription
from .serializers import VendorSerializer


User = get_user_model()


class VendorStoreAndSubscriptionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin@example.com', email='admin@example.com',
            password='password', role='admin',
        )
        self.vendor_user = User.objects.create_user(
            username='vendor@example.com', email='vendor@example.com',
            password='password', role='vendor',
        )
        self.vendor = Vendor.objects.create(
            user=self.vendor_user, shop_name='ABC Foods', shop_type='Food',
        )

    def test_registration_stays_pending_without_slug(self):
        response = self.client.post(reverse('vendor-signup'), {
            'name': 'New Vendor', 'email': 'new-vendor@example.com',
            'password': 'password', 'shop_name': 'Pending Shop',
            'shop_type': 'Retail', 'store_slug': 'attacker-controlled-slug',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        created = Vendor.objects.get(user__email='new-vendor@example.com')
        self.assertEqual(created.status, 'Pending')
        self.assertIsNone(created.store_slug)

    def test_approval_generates_unique_slugs(self):
        self.client.force_authenticate(self.admin)
        vendors = [self.vendor]
        for index in (2, 3):
            user = User.objects.create_user(
                username=f'vendor{index}@example.com',
                email=f'vendor{index}@example.com', role='user',
            )
            vendors.append(Vendor.objects.create(
                user=user, shop_name='ABC Foods', shop_type='Food',
            ))
        for vendor in vendors:
            response = self.client.post(reverse('vendor-approve', args=[vendor.pk]))
            self.assertEqual(response.status_code, 200)
        self.assertEqual(
            list(Vendor.objects.order_by('pk').values_list('store_slug', flat=True)),
            ['abc-foods', 'abc-foods-2', 'abc-foods-3'],
        )

    def test_store_slug_is_unique_and_read_only(self):
        self.vendor.store_slug = 'abc-foods'
        self.vendor.save(update_fields=['store_slug'])
        duplicate = Vendor(
            user=User.objects.create_user(username='duplicate'),
            shop_name='Different Shop', shop_type='Food', store_slug='abc-foods',
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                duplicate.save()
        self.vendor.refresh_from_db()
        serializer = VendorSerializer(self.vendor, data={'store_slug': 'changed'}, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        self.vendor.refresh_from_db()
        self.assertEqual(self.vendor.store_slug, 'abc-foods')

    def test_store_url_uses_configured_frontend_domain(self):
        self.vendor.store_slug = 'abc-foods'
        self.vendor.save(update_fields=['store_slug'])
        with override_settings(FRONTEND_URL='https://shop.example'):
            data = VendorSerializer(self.vendor).data
        self.assertEqual(data['store_url'], 'https://shop.example/store/abc-foods/')

    def test_public_store_endpoint_resolves_slug_only_for_approved_vendor(self):
        self.vendor.status = 'Approved'
        self.vendor.store_slug = 'abc-foods'
        self.vendor.save(update_fields=['status', 'store_slug'])
        response = self.client.get(reverse('vendor-store', args=['abc-foods']))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], self.vendor.pk)
        self.vendor.status = 'Pending'
        self.vendor.save(update_fields=['status'])
        self.assertEqual(
            self.client.get(reverse('vendor-store', args=['abc-foods'])).status_code,
            404,
        )

    def test_active_subscription_boundaries(self):
        plan = SubscriptionPlan.objects.create(
            name='Starter', price=Decimal('10.00'), duration_days=30,
        )
        now = timezone.now()
        subscription = VendorSubscription.objects.create(
            vendor=self.vendor, plan=plan, payment_id='one',
            start_date=now, end_date=now + timedelta(days=1), status='ACTIVE',
        )
        self.assertTrue(subscription.is_active)
        subscription.start_date = now + timedelta(days=1)
        subscription.save(update_fields=['start_date'])
        self.assertFalse(subscription.is_active)
        subscription.start_date = now
        subscription.end_date = now - timedelta(seconds=1)
        subscription.save(update_fields=['start_date', 'end_date'])
        self.assertFalse(subscription.is_active)
        subscription.status = 'CANCELLED'
        subscription.save(update_fields=['status'])
        self.assertFalse(subscription.is_active)

    def test_vendor_subscription_isolation_and_admin_access(self):
        plan = SubscriptionPlan.objects.create(
            name='Starter', price=Decimal('10.00'), duration_days=30,
        )
        other_user = User.objects.create_user(username='other-vendor', role='vendor')
        other_vendor = Vendor.objects.create(
            user=other_user, shop_name='Other', shop_type='Retail',
        )
        subscription = VendorSubscription.objects.create(
            vendor=other_vendor, plan=plan, payment_id='other-payment',
        )
        self.client.force_authenticate(self.vendor_user)
        self.assertEqual(
            self.client.get(reverse('vendor-subscription-detail', args=[subscription.pk])).status_code,
            404,
        )
        normal_user = User.objects.create_user(username='normal-user', role='user')
        self.client.force_authenticate(normal_user)
        self.assertEqual(self.client.get(reverse('vendor-subscription-list')).status_code, 403)
        self.client.force_authenticate(self.admin)
        self.assertEqual(
            self.client.get(reverse('vendor-subscription-detail', args=[subscription.pk])).status_code,
            200,
        )

    @override_settings(SUBSCRIPTION_PAYMENT_WEBHOOK_SECRET='test-secret')
    def test_payment_verification_requires_matching_signed_details(self):
        plan = SubscriptionPlan.objects.create(
            name='Starter', price=Decimal('10.00'), duration_days=30,
        )
        self.client.force_authenticate(self.vendor_user)
        initiated = self.client.post(
            reverse('vendor-subscription-initiate'), {'plan_id': plan.pk}, format='json',
        )
        self.assertEqual(initiated.status_code, 201)
        payment_id = initiated.data['payment_id']
        response = self.client.post(
            reverse('vendor-subscription-verify-payment'),
            {'payment_id': payment_id, 'payment_success': True, 'status': 'ACTIVE'},
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(VendorSubscription.objects.get(payment_id=payment_id).status, 'PENDING')
        payload = f'{payment_id}:{plan.pk}:{plan.price}:{self.vendor.pk}'
        signature = hmac.new(b'test-secret', payload.encode(), hashlib.sha256).hexdigest()
        response = self.client.post(
            reverse('vendor-subscription-verify-payment'),
            {
                'payment_id': payment_id, 'plan_id': plan.pk,
                'amount': str(plan.price), 'vendor_id': self.vendor.pk,
                'gateway_signature': signature,
            },
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'ACTIVE')
