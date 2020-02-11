from django.shortcuts import render, redirect, reverse
from django.contrib.auth import login, authenticate
from django.views.generic.base import TemplateView
from django.http import JsonResponse, HttpResponse
from subscribe import utils

def requestLogin(request):
    return redirect(reverse('login')+'?next='+request.build_absolute_uri())

# Create your views here.
def manageSubscriptions(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request);
    else :
        queryset = utils.getSubscribedRegions(user);
        context = {'rows':queryset}
        return render(request, 'manageSubscriptions.html', context=context)

# request handler to add subscriptions
def addSubs(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request);
    else:
        region = request.GET.get('region')
        try:
            level = request.GET.get('level')
        except Exception as e:
            return JsonResponse({'action':'Error','region':region, 'level':level})
        subaction = utils.saveEmail(user, region, level)
        return JsonResponse({'action':subaction,'region':region, 'level':level})

def deleteSubs(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request);
    else:
        region = request.GET.get('region')
        try:
            level = request.GET.get('level')
        except Exception as e:
            return JsonResponse({'action':'Error','region':region, 'level':level})
        subaction = utils.delEmail(user, region, level)
        return JsonResponse({'action':subaction,'region':region, 'level':level})

def getSubs(request):
    user = request.user
    if not(user.is_authenticated):
            return requestLogin(request);
    else:
        queryset = utils.getSubscribedRegions(user)
        if queryset!='Error':
            fields = ['region','level']
            regionList = list(queryset.values(*fields))
            regionList = [x['level']+'_'+x['region'] for x in regionList]
            return JsonResponse({'action':'Success','regions':regionList})
        else:
            return JsonResponse({'action':'Error'})
