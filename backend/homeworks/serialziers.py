from rest_framework import serializers
from .models import HomeworkClassroomAssign
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