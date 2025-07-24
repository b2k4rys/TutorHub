from rest_framework.views import APIView
from rest_framework import permissions
from .serializers import StudentRegisterSerializer, StudentTutorDetailViewSerializer, StudentStudentDetailViewSerializer
from rest_framework.response import Response
from tutors.models import Tutor
from classroom.models import Classroom
from .models import Student
from rest_framework import exceptions
# Create your views here.

class StudentRegisterView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StudentRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(user=request.user)
        return Response("registered successfully!")

class StudentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = self.request.user
        student_id = self.kwargs.get('student_id')

        try:
            student_detail = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            raise exceptions.NotFound("not found such user")
        
        try:
            tutor = Tutor.objects.get(user=user)
            try:
                classroom = Classroom.objects.get(students=student_detail, tutor=tutor)

            except Classroom.DoesNotExist:
                raise exceptions.NotFound("No such classroom with such tutor and student")
            
            serializer = StudentTutorDetailViewSerializer(student_detail)
            return Response(serializer.data)

        except Tutor.DoesNotExist:
            try:
                student = Student.objects.get(user=user)
                try:
                    classroom = Classroom.objects.filter(students=student).filter(students=student_detail).first()
                except Classroom.DoesNotExist:
                    raise exceptions.NotFound("No such classroom where two students exist")
                
                serializer = StudentStudentDetailViewSerializer(student_detail)
                return Response(serializer.data)
                

            except Student.DoesNotExist:
                raise exceptions.NotFound("Not found such student or tutor")
