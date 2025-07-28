from django.shortcuts import render
from .models import Message

def chat_room(request, room_name):
    messages = Message.objects.filter(room_name=room_name).order_by('timestamp')[:50]
    return render(request, 'chat.html', {
        'room_name': room_name,
        'messages': messages
    })

