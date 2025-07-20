from django.db import models
from backend.classroom.models import ClassroomSubjects
from django.contrib.auth.models import User
# Create your models here.

class Tutor(models.Model):

    user = models.OneToOneField(to=User, on_delete=models.CASCADE)
    subject = models.CharField(choices=ClassroomSubjects.choices)
    description = models.TextField()


