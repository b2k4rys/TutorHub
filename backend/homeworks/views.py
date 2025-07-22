from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions
from tutors.models import Tutor
from rest_framework.exceptions import NotFound
from rest_framework.generics import CreateAPIView
# from django.contrib.auth.models import User
# Create your views here.


class HomeworkCreateView(CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        try:
            tutor = Tutor.objects.get(user=self.request.user)
        except Tutor.DoesNotExist:
            raise NotFound("not found tutor")
        context['tutor'] = tutor
        return context