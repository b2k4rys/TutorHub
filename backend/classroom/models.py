from django.db import models
from django.contrib.auth.models import User
from students.models import Student

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

    tutor = models.ForeignKey("tutors.Tutor", on_delete=models.CASCADE)
    students = models.ManyToManyField(Student, related_name='classrooms', blank=True, null=True)

    def __str__(self):
        return f"{self.tutor} class"
    
    def save(self, *args, **kwargs):
        from tutors.models import Tutor
        if not isinstance(self.tutor, Tutor):
            raise ValueError("Only tutors can be assigned to classrooms.")
        super().save(*args, **kwargs)





