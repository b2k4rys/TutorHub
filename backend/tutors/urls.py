from django.urls import path
from .views import TutorAddView, TutorCheckStudent, TutorDetailView

urlpatterns = [
    path('register/', TutorAddView.as_view()),
    path('check/', TutorCheckStudent.as_view()) ,
    path('details/<int:tutor_id>/', TutorDetailView.as_view())  
]
