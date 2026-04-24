from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ShipmentViewSet, RiderViewSet, AttendanceViewSet, 
    CODCollectionViewSet, RiderSettlementViewSet, RiderFinancialLogViewSet
)

router = DefaultRouter()
router.register(r'shipments', ShipmentViewSet, basename='shipment')
router.register(r'riders', RiderViewSet, basename='rider')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'cod-collections', CODCollectionViewSet, basename='cod-collection')
router.register(r'settlements', RiderSettlementViewSet, basename='settlement')
router.register(r'financial-logs', RiderFinancialLogViewSet, basename='financial-log')

urlpatterns = [
    path('', include(router.urls)),
]
