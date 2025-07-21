from django.urls import path
from .views import StudentRegisterView
urlpatterns = [
    path('student/register/', StudentRegisterView.as_view())
]
