from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions, status
from tutors.models import Tutor
from students.models import Student
from rest_framework.exceptions import NotFound
from rest_framework.generics import CreateAPIView
from rest_framework import exceptions
from .models import HomeworkSubmission, HomeworkClassroomAssign
from .serialziers import HomeworkGradeSerializer, HomeworkSubmitSerializer, HomeworksViewSerializer, HomeworkCreateSerializer
from rest_framework.response import Response
from classroom.models import Classroom
# from django.contrib.auth.models import User
# Create your views here.


class HomeworkCreateView(CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HomeworkCreateSerializer
    
    def get_serializer_context(self, *args, **kwargs):
        context = super().get_serializer_context()
        try:
            tutor = Tutor.objects.get(user=self.request.user)
        except Tutor.DoesNotExist:
            raise NotFound("not found tutor")
        classroom_id = self.kwargs.get('classroom_id')
        try:
            classroom = Classroom.objects.get(id=classroom_id)
        except Classroom.DoesNotExist:
            raise NotFound("not found such classroom")
        context['tutor'] = tutor
        context['classroom'] = classroom

        return context

class HomeworkSubmitView(CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HomeworkSubmitSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        try:
            student = Student.objects.get(user=self.request.user)
        except Student.DoesNotExist:
            raise NotFound("not found student")
        homework_id = self.kwargs.get('homework_id')
        try:
            homework = HomeworkClassroomAssign.objects.get(id=homework_id)
        except HomeworkClassroomAssign.DoesNotExist:
            raise NotFound("not found homework")
        
        if homework:
            print("homework is here", homework)
            context["homework"] = homework
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


class HomeworksView(APIView):

    def get(self, request, *args, **kwargs):
        user = self.request.user
        classroom_id = self.kwargs.get('classroom_id')
        try:
            classroom = Classroom.objects.get(id=classroom_id)
        except Classroom.DoesNotExist:
            raise NotFound("Classroom not found")
        
        try:
            tutor = Tutor.objects.get(user=user)
            try:
                classroom.tutor = tutor
            except Tutor.DoesNotExist:
                raise exceptions.PermissionDenied("Not tutor of this classroom")
            homeworks = HomeworkClassroomAssign.objects.all()
            serializer = HomeworksViewSerializer(homeworks, many=True)
            return Response(serializer.data)
        except Tutor.DoesNotExist:
            student = Student.objects.get(user=user)
            try:
                classroom.students = student
            except Student.DoesNotExist:
                raise exceptions.PermissionDenied("Not student of this classroom")
            homeworks = HomeworkClassroomAssign.objects.all()
            serializer = HomeworksViewSerializer(homeworks, many=True)
            return Response(serializer.data)
        
            

