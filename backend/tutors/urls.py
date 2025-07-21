from django.urls import path
from .views import TutorAddView, TutorCheckStudent

urlpatterns = [
    path('register/', TutorAddView.as_view()),
    path('check/', TutorCheckStudent.as_view())   
]
