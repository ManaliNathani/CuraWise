import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User

from .models import Consultation, Message
from .serializers import MessageSerializer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.consultation_id = self.scope["url_route"]["kwargs"]["consultation_id"]
        self.room_group_name = f"consultation_{self.consultation_id}"

        if not self.scope.get("user") or not self.scope["user"].is_authenticated:
            await self.close()
            return

        allowed = await self._is_participant(self.consultation_id, self.scope["user"].id)
        if not allowed:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return
        payload = json.loads(text_data)
        content = payload.get("content", "").strip()
        if not content:
            return

        message = await self._create_message(self.consultation_id, self.scope["user"].id, content)
        serialized = MessageSerializer(message).data
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "chat_message", "message": serialized},
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    @sync_to_async
    def _create_message(self, consultation_id: int, sender_id: int, content: str):
        consultation = Consultation.objects.get(id=consultation_id)
        sender = User.objects.get(id=sender_id)
        return Message.objects.create(consultation=consultation, sender=sender, content=content)

    @sync_to_async
    def _is_participant(self, consultation_id: int, user_id: int) -> bool:
        consultation = Consultation.objects.get(id=consultation_id)
        return consultation.user_id == user_id or consultation.doctor_id == user_id
