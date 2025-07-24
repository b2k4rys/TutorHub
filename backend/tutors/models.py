from django.db import models
from classroom.models import ClassroomSubjects
from django.contrib.auth.models import User
from students.models import phone_validator, telegram_validator
class Tutor(models.Model):

    user = models.OneToOneField(to=User, on_delete=models.CASCADE)
    subject = models.CharField(choices=ClassroomSubjects.choices)
    description = models.TextField()
    phone = models.CharField(validators=[phone_validator], max_length=17, blank=True)
    telegram_username = models.CharField(validators=[telegram_validator], max_length=32, blank=True)
    def __str__(self):
        return f"{self.user.first_name if self.user.first_name else self.user.username} tutor"


