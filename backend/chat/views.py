from django.shortcuts import render, redirect, get_object_or_404
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
from .models import Conversation

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



class StartChatView(APIView):
    """
    This API endpoint finds or creates a private chat.
    It must be called with a valid JWT. It responds with the
    permanent chat room URL.
    """
    permission_classes = [IsAuthenticated] # Protects the view

    def get(self, request, user_type, user_id):
        # Find the target user's profile
        other_user_profile = None
        if user_type == 'tutor':
            other_user_profile = get_object_or_404(Tutor, pk=user_id)
        elif user_type == 'student':
            other_user_profile = get_object_or_404(Student, pk=user_id)
        else:
            # Handle invalid user type
            return Response({'error': 'Invalid user type'}, status=400)

        # Get the logged-in user's profile
        current_user_profile = None
        if hasattr(request.user, 'tutor'):
            current_user_profile = request.user.tutor
        elif hasattr(request.user, 'student'):
            current_user_profile = request.user.student
        
        if not current_user_profile:
            return Response({'error': 'Your user profile could not be found.'}, status=400)

        # Find or create the conversation
        conversation, created = Conversation.objects.find_or_create_private_chat(
            current_user_profile, 
            other_user_profile
        )

        # Instead of redirecting, return the URL in a JSON response
        chat_url = request.build_absolute_uri(f'/api/chat/{conversation.id}/')
        
        return Response({'chat_url': chat_url})


def chat_room(request, conversation_id):
    """
    Renders the chat room page for a given conversation ID.
    """
    # Fetch the conversation to ensure it exists
    conversation = get_object_or_404(Conversation, pk=conversation_id)
    
    context = {
        'conversation_id': str(conversation.id)
    }
    return render(request, 'chat/chat_room.html', context)