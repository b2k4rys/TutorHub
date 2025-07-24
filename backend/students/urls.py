from django.urls import path
from .views import StudentRegisterView, StudentDetailView
urlpatterns = [
    path('student/register/', StudentRegisterView.as_view()),
    path('details/<int:student_id>/', StudentDetailView.as_view())
]
