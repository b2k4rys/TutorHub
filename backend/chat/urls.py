from django.urls import path
from .views import WebSocketTicketView, StartChatView, chat_room

urlpatterns = [
    
    path('ws-ticket/', WebSocketTicketView.as_view(), name='ws-ticket'),


    path('chat/start/<str:user_type>/<int:user_id>/', StartChatView.as_view(), name='start_chat'),
    

    path('chat/<uuid:conversation_id>/', chat_room, name='chat_room'),
]
