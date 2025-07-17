from django.urls import path
from .views import StudentProfileView
urlpatterns = [
    path('student/register/', StudentProfileView.as_view())
]
