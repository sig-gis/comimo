from django.shortcuts import render, redirect
from accounts.models import Profile

from django.http import JsonResponse, HttpResponse


def getDefaultLang(user):
    try:
        return Profile.objects.filter(user=user).values().first()['default_lang']
    except Exception as e:
        return None


def homeView(request):
    return render(request,
                  "home.html",
                  {'defaultLang': getDefaultLang(request.user)})
