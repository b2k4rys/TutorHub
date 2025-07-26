from django.urls import path
from .views import TutorAddView, TutorCheckStudent, TutorDetailView, TutorAllStudentsView

urlpatterns = [
    path('register/', TutorAddView.as_view()),
    path('check/', TutorCheckStudent.as_view()) ,
    path('details/<int:tutor_id>/', TutorDetailView.as_view()),

    # VIEW ALL STUDENTS - (v0 integrate frontend)
    path('students/all/', TutorAllStudentsView.as_view(), name='Get all tutor students')
]
