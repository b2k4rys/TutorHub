from rest_framework import serializers
from .models import Student
class StudentRegisterSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Student
        fields = ['user', 'grade', 'school_name']
        read_only_fields = ['user']

        
class StudentTutorDetailViewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = Student
        fields = ['username', 'first_name', 'last_name', 'school_name', 'grade', 'phone', 'telegram_username']

class StudentStudentDetailViewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = Student
        fields = ['username', 'first_name', 'last_name']