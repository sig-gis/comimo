from django.shortcuts import render, redirect, reverse
from django.contrib.auth import login, authenticate
from django.http import JsonResponse
from subscribe.utils import archiveProject, createNewProject, delEmail, getActiveProjects, getSubscribedRegions, saveEmail


def requestLogin(request):
    return redirect(reverse('login-js') + '?next=' + request.build_absolute_uri())


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
        return render(request, 'download-all.html')


def downloadAllInCSV(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        from subscribe.models import ExtractedData
        from accounts.models import Profile
        date = request.GET.get('date')
        data = ExtractedData.objects.filter(
            data_layer=date).values()
        user = Profile.objects.get(user=user)
        d = []
        for point in iter(data):
            try:
                username = Profile.objects.get(
                    id=point['user_id']).user.username
            except Exception as e:
                username = 'N/A'
            temp = {
                'username': username,
                'y': point['y'],
                'x': point['x'],
                'dataLayer': point['data_layer'],
                'classNum': point['class_num'],
                'className': point['class_name'],
            }
            d.append(temp)
        return JsonResponse(d, safe=False)


def getDataDates(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        from subscribe.models import ExtractedData
        data = ExtractedData.objects.order_by().values_list(
            'data_layer', flat=True).distinct()
        list = []
        for d in data:
            list.append(d)
        return JsonResponse(list, safe=False)
