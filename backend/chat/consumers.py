import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.contenttypes.models import ContentType

from .models import Message, Conversation
from tutors.models import Tutor
from students.models import Student


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Authenticate the user via the ticket middleware
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
            
        self.profile = self.scope.get('profile')
        if not self.profile:
            await self.close()
            return

        # Get the conversation ID from the URL
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f"group_chat_{self.conversation_id}"

        # SECURITY CHECK: Ensure the authenticated user is part of this conversation
        is_participant = await self.is_user_in_conversation(self.profile, self.conversation_id)
        if not is_participant:
            # If not a participant, reject the connection
            await self.close()
            return

        # Join room group
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

# ... inside the ChatConsumer class ...

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        # --- THIS IS THE FIX ---
        # We need to pass self.profile as the sender and
        # self.conversation_id as the room identifier.
        # The original code was trying to use self.room_name, which no longer exists.
        await self.save_message(self.profile, self.conversation_id, message)

        # Broadcast the message to the entire group
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
