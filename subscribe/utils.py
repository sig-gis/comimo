from django.core.exceptions import ObjectDoesNotExist
import logging, traceback
from datetime import datetime

from .models import SubscribeModel

# function to add entry to model
def saveEmail(email, region):
    try:
        subscribe_model_instance = SubscribeModel.objects.get(email=email, region=region)
        return 'Exists'
    except ObjectDoesNotExist as e:
        subscribe_model_instance = SubscribeModel()
        subscribe_model_instance.email = email
        subscribe_model_instance.region = region
        subscribe_model_instance.last_alert_for = datetime.now()
        subscribe_model_instance.mail_count = 0
        subscribe_model_instance.created_date = datetime.now()
        subscribe_model_instance.updated_date = datetime.now()
        subscribe_model_instance.save()
        return 'Created'
    except Exception as e:
        logging.getLogger("error").error(traceback.format_exc())
        return 'Error'


def delEmail(email,region):
    try:
        subscribe_model_instance = SubscribeModel.objects.get(email=email, region=region)
    except Exception as e:
        return 'Error'
    subscribe_model_instance.delete()
    return 'Deleted'


def getSubscribedRegions(email):
    try:
        fields = ['region']
        queryset = SubscribeModel.objects.filter(email=email).values_list(*fields)
        return queryset
    except ObjectDoesNotExist as e:
        print('no row');
        return 'Error'
    except Exception as e:
        print(e)
        return 'Error'
