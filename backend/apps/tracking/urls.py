from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ShipmentViewSet, RiderViewSet, AttendanceViewSet, 
    CODCollectionViewSet, RiderMonthlySettlementViewSet,
    RiderWalletTransactionViewSet, RiderSalaryTransactionViewSet, RiderFinancialLogViewSet
)

router = DefaultRouter()
router.register(r'shipments', ShipmentViewSet, basename='shipment')
router.register(r'riders', RiderViewSet, basename='rider')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'cod-collections', CODCollectionViewSet, basename='cod-collection')
router.register(r'wallet-transactions', RiderWalletTransactionViewSet, basename='wallet-transaction')
router.register(r'salary-transactions', RiderSalaryTransactionViewSet, basename='salary-transaction')
router.register(r'settlements', RiderMonthlySettlementViewSet, basename='settlement')
router.register(r'financial-logs', RiderFinancialLogViewSet, basename='financial-log')

urlpatterns = [
    path('', include(router.urls)),
]
