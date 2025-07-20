from rest_framework import serializers
from .models import Classroom
from students.models import StudentProfile

class ClassroomSerializer(serializers.ModelSerializer):
    students = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=StudentProfile.objects.all(),
        required=True
    )

    class Meta:
        model = Classroom
        fields = ['subject', 'classroom_type', 'tutor', 'students']
        read_only_fields = ['tutor']
      
        