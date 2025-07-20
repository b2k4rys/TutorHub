from django.urls import path
from .views import TutorAddView

urlpatterns = [
    path('register/', TutorAddView.as_view())    
]
