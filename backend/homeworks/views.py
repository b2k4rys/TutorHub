from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions, status
from tutors.models import Tutor
from students.models import Student
from rest_framework.exceptions import NotFound
from rest_framework.generics import CreateAPIView
from .models import HomeworkSubmission
from .serialziers import HomeworkGradeSerializer
from rest_framework.response import Response
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

class HomeworkSubmitView(CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        try:
            student = Student.objects.get(user=self.request.user)
        except Student.DoesNotExist:
            raise NotFound("not found student")
        context['student'] = student
        return context

class HomeworkGrade(APIView):
    permission_classes = [permissions.IsAuthenticated]


    def post(self, request, *args, **kwargs):
        try:
            tutor = Tutor.objects.get(user=self.request.user)
        except Tutor.DoesNotExist:
            raise NotFound("not found tutor")
        
        homework_id = self.kwargs['homework_id']

        try:
            submission = HomeworkSubmission.objects.get(homework = homework_id, homework__assigned_by=tutor)
        except HomeworkSubmission.DoesNotExist:
            raise NotFound("not found such homework")
        
        serializer = HomeworkGradeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        submission.feedback = serializer.validated_data['feedback']
        submission.score = serializer.validated_data['score']
        submission.save()

        return Response({"message": "Grade submitted successfully"}, status=status.HTTP_200_OK)

