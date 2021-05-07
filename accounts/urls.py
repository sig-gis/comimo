# accounts/urls.py
from django.urls import path
from accounts.views import registerView, loginView, logoutView, forgotView, resetView


urlpatterns = [
    path('login/', loginView, name='login'),
    path('logout/', logoutView, name='logout'),
    path('password-forgot/', forgotView, name='forgot'),
    path('password-reset/', resetView, name='reset'),
    path('register/', registerView, name='register'),
]
