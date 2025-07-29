# chat/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class Conversation(models.Model):
    """
    Represents a chat room between two users.
    The room_name is the unique identifier generated in the consumer.
    """
    room_name = models.CharField(max_length=255, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.room_name

class Message(models.Model):
    """
    Represents a single message within a conversation.
    It uses a GenericForeignKey to link to the sender, who can be
    of any user model type (e.g., Tutor or Student).
    """
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    sender_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    sender_object_id = models.PositiveIntegerField()
    sender = GenericForeignKey('sender_content_type', 'sender_object_id')

    class Meta:
        ordering = ('timestamp',) 

    def __str__(self):
        return f"Message from {self.sender} at {self.timestamp}"

