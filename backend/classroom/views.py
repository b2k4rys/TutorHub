from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import ClassroomSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from tutors.models import Tutor
# Create your views here.


class ClassroomAddView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ClassroomSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            tutor = Tutor.objects.get(user=request.user)
        except Tutor.DoesNotExist:
            return Response({"error": "Only tutors can create classrooms."}, status=403)
        classroom = serializer.save(tutor=tutor)
        return Response(
            {
                "message": "Classroom created successfully!",
                "classroom": ClassroomSerializer(classroom).data
            },
            status=status.HTTP_201_CREATED
        )


        