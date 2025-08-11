from rest_framework import serializers
from .models import HomeworkClassroomAssign, HomeworkSubmission, HomeworkComments
from django.core.validators import MaxValueValidator, MinValueValidator 
from django.utils import timezone
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from tutors.models import Tutor
class HomeworkCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeworkClassroomAssign
        fields = ['title', 'description', 'due_date', 'attachment', 'is_optional']
        read_only_fields = ['assigned_by']

    def create(self, validated_data):
        tutor = self.context['tutor'] 
        classroom = self.context['classroom']
        return HomeworkClassroomAssign.objects.create(
            assigned_by=tutor,
            classroom=classroom,
            **validated_data
        )
    
class HomeworkSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['file']
        read_only_fields = ['score', 'feedback']
        model = HomeworkSubmission
    
    def create(self, validated_data):

        student = self.context['student']
        homework = self.context['homework']
        now = timezone.now()
        try:
            if now <= homework.due_date:
                status = 'on_time'
            else:
                status = 'late_submission'
            
            return HomeworkSubmission.objects.create(
                student=student,
                homework=homework,
                status=status,
                **validated_data
            )
        except IntegrityError:
            raise ValidationError("You have already submitted this homework")
    
class HomeworkGradeSerializer(serializers.Serializer):
    score = serializers.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)])
    feedback = serializers.CharField(allow_blank=True)

    def validate(self, attrs):
        score = attrs['score']
        if score % 1 != 0:
            raise serializers.ValidationError("Grade must be a whole number")
        return attrs
    
class HomeworksViewSerializer(serializers.ModelSerializer):
    class  Meta:
        model = HomeworkClassroomAssign
        fields = ['id', 'title', 'description', 'due_date', 'attachment', 'is_optional']
    
class HomeworkViewSubmissionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeworkSubmission
        fields = ['id', 'student', 'submitted_at', 'status', 'file', 'score', 'feedback']
    
class HomeworkCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeworkComments
        read_only_fields = ['homework', 'user_content_type', 'user_object_id']
        fields = ['text']
    
class HomeworkAllCommentSerializer(serializers.ModelSerializer):

    user_type = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    class Meta:
        model = HomeworkComments
        read_only_fields = ['user', 'user_content_type', 'user_object_id']
        fields = ['username', 'user_type', 'text', 'timestamp']

    def get_user_type(self, obj):
        return obj.user.__class__.__name__
        
    def get_username(self, obj):
        return obj.user.user.username