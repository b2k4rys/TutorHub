from django.urls import path
from .views import HomeworkCreateView

urlpatterns = [
    path("/assign", HomeworkCreateView.as_view())
]

