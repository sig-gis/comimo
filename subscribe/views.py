from django.shortcuts import render, redirect, reverse
from django.contrib.auth import login, authenticate
from django.views.generic.base import TemplateView
from django.http import JsonResponse, HttpResponse
from django.core import serializers
from subscribe import utils

def requestLogin(request):
    return redirect(reverse('login')+'?next='+request.build_absolute_uri())

# Create your views here.
def manageSubscriptions(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else :
        queryset = utils.getSubscribedRegions(user)
        context = {'rows':queryset}
        return render(request, 'manageSubscriptions.html', context=context)

# request handler to add subscriptions
def addSubs(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
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
        return requestLogin(request)
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
            return requestLogin(request)
    else:
        regionList = utils.getSubscribedRegions(user)
        return JsonResponse({'action':'Success','regions':regionList})

def getProjects(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        queryset = utils.getActiveProjects(user)
        if queryset!='Error':
            fields = ['data_date','created_date','projurl','projid','name','regions']
            projList = list(queryset.values(*fields))
            projList = [[x['data_date'].strftime('%Y-%m-%d'), x['created_date'].strftime('%Y-%m-%d'), x['projid'], x['projurl'], x['name'], x['regions']] for x in projList]
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
        name = request.GET.get('name')
        regions = request.GET.get('regions')
        if (pdate):
            from datetime import datetime
            import pytz
            pdate = datetime.strptime(pdate, "%Y-%m-%d").replace(tzinfo=pytz.UTC)
            result = utils.createProject(user, pdate, name, regions)
            return JsonResponse(result)
        else:
            return JsonResponse({'action':'Error', 'message':'Make sure projet date is supplied'})

def downloadData(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        return render(request, 'dlData.html')

def downloadAllInCSV(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        from subscribe.models import ExtractedData
        from accounts.models import Profile
        date = request.GET.get('date')
        data = ExtractedData.objects.filter(data_date__startswith=date).values()
        user = Profile.objects.get(user=user)
        d = []
        for point in iter(data):
            try:
                prof = Profile.objects.get(user=point['user_id'])
                id = str(prof.user)
            except Exception as e:
                id = 'N/A'
            temp = {}
            temp['id'] = id
            temp['y'] = point['y']
            temp['x'] = point['x']
            temp['dataDate'] = point['data_date']
            temp['classNum'] = point['class_num']
            temp['className'] = point['class_name']
            d.append(temp)
        context = {'data':d}
        return JsonResponse(d, safe=False)

def getDataDates(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        from subscribe.models import ExtractedData
        data = ExtractedData.objects.order_by().values_list('data_date',flat=True).distinct()
        list = []
        for d in data:
            list.append(d)
        return JsonResponse(list, safe=False)

        # return render(request, 'dlData.html')

# def downloadAllInCSV1(request):
#     user = request.user
#     if not(user.is_authenticated):
#         return requestLogin(request)
#     else:
#         from subscribe.models import ExtractedData
#         from accounts.models import Profile
#         import csv
#         output = []
#         response = HttpResponse (content_type='text/csv')
#         writer = csv.writer(response)
#         writer.writerow(['id','y','x','data_date','class_num','class_name'])
#
#         data = ExtractedData.objects.all().values()[:10]
#         user = Profile.objects.get(user=user)
#         for point in iter(data):
#             try:
#                 prof = Profile.objects.get(user=point['user_id'])
#                 id = prof.user
#             except Exception as e:
#                 id = 'N/A'
#             output.append([prof.user,point['y'],point['x'],point['data_date'],point['class_num'],point['class_name']])
#         writer.writerows(output)
#         return response
#         # import os
#         # import datetime
#         # dlbase = "static"
#         # dlfolder = "/csv"
#         # if (not os.path.exists(dlbase+dlfolder)):
#         #     os.mkdir(dlbase+dlfolder)
#         # now = datetime.datetime.now()
#         # format = "%Y_%m_%dT%H_%M_%S"
#         # csv = now.strftime(format)+".csv"
#
#         # csv = os.listdir(dlbbase+dlfolder)
#         # dd = datetime.datetime.strptime(d,"%Y_%m_%dT%H_%M_%S")
#         print(dd)
#         return JsonResponse({"action":"success","file":csv})
