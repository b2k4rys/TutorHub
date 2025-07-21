from django.contrib.auth.models import User
from rest_framework import serializers
from students.serializers import StudentRegisterSerializer
from tutors.serializers import TutorAddSerializer
from students.models import Student
from tutors.models import Tutor
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True, allow_blank=False)
    first_name = serializers.CharField(required=True, allow_blank=False)
    second_name = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'second_name']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class RoleBasedUserSerializer(serializers.ModelSerializer):
    user = RegisterSerializer()
    role = serializers.ChoiceField(choices=['student', 'tutor'])

    student_data = StudentRegisterSerializer(required=False)
    tutor_data = TutorAddSerializer(required=False)

    def validate(self, data):
        role = data.get('role')
        if role == 'student' and 'student_data' not in data:
            raise serializers.ValidationError("Missing student_data for student role.")
        if role == 'tutor' and 'tutor_data' not in data:
            raise serializers.ValidationError("Missing tutor_data for tutor role.")
        return data


    def create(self, validated_data):
        role = validated_data['role']
        user_data = validated_data['user']
        user = User.objects.create_user(**user_data)

        if role == 'student':
            student_data = validated_data['student_data']
            Student.objects.create(user=user, **student_data)
        elif role == 'tutor':
            tutor_data = validated_data['tutor_data']
            Tutor.objects.create(user=user, **tutor_data)

        return user




    
