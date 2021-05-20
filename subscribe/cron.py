import os
import pytz
from datetime import datetime, timedelta
from django.db.models import Min
from subscribe.mailhelper import sendAlertMail
from subscribe.models import SubscribeModel, ProjectsModel
from subscribe.utils import archiveProject, createNewProject, getSubscribedRegions, saveCron
from accounts.models import Profile
from api.utils import authGEE, getImageList


def safeGetUserInfo(user):
    try:
        profile = Profile.objects.filter(user=user).values().first()
        regions = '__'.join(getSubscribedRegions(user))
        return profile['email'], profile['default_lang'], regions
    except Exception as e:
        return None, None


def sendGoldAlerts():
    jobCode = 'Auto alerts'
    try:
        authGEE()
        imgList = list(filter(lambda x: x[-1] == "P", getImageList()))
        latest_image = imgList[0]
        latest_date = datetime.strptime(
            latest_image[:-2], "%Y-%m-%d").replace(tzinfo=pytz.UTC)
        users = SubscribeModel.objects.all() \
            .values('user__user_id', 'user') \
            .filter(last_alert_for__lt=latest_date) \
            .annotate(alert=Min('last_alert_for'))
        for alertable in iter(users):
            print(alertable)
            try:
                # createNewProject uses auth-user
                user = alertable['user__user_id']
                # alertable['user'] should already be profile-user
                email, lang, regions = safeGetUserInfo(user)
                if regions and email:
                    proj_created = createNewProject(
                        user, latest_image, 'Alerta', regions)
                    if (proj_created['action'] == "Created"):
                        sendAlertMail('mspencer@sig-gis.com',
                                      proj_created['proj'][3],
                                      lang)
                        saveCron(jobCode,
                                 'Success: Mail sent to ' + email,
                                 regions)
                        SubscribeModel.objects.filter(user=alertable['user']).update(
                            last_alert_for=latest_date)
                    elif (proj_created['action'] == "Error"):
                        saveCron(jobCode,
                                 'Error: ' + proj_created['message'],
                                 regions)
                    else:
                        saveCron(jobCode, 'Error: Unknown cron error.', regions)
            except Exception as ee:
                print('Error: {0}'.format(ee))
                saveCron(jobCode, 'Error: {0}'.format(ee))
        saveCron(jobCode, 'Completed Successfully')
    except Exception as e:
        print("OS error: {0}".format(e))
        saveCron(jobCode, 'Error: {0}'.format(e))


def cleanStaleProjects():
    jobCode = 'Close 30 day projects'
    try:
        fields = ['user__user_id', 'projid', 'name']
        bardate = datetime.now() + timedelta(days=-30)
        staleprojects = list(ProjectsModel.objects.filter(
            status='active', created_date__lt=bardate)
            .values_list(*fields))
        for project in staleprojects:
            print(project)
            result = archiveProject(project[0], project[1])
            print(result)
            saveCron(jobCode,
                     result['action'] + " " + str(project[1]) + ": " + result['message'])
    except Exception as e:
        print(e)
        saveCron(jobCode, 'Error: {0}'.format(e))


def cleanCorruptProjects():
    jobCode = 'gmw.cleancorruptprojects'
    try:
        corruptProjects = ProjectsModel.objects.filter(projurl='')
        corruptProjects.delete()
        saveCron(jobCode, 'Completed Successfully')
    except Exception as e:
        print(e)
        saveCron(jobCode, 'Error: {0}'.format(e))
