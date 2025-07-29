import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


from .models import Message, Conversation
from tutors.models import Tutor
from students.models import Student

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        other_user_type = self.scope['url_route']['kwargs']['user_type']
        other_user_id = self.scope['url_route']['kwargs']['user_id']
        

        user1_info = (self.user._meta.model_name, self.user.id)
        user2_info = (other_user_type, int(other_user_id))
        
        sorted_users = sorted([user1_info, user2_info])
        
        self.room_name = f"chat_{sorted_users[0][0]}_{sorted_users[0][1]}_{sorted_users[1][0]}_{sorted_users[1][1]}"
        self.room_group_name = f"group_{self.room_name}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        
        await self.accept()
        print(f"✅ User '{self.user}' connected to room: {self.room_name}")


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


        await self.save_message(self.user, self.room_name, message)


        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': self.user.id,
                'sender_name': self.user.get_full_name() if hasattr(self.user, 'get_full_name') else self.user.username,
                'sender_type': self.user._meta.model_name
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
    def save_message(self, sender, room_name, content):
        """
        Saves a message to the database, creating a conversation if it doesn't exist.
        Note: This assumes your `Message` and `Conversation` models are set up
        to handle generic relations for the sender.
        """

        conversation, created = Conversation.objects.get_or_create(room_name=room_name)
        

        return Message.objects.create(
            conversation=conversation,
            sender=sender,  
            content=content
        )
