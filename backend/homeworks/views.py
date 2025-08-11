from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions, status
from tutors.models import Tutor
from students.models import Student
from rest_framework.exceptions import NotFound
from rest_framework.generics import CreateAPIView
from rest_framework import exceptions
from .models import HomeworkSubmission, HomeworkClassroomAssign
from .serializers import HomeworkGradeSerializer, HomeworkSubmitSerializer, HomeworksViewSerializer, HomeworkCreateSerializer, HomeworkViewSubmissionsSerializer, HomeworkCommentSerializer
from rest_framework.response import Response
from classroom.models import Classroom
from django.contrib.contenttypes.models import ContentType
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
            except Exception as e:
                raise exceptions.PermissionDenied("Not tutor of this classroom")
            homeworks = HomeworkClassroomAssign.objects.all()
            serializer = HomeworksViewSerializer(homeworks, many=True)
            return Response(serializer.data)
        except Tutor.DoesNotExist:
            student = Student.objects.get(user=user)
            if not classroom.students.filter(pk=student.pk).exists():
                raise exceptions.PermissionDenied("Not a student of this classroom")
            homeworks = HomeworkClassroomAssign.objects.filter(classroom=classroom).all()
            serializer = HomeworksViewSerializer(homeworks, many=True)
            return Response(serializer.data)
        

class HomeworkDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]   

    def get(self, request, *args, **kwargs):
        user = self.request.user
        homework_id = self.kwargs.get('homework_id')
        classrooom_id = self.kwargs.get('classroom_id')

        if hasattr(user, 'tutor'):
              classroom = Classroom.objects.get(id=classrooom_id)
              if classroom.tutor.user == user:
                  
                  homework = HomeworkClassroomAssign.objects.get(id=homework_id)
                  serializer = HomeworksViewSerializer(homework)
                  return Response(serializer.data)
        if hasattr(user, 'student'):
            pass

class HomeworkViewSubmissions(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = self.request.user
        classroom_id = self.kwargs.get('classroom_id')
        homework_id = self.kwargs.get('assigned_homework_id')


        try:
            classroom = Classroom.objects.get(id=classroom_id)
        except Classroom.DoesNotExist:
            raise NotFound("Classroom not found")

        try:
            homework = HomeworkClassroomAssign.objects.get(id=homework_id)
        except HomeworkClassroomAssign.DoesNotExist:
            raise NotFound("Classroom not found")
        
        
        try:
            tutor = Tutor.objects.get(user=user)
            try:
                classroom.tutor = tutor
            except Tutor.DoesNotExist:
                raise exceptions.PermissionDenied("Not tutor of this classroom")
            
            homework_submissions = HomeworkSubmission.objects.filter(homework=homework)
            serializer = HomeworkViewSubmissionsSerializer(homework_submissions, many=True)
            return Response(serializer.data)
        except Tutor.DoesNotExist:
            raise exceptions.PermissionDenied("Not tutor of this classroom")


class HomeworkViewSubmission(APIView):
    def get(self, request, *args, **kwargs):
        user = self.request.user
        classroom_id = self.kwargs.get('classroom_id')
        homework_id = self.kwargs.get('assigned_homework_id')
        homework_submission_id = self.kwargs.get('submission_id')


        try:
            classroom = Classroom.objects.get(id=classroom_id)
        except Classroom.DoesNotExist:
            raise NotFound("Classroom not found")

        try:
            homework = HomeworkClassroomAssign.objects.get(id=homework_id)
        except HomeworkClassroomAssign.DoesNotExist:
            raise NotFound("Classroom not found")

        try:
            tutor = Tutor.objects.get(user=user)
            try:
                classroom.tutor = tutor
            except Tutor.DoesNotExist:
                raise exceptions.PermissionDenied("Not tutor of this classroom")
            
            try:
                homework_submission = HomeworkSubmission.objects.get(id=homework_submission_id)
            except HomeworkSubmission.DoesNotExist:
                raise NotFound("Not found such submission")
            serializer = HomeworkViewSubmissionsSerializer(homework_submission)
            return Response(serializer.data)
        except Tutor.DoesNotExist:
            raise exceptions.PermissionDenied("Not tutor of this classroom")
        
class HomeworkComment(APIView):
    def post(self, request, *args, **kwargs):
        classroom_id = self.kwargs.get('classroom_id')
        homework_id = self.kwargs.get('homework_id')
        user = self.request.user

        if hasattr(user, 'tutor'):
            classroom = Classroom.objects.get(id=classroom_id)
            if classroom.tutor.user != user:
                raise exceptions.PermissionDenied('Not tutor of this classroom')
            homework = HomeworkClassroomAssign.objects.filter(id=homework_id).first()
            if not homework:
                raise exceptions.NotFound("Not found such homework")
            tutor_content_type = ContentType.objects.get_for_model(Tutor)
            serializer = HomeworkCommentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(homework=homework, user_content_type=tutor_content_type, user_object_id=user.id)
            return Response('commented successfully')

            
        if hasattr(user, 'student'):
            pass
