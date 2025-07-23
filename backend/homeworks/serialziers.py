from rest_framework import serializers
from .models import HomeworkClassroomAssign, HomeworkSubmission
from django.core.validators import MaxValueValidator, MinValueValidator 
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
    
    def create(self, validated_data):
        student = self.context['student']
        if self.submitted_at <= self.homework.due_date:
            self.status = 'on_time'
        else:
            self.status = 'late_submission'
        return HomeworkSubmission.objects.create(
            student=student,
            **validated_data
        )
    
class HomeworkGradeSerializer(serializers.Serializer):
    score = serializers.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)])
    feedback = serializers.CharField(allow_blank=True)

    def validate(self, attrs):
        score = attrs['grade']
        if score % 1 != 0:
            raise serializers.ValidationError("Grade must be a whole number")
        return attrs
    