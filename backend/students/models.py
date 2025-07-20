from django.db import models
from django.contrib.auth.models import User
from backend.classroom.models import Classroom
# Create your models here.

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    grade = models.IntegerField()
    school_name = models.CharField(max_length=100)

    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='students', blank=True, null=True)


    def __str__(self):
        return f"Student {self.user.first_name}"
    

