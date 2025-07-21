from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions, views
from .serializers import RegisterSerializer, RoleBasedUserSerializer
from django.contrib.auth.models import User
from rest_framework.response import Response

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "email": request.user.email,
        })
    
class RequestDataView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            "cookies": request.COOKIES,
            "data": request.data,
            "headers": request.headers
        })
    
class RoleBasedRegistrationView(generics.CreateAPIView):
    serializer_class = RoleBasedUserSerializer
    