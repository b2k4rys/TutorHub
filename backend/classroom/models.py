from django.db import models
from enum import Enum

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



