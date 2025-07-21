from django.contrib.auth.models import User
from rest_framework import serializers
from students.serializers import StudentRegisterSerializer
from tutors.serializers import TutorAddSerializer

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True, allow_blank=False)
    first_name = serializers.CharField(required=True, allow_blank=False)
    last_name = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class RoleBasedUserSerializer(serializers.Serializer):
    user = RegisterSerializer()
    role = serializers.ChoiceField(choices=['student', 'tutor'])

    student_data = StudentRegisterSerializer(required=False)
    tutor_data = TutorAddSerializer(required=False)

    def validate(self, data):
        role = data.get('role')

        if role == 'student' and not data.get('student_data'):
            raise serializers.ValidationError("student_data is required for student role.")
        if role == 'tutor' and not data.get('tutor_data'):
            raise serializers.ValidationError("tutor_data is required for tutor role.")
        return data


    def create(self, validated_data):
        role = validated_data['role']
        user_data = validated_data['user']
        user = User.objects.create_user(**user_data)
        
        if role == 'student':
            student_data = validated_data['student_data']
            student_serializer = StudentRegisterSerializer(data=student_data)
            student_serializer.is_valid(raise_exception=True)
            student_serializer.save(user=user)

        elif role == 'tutor':
            tutor_data = validated_data['tutor_data']
            tutor_serializer = TutorAddSerializer(data=tutor_data)
            tutor_serializer.is_valid(raise_exception=True)
            tutor_serializer.save(user=user)

        return {
            "user": user,
            "role": role,
            "student_data": validated_data.get("student_data"),
            "tutor_data": validated_data.get("tutor_data"),
        }




    
