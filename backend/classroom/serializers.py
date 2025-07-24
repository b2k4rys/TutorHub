from rest_framework import serializers
from .models import Classroom
from students.models import Student


class ClassroomSerializer(serializers.ModelSerializer):

    student_usernames = serializers.ListField(
        child=serializers.CharField(),
        write_only=True
    )

    students = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Student.objects.all(),
    )

    class Meta:
        model = Classroom
        fields = ['subject', 'classroom_type', 'tutor', 'student_usernames', 'students']
        read_only_fields = ['tutor']
        
    def create(self, validated_data):
        student_usernames = validated_data.pop("student_usernames")
        validated_data.pop("students", None)  

        students = Student.objects.filter(user__username__in=student_usernames)

        if len(students) != len(student_usernames):
            found_usernames = [s.user.username for s in students]
            missing = set(student_usernames) - set(found_usernames)
            raise serializers.ValidationError({
                "student_usernames": f"These usernames were not found: {', '.join(missing)}"
            })

        classroom = Classroom.objects.create(**validated_data)
        classroom.students.set(students)
        return classroom

class StudentClassroomDetailSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = Student
        fields = ['id', 'username', 'first_name', 'last_name']

class TutorClassroomDetailSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = Student
        fields = ['id', 'username', 'first_name', 'last_name']

class ClassroomDetailSerializer(serializers.ModelSerializer):
    students = StudentClassroomDetailSerializer(many=True)
    tutor = TutorClassroomDetailSerializer()
    class Meta:
        model = Classroom
        fields = ['id', 'subject', 'classroom_type', 'students', 'tutor']