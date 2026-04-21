from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShipmentViewSet, RiderViewSet

router = DefaultRouter()
router.register(r'shipments', ShipmentViewSet, basename='shipment')
router.register(r'riders', RiderViewSet, basename='rider')

urlpatterns = [
    path('', include(router.urls)),
]
