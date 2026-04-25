import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Shipment, RiderProfile, TrackingHistory
from datetime import timedelta

class LiveTrackingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.tracking_number = self.scope['url_route']['kwargs']['tracking_number']
        self.room_group_name = f'tracking_{self.tracking_number}'
        self.user = self.scope.get('user')
        self.last_update_time = timezone.now() - timedelta(seconds=10) # Initial buffer

        # 1. Block Anonymous
        if not self.user or self.user.is_anonymous:
            await self.close(code=4001)
            return

        # 2. Check Permission & Ownership
        shipment = await self.get_shipment_and_check_permission()
        if not shipment:
            await self.close(code=4003)
            return

        # Join the tracking room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    # Receive message from WebSocket (Rider sending GPS)
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return # Ignore bad JSON

        # 1. Role Check: Only assigned Rider can push updates
        if self.user.role != 'rider':
            return # Ignore updates from non-riders

        # 2. Rate Limiting: Max 1 update per 5 seconds
        now = timezone.now()
        if (now - self.last_update_time).total_seconds() < 5:
            return
        
        self.last_update_time = now

        lat = data.get('lat')
        lng = data.get('lng')

        if lat is not None and lng is not None:
            # 3. Save to DB (Async)
            await self.save_location_to_db(lat, lng)

            # 4. Broadcast to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'location_update',
                    'lat': lat,
                    'lng': lng,
                    'timestamp': now.isoformat()
                }
            )

    async def location_update(self, event):
        # Send broadcasted update to client
        await self.send(text_data=json.dumps({
            'lat': event['lat'],
            'lng': event['lng'],
            'timestamp': event.get('timestamp')
        }))

    @database_sync_to_async
    def get_shipment_and_check_permission(self):
        try:
            shipment = Shipment.objects.select_related('rider__user', 'order__user').get(tracking_number=self.tracking_number)
            
            # Admins see all
            if self.user.role in ['admin', 'superadmin']:
                return shipment
            
            # Rider only if assigned
            if self.user.role == 'rider':
                if shipment.rider and shipment.rider.user == self.user:
                    return shipment
            
            # Customer only if it's their order
            if self.user.role == 'user':
                if shipment.order.user == self.user:
                    return shipment
            
            # Vendor if it's their product (Simplified: check if any item in order is from vendor)
            # For this MVP, we allow vendor check if needed, but usually vendor tracks dispatch, not live street path
            if self.user.role == 'vendor':
                return shipment # In a real app, restrict to orders containing vendor's items

            return None
        except Shipment.DoesNotExist:
            return None

    @database_sync_to_async
    def save_location_to_db(self, lat, lng):
        try:
            # Update Rider Profile
            rider = RiderProfile.objects.get(user=self.user)
            rider.current_lat = lat
            rider.current_lng = lng
            rider.save()

            # Optional: Log to Tracking History every 1 minute or significant distance 
            # For now, we log it for the shipment path
            shipment = Shipment.objects.get(tracking_number=self.tracking_number)
            TrackingHistory.objects.create(
                shipment=shipment,
                status=shipment.status,
                location_lat=lat,
                location_lng=lng,
                description="Live movement update"
            )
        except Exception as e:
            print(f"Error saving tracking data: {str(e)}")

