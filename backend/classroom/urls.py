from django.urls import path
from .views import ClassroomCreateView, ClassroomView

urlpatterns = [
    path('register/', ClassroomCreateView.as_view()),
    path("all/", ClassroomView.as_view())
]
