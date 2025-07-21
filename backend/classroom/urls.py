from django.urls import path
from .views import ClassroomCreateView

urlpatterns = [
    path('register/', ClassroomCreateView.as_view())
]
