from rest_framework.views import APIView
from .serializers import TutorAddSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from .models import Tutor
from students.models import Student
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

        