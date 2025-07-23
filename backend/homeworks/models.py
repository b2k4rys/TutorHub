from django.db import models

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