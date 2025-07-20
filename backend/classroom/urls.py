from django.urls import path
from .views import ClassroomAddView

urlpatterns = [
    path('register/', ClassroomAddView.as_view())
]
