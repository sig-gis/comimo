"""gmw URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import TemplateView
from subscribe.views import downloadData, downloadAll, getDataDates

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('accounts.urls')),
    path('api/', include('api.urls')),
    path('subscribe/', include('subscribe.urls', namespace='subscribe')),
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('download-data/', downloadData, name='downloadData'),
    path('download-all/', downloadAll, name='downloadAll'),
    path('get-data-dates/', getDataDates, name='getDataDates'),
]
