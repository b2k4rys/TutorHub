from rest_framework.views import APIView
from .serializers import TutorAddSerializer, TutorDetailViewSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from .models import Tutor
from students.models import Student
from classroom.models import Classroom
from rest_framework import exceptions
class TutorAddView(APIView):

    def post(self, request):
        serializer = TutorAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tutor = serializer.save(user=request.user)
        return Response(
            {
                "message": "Classroom created successfully!",
                "classroom": TutorAddSerializer(tutor).data
            },
            status=status.HTTP_201_CREATED
        )

class TutorCheckStudent(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not Tutor.objects.filter(user=request.user).exists():
            return Response(
                {"error": "You are not a tutor."},
                status=status.HTTP_403_FORBIDDEN
            )

        username = request.data.get("student_username")
        if not username:
            return Response(
                {"error": "student_username is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        students = Student.objects.filter(user__username=username)
        if not students.exists():
            return Response(
                {"error": "Student not found."},
                status=status.HTTP_404_NOT_FOUND
            )

     
        return Response(
            {"student_id": students.first().id},
            status=status.HTTP_200_OK
        )

class TutorDetailView(APIView):

    def get(self, request, *args, **kwards):
        user = self.request.user
        tutor_id = self.kwargs.get('tutor_id')

        try:
            tutor = Tutor.objects.get(id=tutor_id)
            if tutor.user == user:
                serializer = TutorDetailViewSerializer(tutor)
                return Response(serializer.data)

        except Tutor.DoesNotExist:
            raise exceptions.NotFound('such tutor does not exist')
        
        
        try:
            student = Student.objects.get(user=user)
            try:
                classroom = Classroom.objects.get(students=student, tutor=tutor)
            except Classroom.DoesNotExist:
                raise exceptions.PermissionDenied("Must be a student of this classroom to view details")
        except Student.DoesNotExist:
            raise exceptions.PermissionDenied("Must be a student")
        serializer = TutorDetailViewSerializer(tutor)
        
        return Response(serializer.data)
