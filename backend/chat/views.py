from django.shortcuts import render, get_object_or_404
from .models import Message, Participant
import uuid
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from tutors.models import Tutor
from students.models import Student
from .models import Conversation
from rest_framework import generics, permissions
from .serializers import MessageSerializer, ConversationListSerializer
from django.contrib.contenttypes.models import ContentType

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
    permission_classes = [IsAuthenticated] 

    def get(self, request, user_type, user_id):
        other_user_profile = None
        if user_type == 'tutor':
            other_user_profile = get_object_or_404(Tutor, pk=user_id)
        elif user_type == 'student':
            other_user_profile = get_object_or_404(Student, pk=user_id)
        else:
            return Response({'error': 'Invalid user type'}, status=400)

        current_user_profile = None
        if hasattr(request.user, 'tutor'):
            current_user_profile = request.user.tutor
        elif hasattr(request.user, 'student'):
            current_user_profile = request.user.student
        
        if not current_user_profile:
            return Response({'error': 'Your user profile could not be found.'}, status=status.HTTP_400_BAD_REQUEST)

        if current_user_profile == other_user_profile:
            return Response({"error": "Can not create conversation with yourself"}, status=status.HTTP_400_BAD_REQUEST)

        conversation, created = Conversation.objects.find_or_create_private_chat(
            current_user_profile, 
            other_user_profile
        )

        chat_url = request.build_absolute_uri(f'/api/chat/{conversation.id}/')
        
        return Response({'chat_url': chat_url})


def chat_room(request, conversation_id):
    """
    Renders the chat room page for a given conversation ID.
    """
    conversation = get_object_or_404(Conversation, pk=conversation_id)
    
    context = {
        'conversation_id': str(conversation.id)
    }
    return render(request, 'chat/chat_room.html', context)


class MessageHistoryView(generics.ListAPIView):
    """
    Provides the message history for a specific conversation.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        return Message.objects.filter(conversation_id=conversation_id).order_by('timestamp')



class AllChatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'tutor', None) or getattr(user, 'student', None)
        
        if not profile:
            return Response([], status=status.HTTP_200_OK)

        content_type = ContentType.objects.get_for_model(profile.__class__)

 
        conversation_ids = Participant.objects.filter(
            user_content_type=content_type,
            user_object_id=profile.id
        ).values_list('conversation_id', flat=True)

        if not conversation_ids.exists():
            return Response([])


        other_participants = Participant.objects.filter(
            conversation_id__in=conversation_ids
        ).exclude(
            user_content_type=content_type,
            user_object_id=profile.id
        ).select_related('user_content_type') 


        other_participants_map = {p.conversation_id: p for p in other_participants}

        conversations = Conversation.objects.filter(id__in=conversation_ids)

        serializer = ConversationListSerializer(
            conversations,
            many=True,
            context={'other_participants_map': other_participants_map}
        )
        return Response(serializer.data)
