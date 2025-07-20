from django.urls import path
from .views import ClassroomAddView

urlpatterns = [
    path('classroom/new', ClassroomAddView.as_view())
]
