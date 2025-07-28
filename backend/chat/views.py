from django.shortcuts import render
from .models import Message
import uuid
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

class WebSocketTicketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        
        ticket = str(uuid.uuid4())
        user_info = {
            'user_pk': user.pk,
            'user_type': user._meta.model_name 
        }
        cache.set(f"ws_ticket_{ticket}", user_info, timeout=60)
        
        return Response({'ticket': ticket}, status=status.HTTP_201_CREATED)


def chat_room(request, room_name):
    messages = Message.objects.filter(room_name=room_name).order_by('timestamp')[:50]
    return render(request, 'chat.html', {
        'room_name': room_name,
        'messages': messages
    })

