# chat/middleware.py
import json
from urllib.parse import parse_qs
from django.core.cache import cache
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware

# MY MODELS
from tutors.models import Tutor
from students.models import Student

@database_sync_to_async
def get_user_from_ticket_info(ticket_info):
    """
    Given the user info stored in the cache, retrieve the actual user instance.
    """
    
    user_pk = ticket_info.get('user_pk')
    user_type = ticket_info.get('user_type')

    if not user_pk or not user_type:
        return AnonymousUser()
    
    try:
        if user_type == 'tutor':
            return Tutor.objects.get(pk=user_pk)
        elif user_type == 'student':
            return Student.objects.get(pk=user_pk)
        return AnonymousUser()
    except (Tutor.DoesNotExist, Student.DoesNotExist):
        return AnonymousUser()

class TicketAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        ticket = query_params.get("ticket", [None])[0]

        if ticket is None:
            scope["user"] = AnonymousUser()
        else:
            cache_key = f"ws_ticket_{ticket}"
            ticket_info = cache.get(cache_key)
            
            if ticket_info:
                scope["user"] = await get_user_from_ticket_info(ticket_info)
                cache.delete(cache_key) 
            else:
                scope["user"] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)

def TicketAuthMiddlewareStack(inner):
    return TicketAuthMiddleware(inner)
