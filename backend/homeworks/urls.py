from django.urls import path
from .views import HomeworkCreateView, HomeworkSubmitView, HomeworkGrade, HomeworksView, HomeworkViewSubmissions

urlpatterns = [
    path("classroom/<int:classroom_id>/assign/", HomeworkCreateView.as_view()),
    path('<int:homework_id>/submit/', HomeworkSubmitView.as_view()),
    path('<int:homework_id>/grade/', HomeworkGrade.as_view()),
    path('classroom/<int:classroom_id>/', HomeworksView.as_view()),
    path('classroom/<int:classroom_id>/<int:assigned_homework_id>', HomeworkViewSubmissions.as_view())
]

