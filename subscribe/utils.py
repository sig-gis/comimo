from django.core.exceptions import ObjectDoesNotExist
import logging, traceback
from datetime import datetime

from subscribe.models import SubscribeModel, ProjectsModel
from accounts.models import Profile

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


def getSubscribedRegions(user):
    try:
        user = Profile.objects.get(user=user)
        fields = ['region']
        queryset = SubscribeModel.objects.filter(user=user).values_list(*fields)
        return queryset
    except ObjectDoesNotExist as e:
        print('no row')
        return 'Error'
    except Exception as e:
        print(e)
        return 'Error'

def projectExists(email, data_date):
    user = Profile.objects.get(email=email)
    try:
        projects_model_instance = ProjectsModel.objects.get(user=user, data_date=data_date, status='active')
        return True
    except ObjectDoesNotExist as e:
        return False

# function to add entry to model
def saveProject(email, projurl, projid, data_date):
    user = Profile.objects.get(email=email)
    try:
        projects_model_instance = ProjectsModel()
        projects_model_instance.user = user
        projects_model_instance.projid = int(projid)
        projects_model_instance.projurl = projurl
        projects_model_instance.data_date = data_date
        projects_model_instance.created_date = datetime.now()
        projects_model_instance.status = 'active'
        projects_model_instance.save()
        return 'Created'
    except Exception as e:
        print(e)
        logging.getLogger("error").error(traceback.format_exc())
        return 'Error'

def archiveProject(user, region, level):
    try:
        user = Profile.objects.get(user=user)
        projects_model_instance = ProjectsModel.objects.get(user=user, data_date=data_date, status='archived')
    except Exception as e:
        return 'Error'
    projects_model_instance.delete()
    return 'Archived'

def getActiveProjects(user):
    try:
        user = Profile.objects.get(user=user)
        print(user)
        fields = ['data_date','projurl']
        queryset = ProjectsModel.objects.filter(user=user).values_list(*fields)
        return queryset
    except ObjectDoesNotExist as e:
        print('no row');
        return 'Error'
    except Exception as e:
        print(e)
        return 'Error'
