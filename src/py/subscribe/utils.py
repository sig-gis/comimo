import logging
import traceback
import pytz
from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist

from subscribe.models import CronJobs, ExtractedData, ProjectsModel, SubscribeModel, UserMinesModel
from subscribe.ceohelper import deleteProject, getCollectedData, createCEOProject
from accounts.models import Profile
from api.utils import authGEE, getPointsWithin, locationInCountry

##! Note, all subscribe models take user=Profile !##


def getProfile(user):
    if (isinstance(user, Profile)):
        return user
    else:
        return Profile.objects.get(user=user)

# function to add entry to model


def projectExists(profile, dataLayer, regions):
    try:
        projects_model_instance = ProjectsModel.objects.get(
            user=profile, data_layer=dataLayer, regions=regions, status='active')
        return True, projects_model_instance.name
    except ObjectDoesNotExist as e:
        return False, 'NA'

# function to add entry to model


def saveProject(profile, projurl, projid, dataLayer, name, regions):
    try:
        new_project = ProjectsModel()
        new_project.user = profile
        new_project.projid = int(projid)
        new_project.projurl = projurl
        new_project.name = name
        new_project.regions = regions
        new_project.data_layer = dataLayer
        new_project.created_date = datetime.now()
        new_project.status = 'active'
        new_project.save()
        return 'Created'
    except Exception as e:
        print(e)
        return 'Error'


def createNewProject(user, dataLayer, name, regions):
    profile = getProfile(user)
    exists, projName = projectExists(profile, dataLayer, regions)
    if (not exists):
        authGEE()
        regions = regions.split('__')
        regions.sort()
        points = getPointsWithin(regions, dataLayer)
        number = points.size().getInfo()
        if (number > 0):
            points = points.getInfo()
            proj = createCEOProject(
                points,
                profile.email + "_" + name + "_" + dataLayer)
            if proj is not None:
                projId = proj['projectId']
                tokenKey = proj['tokenKey']
                projUrl = "/simple-collection?projectId=" + \
                    str(projId) + "&tokenKey=" + tokenKey
                if (projId and projId > 0):
                    regions = '__'.join(regions)
                    entry_added = saveProject(
                        profile, projUrl, projId, dataLayer, name, regions)
                    return {'action': entry_added, 'proj': [dataLayer, datetime.today().strftime("%Y-%m-%d"), projId, projUrl, name, regions]}
                else:
                    return {'action': 'Error', 'message': 'Error creating CEO project. Please try again later.'}
            else:
                return {'action': 'Error', 'message': 'Error with CEO Gateway. Please contact support.'}
        else:
            return {'action': 'Error', 'message': 'No mines detected within specified region(s). Subscribe to other regions, or use custom regions.'}
    else:
        return {'action': 'Error', 'message': 'Project for those regions already exists for the selected layer. It\'s name is "' + projName + '". Close that one to create another.'}


def delProject(pid):
    try:
        result = deleteProject(pid)
        if (result == 'OK'):
            return 'Archived'
        else:
            return result
    except Exception as e:
        print(e)
        return 'Error'


def getActiveProjects(user):
    try:
        profile = getProfile(user)
        fields = ['data_layer', 'projurl']
        queryset = ProjectsModel.objects.filter(
            user=profile, status='active').values_list(*fields)
        return queryset
    except ObjectDoesNotExist as e:
        print('no row')
        return 'Error'
    except Exception as e:
        print(e)
        return 'Error'


def insertCollectedData(profile, data, project):
    try:
        data_instance = ExtractedData()
        data_instance.user = profile
        data_instance.project = project
        data_instance.y = float(data[1])
        data_instance.x = float(data[2])
        data_instance.data_layer = project.data_layer
        data_instance.project_name = project.name
        data_instance.class_num = data[3]
        data_instance.class_name = data[4]
        data_instance.save()
        return 'Created'
    except Exception as e:
        print(e)
        logging.getLogger("error").error(traceback.format_exc())
        return 'Error'


def archiveProject(user, pid):
    # pid is CEO
    # user is auth_user
    # Gathers saved samples from CEO and stores them, then deletes project from CEO
    try:
        profile = getProfile(user)
        project = ProjectsModel.objects.get(
            user=profile, projid=pid, status='active')
        collectedSamples = getCollectedData(pid)
        collectedSamples = collectedSamples[1:]
        for sample in collectedSamples:
            insertCollectedData(
                profile, sample, project)
        status = delProject(pid)
        if (status == 'Archived'):
            project.status = 'archived'
            project.save()
            return {'action': 'Archived', 'message': 'Successfully imported data from CEO'}
        elif (status == 'Forbidden'):
            project.status = 'archived'
            project.save()
            return {'action': 'Archived', 'message': 'Missing CEO project'}
        else:
            return {'action': status}
    except ObjectDoesNotExist as e:
        print('no user/project')
        return {'action': 'Error', 'message': 'Project does not exist in django DB.'}
    except Exception as e:
        print(e)
        return {'action': 'Error', 'message': 'Unknown error while archiving project.'}


def saveCron(jobType, message, regions='', email=''):
    try:
        cron_jobs_instance = CronJobs()
        cron_jobs_instance.job_date = datetime.now().replace(tzinfo=pytz.UTC)
        cron_jobs_instance.job_type = jobType
        cron_jobs_instance.finish_message = message
        cron_jobs_instance.regions = regions
        cron_jobs_instance.email = email
        cron_jobs_instance.save()
        return 'Created'
    except Exception as e:
        print(e)
        logging.getLogger("error").error(traceback.format_exc())
        return 'Error'
