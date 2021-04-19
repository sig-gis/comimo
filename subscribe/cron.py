from django.db.models import Min, Max
from subscribe.models import SubscribeModel, ProjectsModel
from subscribe.utils import saveProject, projectExists, saveCron
from accounts.models import Profile
import os
import json
import datetime
import pytz
from api.utils import authGEE, getLatestImage, getShape, reduceRegion, getPointsWithin
from api.config import *

from subscribe.mailhelper import sendmail
from subscribe.ceohelper import getCeoProjectURL
from subscribe import utils as subutils


def safeGetEmailRegions(user):
    try:
        email = Profile.objects.filter(user=user).values().first()['email']
        regions = '__'.join(subutils.getSubscribedRegions(user))
        return email, regions
    except Exception as e:
        return None, None


def sendGoldAlerts():
    jobCode = 'gmw.cronalerts'
    try:
        authGEE()
        latest_image, latest_date = getLatestImage()
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        users = SubscribeModel.objects.all() \
            .values('user__user_id', 'user') \
            .filter(last_alert_for__lt=latest_date) \
            .annotate(alert=Min('last_alert_for'))
        for alertable in iter(users):
            print(alertable)
            try:
                user = alertable['user__user_id']
                email, regions = safeGetEmailRegions(user)
                print(regions)
                if regions and email:
                    proj_created = subutils.createProject(
                        user, latest_date, 'Alert-for-'+today, regions)
                    if (proj_created['action'] == "Created"):
                        sendmail('mspencer@sig-gis.com',
                                 proj_created['proj'][3])
                        print('mail sent to ', email)
                        SubscribeModel.objects.filter(user=alertable['user']).update(
                            last_alert_for=latest_date)
                    elif (proj_created['action'] == "Error"):
                        saveCron(jobCode, 'Error: ' + proj_created['message'])
                    else:
                        saveCron(jobCode, 'Error: Unknown cron error.')
            except Exception as ee:
                print('Error: {0}'.format(ee))
                saveCron(jobCode, 'Error: {0}'.format(ee))
        saveCron(jobCode, 'Completed Successfully')
    except Exception as e:
        print("OS error: {0}".format(e))
        saveCron(jobCode, 'Error: {0}'.format(e))


def cleanStaleProjects():
    jobCode = 'gmw.cleanstaleprojects'
    try:
        import datetime
        fields = ['user', 'projid', 'data_date']
        bardate = datetime.datetime.now() + datetime.timedelta(days=-15)
        staleprojects = list(ProjectsModel.objects.filter(
            status='active', created_date__lt=bardate).values_list(*fields))
        for project in staleprojects:
            result = subutils.archiveProject(
                project[0], str(project[1]), project[2])
            print(result)
        saveCron(jobCode, 'Completed Successfully')
    except Exception as e:
        print(e)
        saveCron(jobCode, 'Error: {0}'.format(e))


def cleanCorruptProjects():
    code = 'gmw.cleancorruptprojects'
    try:
        import datetime
        fields = ['user', 'name', 'data_date', 'projurl']
        corruptProjects = ProjectsModel.objects.filter(projurl='')
        corruptProjects.delete()
        saveCron(jobCode, 'Completed Successfully')
    except Exception as e:
        print(e)
        saveCron(jobCode, 'Error: {0}'.format(e))
