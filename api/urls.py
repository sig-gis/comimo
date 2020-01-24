# accounts/urls.py
from django.urls import path

from . import views


urlpatterns = [
    path('test/', views.test, name='test'),
    path('getfeaturenames/', views.getFeatureNames, name='getfeaturenames'),
    path('getfeatures/', views.getFeatures, name='getfeatures'),
    path('getimagenames/', views.getImageNames, name='getimagenames'),
    path('getsingleimage/', views.getSingleImage, name='getsingleimage'),
]
