from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/tracking/<str:tracking_number>/', consumers.LiveTrackingConsumer.as_asgi()),
]
