from django.urls import path
from .views import ClassroomCreateView, ClassroomView, ClassroomDetailView

urlpatterns = [
    path('register/', ClassroomCreateView.as_view()),
    path("all/", ClassroomView.as_view()),
    path('<int:classroom_id>/', ClassroomDetailView.as_view())
]
