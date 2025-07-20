from django.urls import path
from .views import StudentProfileRegisterView
urlpatterns = [
    path('student/register/', StudentProfileRegisterView.as_view())
]
