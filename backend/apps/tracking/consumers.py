import json
from channels.generic.websocket import AsyncWebsocketConsumer

class LiveTrackingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.tracking_number = self.scope['url_route']['kwargs']['tracking_number']
        self.room_group_name = f'tracking_{self.tracking_number}'

        # Join the tracking room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket (Rider sending GPS)
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        
        # Only broadcast valid location updates
        if 'lat' in text_data_json and 'lng' in text_data_json:
            lat = text_data_json['lat']
            lng = text_data_json['lng']
            
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'location_update',
                    'lat': lat,
                    'lng': lng
                }
            )

    # Receive message from room group (Broadcast to active listeners like Customer/Admin)
    async def location_update(self, event):
        lat = event['lat']
        lng = event['lng']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'lat': lat,
            'lng': lng
        }))
