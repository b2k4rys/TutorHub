# chat/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db.models import Count
import uuid



class ConversationManager(models.Manager):
    def find_or_create_private_chat(self, user1, user2):
        print("\n--- [INSIDE THE MANAGER V2] ---")
        print(f"Finding or creating chat for: {user1} (ID: {user1.pk}) AND {user2} (ID: {user2.pk})")

        user1_ct = ContentType.objects.get_for_model(user1)
        user2_ct = ContentType.objects.get_for_model(user2)

        if user1_ct == user2_ct and user1.pk == user2.pk:
            return False

        qs = self.get_queryset().annotate(num_participants=Count('participants')).filter(num_participants=2)

        for convo in qs:
            participants = convo.participants.all()
            p_set = set((p.user_content_type_id, p.user_object_id) for p in participants)
            need = {
                (user1_ct.id, user1.id),
                (user2_ct.id, user2.id),
            }
            if p_set == need:
                return convo, False

        new_convo = self.create()
        Participant.objects.create(conversation=new_convo, user=user1)
        Participant.objects.create(conversation=new_convo, user=user2)
        return new_convo, True    

class Conversation(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = ConversationManager() 

    def __str__(self):
        return str(self.id)
    
class Participant(models.Model):
    """An intermediate model to link users to a conversation."""
    conversation = models.ForeignKey(Conversation, related_name='participants', on_delete=models.CASCADE)
    
    user_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    user_object_id = models.PositiveIntegerField()
    user = GenericForeignKey('user_content_type', 'user_object_id')

    class Meta:
        unique_together = ('conversation', 'user_content_type', 'user_object_id')



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

