import pytz
from datetime import datetime, timedelta
from django.db.models import Aggregate, CharField

from subscribe.mailhelper import sendAlertMail
from subscribe.models import SubscribeModel, ProjectsModel
from subscribe.utils import archiveProject, createNewProject, saveCron
from api.utils import authGEE, getImageList


class RegionConcat(Aggregate):
    template = """GROUP_CONCAT(level || '_' || region, '__')"""

    def __init__(self, expression, **extra):
        super(RegionConcat, self).__init__(
            expression,
            output_field=CharField(),
            **extra
        )


def sendGoldAlerts():
    jobCode = 'Auto alerts'
    try:
        authGEE()
        imgList = list(filter(lambda x: x[-1] == "P", getImageList()))
        latest_image = imgList[0]
        latest_date = datetime.strptime(
            latest_image[:-2], "%Y-%m-%d").replace(tzinfo=pytz.UTC)
        users = SubscribeModel.objects.all() \
            .values('user__email', 'user__default_lang', 'user__user_id', 'user') \
            .filter(last_alert_for__lt=latest_date) \
            .annotate(regions=RegionConcat('level'))
        for alertable in iter(users):
            try:
                email = alertable['user__email']
                lang = alertable['user__default_lang']
                userId = alertable['user__user_id']
                profileId = alertable['user']
                regions = alertable['regions']
                # createNewProject uses auth-user
                proj_created = createNewProject(
                    userId,
                    latest_image,
                    'Alerta' if lang == "es" else 'Alert',
                    regions)
                if (proj_created['action'] == "Created"):
                    sendAlertMail(email,
                                  proj_created['proj'][3],
                                  lang)
                    saveCron(jobCode,
                             'Success: Mail sent to ' + email,
                             regions,
                             email)
                    SubscribeModel.objects.filter(user=profileId).update(
                        last_alert_for=latest_date)
                elif (proj_created['action'] == "Error"):
                    saveCron(jobCode,
                             'Error: ' + proj_created['message'],
                             regions,
                             email)
                else:
                    saveCron(jobCode,
                             'Error: Unknown cron error.',
                             regions,
                             email)
            except Exception as ee:
                print('Error: {0}'.format(ee))
                saveCron(jobCode, 'Error: {0}'.format(ee))
        saveCron(jobCode, 'Email alert job complete.')
    except Exception as e:
        print("OS error: {0}".format(e))
        saveCron(jobCode, 'Error: {0}'.format(e))


def cleanStaleProjects():
    jobCode = 'Close 30 day projects'
    try:
        bardate = datetime.now() + timedelta(days=-30)
        staleprojects = list(ProjectsModel.objects.filter(
            status='active', created_date__lt=bardate)
            .values('user__user_id', 'projid'))
        for project in staleprojects:
            userId = project['user__user_id']
            projId = project['projid']
            result = archiveProject(userId, projId)
            saveCron(jobCode,
                     result['action'] + " " + str(projId) + ": " + result['message'])
    except Exception as e:
        print(e)
        saveCron(jobCode, 'Error: {0}'.format(e))
