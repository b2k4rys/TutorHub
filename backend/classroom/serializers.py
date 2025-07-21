from rest_framework import serializers
from .models import Classroom
from students.models import Student
from django.contrib.auth.models import User

class ClassroomSerializer(serializers.ModelSerializer):
    # Accept usernames instead of student IDs
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
