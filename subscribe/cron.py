from django_cron import CronJobBase, Schedule
from subscribe.models import SubscribeModel
import os
import datetime, pytz
from api.utils import authGEE, getLatestImage, getShape, reduceRegion
from .mailhelper import sendmails


class GoldAlerts(CronJobBase):
    RUN_EVERY_MINS = 0.001 # every 0.001 min (doesn't run on it's timer but blocks if executed in less that that interval)

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'gmw.cronalerts'    # a unique code

    def do(self):
        authGEE()
        try:
            subscribe_instances = SubscribeModel.objects.all().values()
            latest_image, latest_date = getLatestImage()
        except Exception as e:
            print(e)
            return
        emails = {}
        for instance in iter(subscribe_instances):
            last_alert = instance['last_alert_for']
            if (latest_date>last_alert):
                try:
                    region = instance['region']
                    level = instance['level']
                    shapeObj = getShape(region, level)
                    flag = reduceRegion(shapeObj['geometry'], latest_image)
                    if (flag):
                        ad = str(instance['email'])
                        if ad in emails:
                            emails[ad] += ','+instance['region']+'_'+str(instance['level'])
                        else:
                            emails[ad] = instance['region']+'_'+str(instance['level'])
                except Exception as e:
                    print('error occured!!', e)
        sendmails(emails)
        print('mail sent to ', emails)
