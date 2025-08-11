from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
# Create your models here.
class HomeworkClassroomAssign(models.Model):

    title = models.TextField()
    description = models.TextField(blank=True)
    classroom = models.ForeignKey("classroom.Classroom", on_delete=models.CASCADE)
    assigned_by = models.ForeignKey("tutors.Tutor", on_delete=models.CASCADE)
    due_date = models.DateTimeField()
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

    def __str__(self):
        return f"{self.student.user.username}'s homework ({self.homework})"
    
    class Meta:
        constraints = [models.UniqueConstraint(fields=['student', 'homework'], name='unique_student_homework')]

class HomeworkComments(models.Model):
    homework = models.ForeignKey(HomeworkClassroomAssign, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    text = models.TextField()
    user_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    user_object_id = models.PositiveIntegerField()
    user = GenericForeignKey('user_content_type', 'user_object_id')
    