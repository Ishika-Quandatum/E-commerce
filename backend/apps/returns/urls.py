from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReturnRequestViewSet, ReturnPolicyViewSet

router = DefaultRouter()
router.register(r'requests', ReturnRequestViewSet, basename='return-request')
router.register(r'policies', ReturnPolicyViewSet, basename='return-policy')

urlpatterns = [
    path('', include(router.urls)),
]
