import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.contenttypes.models import ContentType
from .models import Message, Conversation

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
            
        self.profile = self.scope.get('profile')
        if not self.profile:
            await self.close()
            return

        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f"group_chat_{self.conversation_id}"

        is_participant = await self.is_user_in_conversation(self.profile, self.conversation_id)
        if not is_participant:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"✅ User '{self.user}' connected to conversation: {self.conversation_id}")


    async def disconnect(self, close_code):

        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        print(f"❌ User '{self.user}' disconnected from room.")



    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        await self.save_message(self.profile, self.conversation_id, message)

        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': self.profile.id,
                'sender_name': self.user.get_full_name() or self.user.username,
                'sender_type': self.profile._meta.model_name
            }
        )

    async def chat_message(self, event):
        print("SENDER IS", event['sender_id'])
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'sender_type': event['sender_type'],
        }))

    @database_sync_to_async
    def is_user_in_conversation(self, profile, conversation_id):
        """
        Checks if the given profile (Tutor or Student) is a participant
        in the specified conversation.
        """
        conversation = Conversation.objects.filter(pk=conversation_id).first()
        if not conversation:
            return False
            
        exists = conversation.participants.filter(
            user_content_type=ContentType.objects.get_for_model(profile),
            user_object_id=profile.pk
        ).exists()
        print(f"Result: Participant check returned '{exists}'.")
        print("------------------------\n")
        return conversation.participants.filter(
            user_content_type=ContentType.objects.get_for_model(profile),
            user_object_id=profile.pk
        ).exists()

    @database_sync_to_async
    def save_message(self, sender, conversation_id, content):
        conversation = Conversation.objects.get(pk=conversation_id)
        return Message.objects.create(
            conversation=conversation,
            sender=sender,
            content=content
        )
