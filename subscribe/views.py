from django.shortcuts import render
from django.contrib.auth import login, authenticate
from django.views.generic.base import TemplateView
from django.http import JsonResponse, HttpResponse
from . import utils


# Create your views here.
def manageSubscriptions(request):
    return render(request, 'manageSubscriptions.html')

# request handler to add subscriptions
def addSubs(request):
    email = request.POST.get('email')
    region = request.POST.get('region')
    subaction = utils.saveEmail(email, region)
    return JsonResponse({'email':email,'region':region,'result':subaction})
    # return render(request, 'subsUpdated.html')
