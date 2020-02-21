# accounts/urls.py
from django.urls import path, include

from . import views
from . import apps

app_name = apps.SubscribeConfig.name
urlpatterns = [
    path('', views.manageSubscriptions, name='managesubs'),
    path('addsubs/', views.addSubs, name='addsubs'),
    path('delsubs/', views.deleteSubs, name='delsubs'),
    path('getsubs/', views.getSubs, name='getsubs'),
    path('getprojects/', views.getProjects, name='getprojects'),
    path('closeproject/', views.closeProject, name='closeproject'),
    path('createproject/', views.createProject, name='createproject')
]
