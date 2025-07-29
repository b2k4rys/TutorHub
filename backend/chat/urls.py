from django.urls import path
from .views import chat_room, WebSocketTicketView

urlpatterns = [
    
    path('ws-ticket/', WebSocketTicketView.as_view(), name='ws-ticket'),
    path('chat/<str:user_type>/<int:user_id>/', chat_room, name='chat_room'),
]
