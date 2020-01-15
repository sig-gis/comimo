# accounts/urls.py
from django.urls import path, include

from . import views
from . import apps

app_name = apps.SubscribeConfig.name
urlpatterns = [
    path('', views.manageSubscriptions, name='manage_subscriptions '),
    path('addsubs/', views.addSubs, name='addsubs')
]
