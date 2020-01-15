from django.core.exceptions import ObjectDoesNotExist
import logging, traceback

# function to add entry to model
def saveEmail(email, region):
    try:
        subscribe_model_instance = SubscribeModel.objects.get(email=email, region=region)
    except ObjectDoesNotExist as e:
        subscribe_model_instance = SubscribeModel()
        subscribe_model_instance.email = email
        subscribe_model_instance.region = region
    except Exception as e:
        logging.getLogger("error").error(traceback.format_exc())
        return False

    # does not matter if already subscribed or not...resend the email
    subscribe_model_instance.status = constants.SUBSCRIBE_STATUS_SUBSCRIBED
    subscribe_model_instance.created_date = utility.now()
    subscribe_model_instance.updated_date = utility.now()
    subscribe_model_instance.save()
    return True
