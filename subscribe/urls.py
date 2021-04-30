# accounts/urls.py
from django.urls import path, include
from . import apps
from subscribe.views import addSubs, closeProject, createProject, deleteSubs, getProjects, getSubs

app_name = apps.SubscribeConfig.name
urlpatterns = [
    path('addsubs', addSubs, name='addsubs'),
    path('delsubs', deleteSubs, name='delsubs'),
    path('getsubs', getSubs, name='getsubs'),
    path('getprojects', getProjects, name='getprojects'),
    path('closeproject', closeProject, name='closeproject'),
    path('createproject', createProject, name='createproject')
]
