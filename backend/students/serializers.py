from rest_framework import serializers
from .models import Student
class StudentRegisterSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Student
        fields = ['user', 'grade', 'school_name']
        read_only_fields = ['user']

        
