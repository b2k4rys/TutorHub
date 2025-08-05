from rest_framework import serializers
from .models import Message, Participant, Conversation
class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.user.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender_name', 'content', 'timestamp']

class ConversationSerializer(serializers.ModelSerializer):
    # Nest messages to show them within each conversation
    messages = MessageSerializer(many=True, read_only=True)
    # You might also want to list participants
    
    class Meta:
        model = Conversation
        fields = ['id', 'created_at', 'messages']