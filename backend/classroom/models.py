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


class HomeworkClassroomAssign(models.Model):

    title = models.TextField()
    description = models.TextField(blank=True)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    assigned_by = models.ForeignKey("tutors.Tutor", on_delete=models.CASCADE)
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    attachment = models.FileField(upload_to='homework_attachments/', blank=True, null=True)
    is_optional = models.BooleanField(default=False)
    def __str__(self):
        return f"{self.classroom} homework"
    

class HomeworkSubmission(models.Model):
    STATUS_CHOICES = [
        ('on_time', 'On Time'),
        ('late_submission', 'Late Submission'),
    ]


    student = models.ForeignKey("students.Student", on_delete=models.CASCADE)
    homework = models.ForeignKey(HomeworkClassroomAssign, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.TextField(choices=STATUS_CHOICES)
    file = models.FileField(upload_to='submissions/', null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)

