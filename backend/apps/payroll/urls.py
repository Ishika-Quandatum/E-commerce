from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PayrollRuleViewSet, RiderPayrollViewSet, 
    RiderSettlementViewSet, RiderWalletViewSet,
    DeliveryBonusRuleViewSet, PenaltyRuleViewSet, PayrollConfigurationViewSet
)

router = DefaultRouter()
router.register(r'rules', PayrollRuleViewSet)
router.register(r'bonus-rules', DeliveryBonusRuleViewSet)
router.register(r'penalty-rules', PenaltyRuleViewSet)
router.register(r'config', PayrollConfigurationViewSet, basename='payroll-config')
router.register(r'settlements', RiderSettlementViewSet)
router.register(r'wallets', RiderWalletViewSet)
router.register(r'manage', RiderPayrollViewSet, basename='payroll-manage')

urlpatterns = [
    path('', include(router.urls)),
]
