from django.db import models
from enum import Enum
from django.contrib.auth.models import User
from backend.students.models import StudentProfile
class ClassroomSubjects(models.TextChoices):
    math = 'MATH'
    english = 'ENGLISH'
    other = 'OTHER'

class ClassroomTypes(models.TextChoices):
    individual = 'individual'
    group = 'group'


class Classroom(models.Model):

    subject = models.CharField(
        choices=ClassroomSubjects.choices,
        default=ClassroomSubjects.other
    )
    classroom_type = models.CharField(
        choices=ClassroomTypes.choices
    )

    tutor = models.ForeignKey(User, on_delete=models.CASCADE)

    students = models.ManyToManyField(StudentProfile, on_delete=models.CASCADE, related_name='classrooms', blank=True, null=True)


