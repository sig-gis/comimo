from datetime import datetime
from django.shortcuts import render, redirect, reverse
from django.http import JsonResponse
from django.db.models.functions import TruncMonth
from django.db.models import Count, F

from subscribe.models import ExtractedData, UserMinesModel
from subscribe.utils import archiveProject, createNewProject, delEmail, getActiveProjects, getSubscribedRegions, saveEmail, saveMine


def requestLogin(request):
    return redirect(reverse('login') + '?next=' + request.build_absolute_uri())


def reportMine(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        lat = float(request.GET.get('lat'))
        lon = float(request.GET.get('lon'))
        subaction = saveMine(user, lat, lon)
        return JsonResponse({'action': subaction})


def addSubs(request):
    # request handler to add subscriptions
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        region = request.GET.get('region')
        level = request.GET.get('level')
        subaction = saveEmail(user, region, level)
        return JsonResponse({'action': subaction, 'region': region, 'level': level})


def deleteSubs(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        region = request.GET.get('region')
        level = request.GET.get('level')
        subaction = delEmail(user, region, level)
        return JsonResponse({'action': subaction, 'region': region, 'level': level})


def getSubs(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        regionList = getSubscribedRegions(user)
        return JsonResponse({'action': 'Success', 'regions': regionList})


def getProjects(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        queryset = getActiveProjects(user)
        if queryset != 'Error':
            fields = ['data_layer', 'created_date',
                      'projurl', 'projid', 'name', 'regions']
            projList = [[x['data_layer'],
                         x['created_date'].strftime('%Y-%m-%d'),
                         x['projid'],
                         x['projurl'],
                         x['name'],
                         x['regions']] for x in list(queryset.values(*fields))]
            return JsonResponse({'action': 'Success', 'projects': projList})
        else:
            return JsonResponse({'action': 'Error', 'message': 'No active projects.'})


def closeProject(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        pid = request.GET.get('pid')  # pid is CEO id
        if (pid):
            result = archiveProject(user, pid)
            return JsonResponse(result)
        else:
            return JsonResponse({'action': 'Error', 'message': 'Make sure project id is supplied'})


def createProject(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        dataLayer = request.GET.get('dataLayer')
        name = request.GET.get('name')
        regions = request.GET.get('regions')
        if (dataLayer and name and regions):
            result = createNewProject(user, dataLayer, name, regions)
            return JsonResponse(result)
        else:
            return JsonResponse({'action': 'Error', 'message': 'Make sure projet name, date, and regions are supplied.'})


def downloadData(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        return render(request, 'download-data.html')


def downloadPredictions(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        dataLayer = request.GET.get('dataLayer')
        data = ExtractedData.objects.filter(data_layer=dataLayer) \
            .annotate(username=F('user__user__username'),
                      institution=F('user__institution'),
                      email=F('user__email'),
                      projectName=F('project_name'),
                      dataLayer=F('data_layer'),
                      className=F('class_num'),
                      classNum=F('class_name')) \
            .values('username', 'email', 'institution', 'projectName', 'x', 'y', 'dataLayer', 'className', 'classNum')
        return JsonResponse(list(data), safe=False)


def downloadUserMines(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        month = datetime.strptime(request.GET.get('month'), "%Y-%m")
        data = UserMinesModel.objects \
            .annotate(month=TruncMonth('reported_date')) \
            .values('month') \
            .filter(month=month) \
            .annotate(username=F('user__user__username'),
                      institution=F('user__institution'),
                      email=F('user__email'),
                      reportedDate=F('reported_date')) \
            .values('username', 'email', 'institution', 'x', 'y', 'reportedDate')
        return JsonResponse(list(data), safe=False)


def getDataDates(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        userCollected = UserMinesModel.objects \
            .annotate(month=TruncMonth('reported_date')) \
            .values('month') \
            .annotate(count=Count('id')) \
            .values_list('month', flat=True)
        formatted = list(map(lambda x: x.strftime("%Y-%m"),
                         list(userCollected)))
        data = ExtractedData.objects.order_by().values_list(
            'data_layer', flat=True).distinct()
        return JsonResponse({'predictions': list(data), 'userMines': formatted}, safe=False)
