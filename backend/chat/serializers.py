from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.user.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender_name', 'content', 'timestamp']