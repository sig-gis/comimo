# accounts/urls.py
from django.urls import path
from django.views.generic.base import TemplateView
from accounts.views import signupView, loginView


urlpatterns = [
    path('login/', loginView, name='login-js'),
    path('signup/', signupView, name='signup'),
]
