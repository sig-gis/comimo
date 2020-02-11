from django.core.exceptions import ObjectDoesNotExist
import logging, traceback
from datetime import datetime

from subscribe.models import SubscribeModel
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
        print('no row');
        return 'Error'
    except Exception as e:
        print(e)
        return 'Error'
