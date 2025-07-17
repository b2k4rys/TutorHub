from django.shortcuts import render
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework import permissions
from .models import StudentProfile
from .serializers import StudentProfileSerializer
from rest_framework.response import Response
# Create your views here.

class StudentProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StudentProfileSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(user=request.user)
        return Response("registered successfully!")


