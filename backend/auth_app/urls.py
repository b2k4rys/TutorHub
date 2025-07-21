from django.urls import path
from .views import RegisterView, MeView, RequestDataView, RoleBasedRegistrationView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
urlpatterns = [
    path('user/register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('request_data/', RequestDataView.as_view()),
    path('register/', RoleBasedRegistrationView.as_view())
]