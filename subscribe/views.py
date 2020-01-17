from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.views.generic.base import TemplateView
from django.http import JsonResponse, HttpResponse
from . import utils


# Create your views here.
def manageSubscriptions(request):
    user = request.user
    if not(user.is_authenticated):
        return redirect('login')
    else :
        queryset = utils.getSubscribedRegions(user.email);
        context = {'rows':queryset}
        return render(request, 'manageSubscriptions.html', context=context)

# request handler to add subscriptions
def addSubs(request):
    user = request.user
    if not(user.is_authenticated):
        return redirect('login')
    else:
        email = user.email
        region = request.POST.get('region')
        subaction = utils.saveEmail(email, region)
        return JsonResponse({'email':email,'region':region,'result':subaction})
        # return render(request, 'subsUpdated.html')
