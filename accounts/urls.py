# accounts/urls.py
from django.urls import path
from django.views.generic.base import TemplateView
from accounts.views import signupView, loginView, logoutView, forgotView, resetView


urlpatterns = [
    path('login/', loginView, name='login'),
    path('logout/', logoutView, name='logout'),
    path('password-forgot/', forgotView, name='forgot'),
    path('password-reset/', resetView, name='reset'),
    path('signup/', signupView, name='signup'),
]
