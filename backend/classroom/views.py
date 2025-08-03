from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Classroom
from .serializers import ClassroomSerializer, ClassroomDetailSerializer
from tutors.models import Tutor
from students.models import Student
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
class ClassroomCreateView(CreateAPIView):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        tutor = Tutor.objects.get(user=self.request.user)
        serializer.save(tutor=tutor)

class ClassroomView(ListAPIView):
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tutor = Tutor.objects.filter(user=self.request.user).first()
        if not tutor:
            student = Student.objects.filter(user=self.request.user).first()
            return Classroom.objects.filter(students=student)
        return Classroom.objects.filter(tutor=tutor)
    
class ClassroomDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = self.request.user
        try:
            tutor = Tutor.objects.get(user=user)
        except Tutor.DoesNotExist:
            try: 
                student = Student.objects.get(user=user)
            except Student.DoesNotExist:
                raise NotFound("not student nor tutor of this classroom")
  
        
        classroom_id = self.kwargs.get('classroom_id')
        try:
            classroom = Classroom.objects.get(id=classroom_id)
        except Classroom.DoesNotExist:
            raise NotFound('Such classroom does not exist')
        
        serializer = ClassroomDetailSerializer(classroom)

        return Response(serializer.data)




