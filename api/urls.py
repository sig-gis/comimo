# accounts/urls.py
from django.urls import path

from . import views


urlpatterns = [
    path('getfeaturenames/', views.getFeatureNames, name='getfeaturenames'),
    path('getfeatures/', views.getFeatures, name='getfeatures'),
    path('getimagenames/', views.getImageNames, name='getimagenames'),
    path('getsingleimage/', views.getSingleImage, name='getsingleimage'),
    path('getcompositeimage/', views.getCompositeImage, name='getcompositeimage'),
    path('getgeetiles/', views.getGEETiles, name='getgeetiles'),
    path('getlegalmines/', views.getLegalMines, name='getlegalmines'),
    path('getmunicipallayer/', views.getMunicipalLayer, name='getmunicipallayer'),
    path('getcascadingnames/', views.getCascadingFeatureNames, name='getcascadingnames'),
    path('getdownloadurl/', views.getDownloadURL, name='getdownloadurl'),
    path('getareapredicted/', views.getAreaPredicted, name='getareapredicted'),
    path('getareats/', views.getAreaPredictedTS, name='getareats'),
]
