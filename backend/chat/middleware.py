# chat/middleware.py
from urllib.parse import parse_qs
from django.core.cache import cache
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware

# MY MODELS
from tutors.models import Tutor
from students.models import Student


@database_sync_to_async
def get_user_and_profile_from_ticket(ticket_info):
    """
    Finds the Tutor/Student profile and returns both the profile 
    and its associated base User object.
    """
    user_pk = ticket_info.get('user_pk')
    user_type = ticket_info.get('user_type')

    if not user_pk or not user_type:
        return AnonymousUser(), None
    
    try:
        profile = None
        if user_type == 'tutor':
            profile = Tutor.objects.select_related('user').get(pk=user_pk)
        elif user_type == 'student':
            profile = Student.objects.select_related('user').get(pk=user_pk)
        
        if profile:
            return profile.user, profile  
        
        return AnonymousUser(), None
        
    except (Tutor.DoesNotExist, Student.DoesNotExist):
        return AnonymousUser(), None

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
                user, profile = await get_user_and_profile_from_ticket(ticket_info)
                scope['user'] = user
                scope['profile'] = profile 
                cache.delete(cache_key) 
            else:
                scope["user"] = AnonymousUser()
                scope["profile"] = None
        
        return await super().__call__(scope, receive, send)



def TicketAuthMiddlewareStack(inner):
    return TicketAuthMiddleware(inner)
