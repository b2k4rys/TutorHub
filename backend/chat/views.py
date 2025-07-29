from django.shortcuts import render
from .models import Message
import uuid
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.decorators import login_required
import uuid
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from tutors.models import Tutor
from students.models import Student

class WebSocketTicketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        ticket = str(uuid.uuid4())

        user_profile = None
        user_type = None


        if hasattr(user, 'tutor'):
            user_profile = user.tutor
            user_type = 'tutor'

        elif hasattr(user, 'student'):
            user_profile = user.student
            user_type = 'student'

        if not user_profile:
            return Response(
                {'error': 'User profile (Tutor or Student) not found.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        
        user_info = {
            'user_pk': user_profile.pk,
            'user_type': user_type
        }
        
        cache_key = f"ws_ticket_{ticket}"
        cache.set(cache_key, user_info, timeout=60)
        
        print(f"✅ [TICKET VIEW] Saved to cache with key '{cache_key}': {user_info}")
        
        return Response({'ticket': ticket}, status=status.HTTP_201_CREATED)





@login_required 
def chat_room(request, user_type, user_id):
    """
    This view renders the chat room page. The JavaScript on this page
    will then handle the WebSocket connection.
    """
    
    context = {
        'chat_with_user_type': user_type,
        'chat_with_user_id': user_id,
    }
    return render(request, 'chat/chat_room.html', context)
