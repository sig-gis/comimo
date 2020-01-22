# accounts/urls.py
from django.urls import path

from . import views


urlpatterns = [
    path('test/', views.test, name='test'),
    path('getfeaturenames/', views.getfeaturenames, name='getfeaturenames'),
    path('getfeatures/', views.getfeatures, name='getfeatures')
]
