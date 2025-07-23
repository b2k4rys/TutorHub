from django.urls import path
from .views import HomeworkCreateView, HomeworkSubmitView, HomeworkGiveFeedback

urlpatterns = [
    path("assign/", HomeworkCreateView.as_view()),
    path('<int:homework_id>/submit/', HomeworkSubmitView.as_view()),
    path('<int:homework_id>/grade/', )
]

