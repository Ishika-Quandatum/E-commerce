from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorViewSet, SubscriptionPlanViewSet, VendorSubscriptionViewSet

router = DefaultRouter()
router.register(r'subscription-plans', SubscriptionPlanViewSet, basename='subscription-plan')
router.register(r'subscriptions', VendorSubscriptionViewSet, basename='vendor-subscription')
router.register(r'', VendorViewSet, basename='vendor')

urlpatterns = [
    path('', include(router.urls)),
]
