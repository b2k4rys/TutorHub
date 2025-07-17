from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions, views
from .serializers import RegisterSerializer
from django.contrib.auth.models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return {
            "username": request.user.username,
            "email": request.user.email,
        }