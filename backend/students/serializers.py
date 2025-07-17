from rest_framework import serializers
from .models import StudentProfile
class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile 
        fields = ['user', 'grade', 'school_name']
        read_only_fields = ['user']

        
