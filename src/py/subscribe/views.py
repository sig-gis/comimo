from datetime import datetime
from django.shortcuts import render

from subscribe.models import ExtractedData, UserMinesModel


def requestLogin(request):
    return request


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
