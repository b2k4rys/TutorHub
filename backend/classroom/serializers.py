from rest_framework import serializers
from .models import Classroom
from backend.students.models import StudentProfile

class ClassroomSerializer(serializers.ModelSerializer):
    students = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=StudentProfile.objects.all(),
        required=False
    )

    class Meta:
        model = Classroom
        fields = ['subject', 'classroom_type', 'tutor', 'students']
      
        