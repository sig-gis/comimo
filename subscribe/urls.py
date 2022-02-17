# accounts/urls.py
from django.urls import path, include
from . import apps
from subscribe.views import addSubs, closeProject, createProject, deleteSubs, \
    downloadPredictions, downloadUserMines, getDataDates, getProjects, getSubs, reportMine

app_name = apps.SubscribeConfig.name
urlpatterns = [
    path('report-mine', reportMine, name='report-mine'),
    path('getprojects', getProjects, name='getprojects'),
    path('closeproject', closeProject, name='closeproject'),
    path('createproject', createProject, name='createproject'),
    path('download-predictions/', downloadPredictions, name='downloadPredictions'),
    path('download-user-mines/', downloadUserMines, name='downloadUserMines'),
    path('get-data-dates/', getDataDates, name='getDataDates')
]
