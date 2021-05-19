from django.shortcuts import render, redirect
from accounts.models import Profile

from django.http import JsonResponse, HttpResponse
from accounts.utils import getUserInfo


def homeView(request):
    return render(request, "home.html", getUserInfo(request.user))
