from django.urls import path
from .views import chat_room, WebSocketTicketView

urlpatterns = [
    path('<str:room_name>/', chat_room, name='chat-room'),
    path('api/ws-ticket/', WebSocketTicketView.as_view(), name='ws-ticket'),
]
