from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions
from tutors.models import Tutor
from rest_framework.exceptions import NotFound
# from django.contrib.auth.models import User
# Create your views here.


class HomeworkCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = self.request.user
        try:
            tutor = Tutor.objects.get(user = user)
        except Tutor.DoesNotExist:
            raise NotFound("Tutor not found for this user.")
        
        pass
    