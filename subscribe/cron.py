from django_cron import CronJobBase, Schedule
from subscribe.models import SubscribeModel, ProjectsModel
import os
import datetime, pytz
from api.utils import authGEE, getLatestImage, getShape, reduceRegion
from subscribe.mailhelper import sendmails
from api.config import *

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
        sub_dict = {}
        for instance in iter(subscribe_instances):
            last_alert = instance['last_alert_for']
            if (True):#(latest_date>last_alert):
                try:
                    region = instance['region']
                    level = instance['level']
                    user = instance['user_id']
                    if user in sub_dict.keys():
                        sub_dict[user].append(level+'_'+region)
                    else:
                        sub_dict[user] = [level+'_'+region]
                except Exception as e:
                    pass
        print (sub_dict)
        #            shapeObj = getShape(region, level)
        #             flag = reduceRegion(shapeObj['geometry'], latest_image)
        #             if (flag):
        #                 ad = str(instance['email'])
        #                 if ad in emails:
        #                     emails[ad] += ','+instance['region']+'_'+str(instance['level'])
        #                 else:
        #                     emails[ad] = instance['region']+'_'+str(instance['level'])
        #         except Exception as e:
        #             print('error occured!!', e)
        # # sendmails(emails)
        # print('mail sent to ', emails)
