from rest_framework import serializers
from .models import HomeworkClassroomAssign, HomeworkSubmission
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