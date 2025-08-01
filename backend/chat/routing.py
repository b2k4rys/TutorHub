from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path(
        'ws/chat/<uuid:conversation_id>/', 
        consumers.ChatConsumer.as_asgi()
    ),
]
