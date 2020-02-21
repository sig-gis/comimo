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
        regionList = utils.getSubscribedRegions(user)
        return JsonResponse({'action':'Success','regions':regionList})

def getProjects(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request);
    else:
        queryset = utils.getActiveProjects(user)
        if queryset!='Error':
            fields = ['data_date','projurl','projid']
            projList = list(queryset.values(*fields))
            projList = [x['data_date'].strftime('%Y-%m-%d')+'__'+str(x['projid'])+'__'+x['projurl'] for x in projList]
            return JsonResponse({'action':'Success','projects':projList})
        else:
            return JsonResponse({'action':'Error', 'message':'No active projects.'})

def closeProject(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        pid = request.GET.get('pid')
        pdate = request.GET.get('pdate')
        if (pid and pdate):
            result = utils.archiveProject(user, pid, pdate)
            return JsonResponse(result)
        else:
            return JsonResponse({'action':'Error', 'message':'Make sure project id and date are supplied'})

def createProject(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        pdate = request.GET.get('pdate')
        if (pdate):
            from datetime import datetime
            pdate = datetime.strptime(pdate, "%Y-%m-%d")
            result = utils.createProject(user, pdate)
            return JsonResponse(result)
        else:
            return JsonResponse({'action':'Error', 'message':'Make sure projet date is supplied'})
