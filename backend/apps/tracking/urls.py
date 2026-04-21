from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShipmentViewSet, RiderViewSet, AttendanceViewSet

router = DefaultRouter()
router.register(r'shipments', ShipmentViewSet, basename='shipment')
router.register(r'riders', RiderViewSet, basename='rider')
router.register(r'attendance', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('', include(router.urls)),
]
