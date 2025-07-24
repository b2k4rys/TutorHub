from rest_framework import serializers
from .models import HomeworkClassroomAssign, HomeworkSubmission
from django.core.validators import MaxValueValidator, MinValueValidator 
from django.utils import timezone
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError
class HomeworkCreateSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['title', 'description', 'due_date', 'attachment', 'is_optional']
        read_only_fields = ['assigned_by']

    def create(self, validated_data):
        tutor = self.context['tutor'] 
        return HomeworkClassroomAssign.objects.create(
            assigned_by=tutor,
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
    