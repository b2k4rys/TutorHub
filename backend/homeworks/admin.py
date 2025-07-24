from django.contrib import admin
from .models import HomeworkClassroomAssign, HomeworkSubmission
# Register your models here.
admin.site.register(HomeworkSubmission)
admin.site.register(HomeworkClassroomAssign)