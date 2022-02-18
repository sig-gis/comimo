# accounts/urls.py
from django.urls import path, include
from . import apps
from subscribe.views import downloadPredictions, downloadUserMines, getDataDates

app_name = apps.SubscribeConfig.name
urlpatterns = [
    path('download-predictions/', downloadPredictions, name='downloadPredictions'),
    path('download-user-mines/', downloadUserMines, name='downloadUserMines'),
    path('get-data-dates/', getDataDates, name='getDataDates')
]
