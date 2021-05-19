# accounts/urls.py
from django.urls import path
from accounts.views import registerView, loginView, logoutView, forgotView, resetView, verifyUserView, userAccountView


urlpatterns = [
    path('login/', loginView, name='login'),
    path('logout/', logoutView, name='logout'),
    path('password-forgot/', forgotView, name='forgot'),
    path('password-reset/', resetView, name='reset'),
    path('register/', registerView, name='register'),
    path('user-account/', userAccountView, name='register'),
    path('verify-user/', verifyUserView, name='verify-user'),
]
