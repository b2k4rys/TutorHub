from django.urls import path
from .views import HomeworkCreateView, HomeworkSubmitView, HomeworkGrade

urlpatterns = [
    path("assign/", HomeworkCreateView.as_view()),
    path('<int:homework_id>/submit/', HomeworkSubmitView.as_view()),
    path('<int:homework_id>/grade/', HomeworkGrade.as_view())
]

