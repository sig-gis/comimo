from django.core.exceptions import ObjectDoesNotExist
import logging, traceback
from datetime import datetime

from subscribe.models import SubscribeModel, ProjectsModel, ExtractedData
from subscribe.ceohelper import getProjectInfo, deleteProject, getCollectedData, getCeoProjectURL
from subscribe.mailhelper import sendmail
from accounts.models import Profile

from api import utils as apiutils

# function to add entry to model
def saveEmail(user, region, level):
    try:
        user = Profile.objects.get(user=user)
        subscribe_model_instance = SubscribeModel.objects.get(user=user, region=region, level=level)
        return 'Exists'
    except ObjectDoesNotExist as e:
        subscribe_model_instance = SubscribeModel()
        subscribe_model_instance.user = user
        subscribe_model_instance.region = region
        subscribe_model_instance.level = level
        subscribe_model_instance.last_alert_for = datetime.now()
        subscribe_model_instance.mail_count = 0
        subscribe_model_instance.created_date = datetime.now()
        subscribe_model_instance.updated_date = datetime.now()
        subscribe_model_instance.save()
        return 'Created'
    except Exception as e:
        logging.getLogger("error").error(traceback.format_exc())
        return 'Error'


def delEmail(user, region, level):
    try:
        user = Profile.objects.get(user=user)
        subscribe_model_instance = SubscribeModel.objects.get(user=user, region=region, level=level)
    except Exception as e:
        return 'Error'
    subscribe_model_instance.delete()
    return 'Deleted'

def projectExists(user, data_date, regions):
    try:
        projects_model_instance = ProjectsModel.objects.get(user=user, data_date=data_date, regions=regions, status='active')
        return True, projects_model_instance.name
    except ObjectDoesNotExist as e:
        return False, 'NA'

# function to add entry to model
def saveProject(email, projurl, projid, data_date, name, regions):
    user = Profile.objects.get(email=email)
    try:
        projects_model_instance = ProjectsModel()
        projects_model_instance.user = user
        projects_model_instance.projid = int(projid)
        projects_model_instance.projurl = projurl
        projects_model_instance.name = name
        projects_model_instance.regions = regions
        projects_model_instance.data_date = data_date
        projects_model_instance.created_date = datetime.now()
        projects_model_instance.status = 'active'
        projects_model_instance.save()
        return 'Created'
    except Exception as e:
        print(e)
        logging.getLogger("error").error(traceback.format_exc())
        return 'Error'


def getSubscribedRegions(user):
    if (not isinstance(user, Profile)):
        user = Profile.objects.get(user=user)
    try:
        subscribe_instances = SubscribeModel.objects.all().filter(user=user)
        sub_list = []
        for instance in iter(subscribe_instances):
            region = instance.region
            level = instance.level
            sub_list.append(level+'_'+region)
        return sub_list
    except Exception as e:
        print(e)
        return 'Error'

def createProject(user, data_date, name, regions):
    user = Profile.objects.get(user=user)
    exists, ename = projectExists(user, data_date, regions)
    if (not exists):
        apiutils.authGEE()
        regions = regions.split('__')
        regions.sort()
        points = apiutils.getPointsWithin(regions,data_date)
        number = points.size().getInfo()
        if (number > 0):
            points = points.getInfo()
            proj = getCeoProjectURL(points,data_date,user.email,name)
            projid = proj['projectId']
            projurl = proj['ceoCollectionUrl']
            if (projurl and projurl != ""):
                regions = '__'.join(regions)
                entry_added = saveProject(user.email, projurl, projid, data_date, name, regions)
                return {'action':entry_added, 'proj':[data_date.strftime('%Y-%m-%d'),datetime.today().strftime("%Y-%m-%d"),projid,projurl,name,regions]}
            else:
                return {'action':'Error', 'message':'Error creating CEO project. Please try again later.'}
        else:
            return {'action':'Error', 'message':'No mines detected within your subscribed region! Maybe subscribe to other regions.'}
    else:
        return {'action':'Error', 'message':'Project for those regions already exists for the day! It\'s name is "'+ename+'". Close that one to create another.'}

def delProject(user, pid):
    try:
        result = deleteProject(pid)
        print(result)
        if (result == 'OK'):
            return 'Archived'
        else:
            return 'Error-'+result
    except Exception as e:
        print(e)
        return 'Error'


def getActiveProjects(user):
    try:
        user = Profile.objects.get(user=user)
        fields = ['data_date','projurl']
        queryset = ProjectsModel.objects.filter(user=user,status='active').values_list(*fields)
        return queryset
    except ObjectDoesNotExist as e:
        print('no row')
        return 'Error'
    except Exception as e:
        print(e)
        return 'Error'

def insertCollectedData(data, user, date):
    try:
        data_instance = ExtractedData()
        data_instance.user = user
        data_instance.y =float(data[1])
        data_instance.x =float(data[2])
        data_instance.data_date = date
        data_instance.class_num = data[3]
        data_instance.class_name = data[4]
        data_instance.save()
        return 'Created'
    except Exception as e:
        print(e)
        logging.getLogger("error").error(traceback.format_exc())
        return 'Error'

def archiveProject(user, pid, pdate):
    try:
        user = Profile.objects.get(user=user)
        project = ProjectsModel.objects.get(user=user,projid=pid,status='active')
        collectedSamples =  getCollectedData(pid)
        collectedSamples =  collectedSamples[1:]
        for sample in collectedSamples:
            insertCollectedData(sample, user, pdate)
        status = delProject(user, pid)
        if (status == 'Archived'):
            project.status='archived'
            project.save()
        return {'action':status}
    except ObjectDoesNotExist as e:
        print('no user/project')
        return {'action':'Error','message':'Project does not exist!'}
    except Exception as e:
        print(e)
        return {'action':'Error', 'message':'Something went wrong!'}
