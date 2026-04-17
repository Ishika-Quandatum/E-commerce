from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, VendorPayoutViewSet

router = DefaultRouter()
router.register(r'vendor-payouts', VendorPayoutViewSet, basename='vendor-payout')
router.register(r'', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
