from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
# Create your models here.
phone_validator = RegexValidator(
    regex=r'^\+?\d{10,15}$',
    message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
)

telegram_validator = RegexValidator(
    regex=r'^@[a-zA-Z][a-zA-Z0-9_]{4,31}$',
    message='Enter your telegram username'
)
class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    grade = models.IntegerField()
    school_name = models.CharField(max_length=100)
    phone = models.CharField(validators=[phone_validator], max_length=17, blank=True)
    telegram_username = models.CharField(validators=[telegram_validator], max_length=32, blank=True)


    def __str__(self):
        return f"Student {self.user.first_name}"
    
    
    

