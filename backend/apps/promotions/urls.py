from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PromotionBannerViewSet

router = DefaultRouter()
router.register(r'banners', PromotionBannerViewSet, basename='banner')

urlpatterns = [
    path('', include(router.urls)),
]
