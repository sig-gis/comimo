# accounts/urls.py
from django.urls import path

from . import views


urlpatterns = [
    path('signup/', views.signupView, name='signup'),
]
