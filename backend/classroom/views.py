from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Classroom
from .serializers import ClassroomSerializer
from django.contrib.auth.models import User
from tutors.models import Tutor

class ClassroomCreateView(CreateAPIView):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        tutor = Tutor.objects.get(user=self.request.user)
        serializer.save(tutor=tutor)
