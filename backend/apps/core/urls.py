from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlatformSettingViewSet

router = DefaultRouter()
router.register(r'settings', PlatformSettingViewSet, basename='platform-settings')

urlpatterns = [
    path('', include(router.urls)),
]
