from django_cron import CronJobBase, Schedule
from subscribe.models import SubscribeModel, ProjectsModel
from subscribe.utils import saveProject
from accounts.models import Profile
import os, json
import datetime, pytz
from api.utils import authGEE, getLatestImage, getShape, reduceRegion, getPointsWithin
from subscribe.mailhelper import sendmail
from api.config import *

class GoldAlerts(CronJobBase):
    RUN_EVERY_MINS = 0.001 # every 0.001 min (doesn't run on it's timer but blocks if executed in less that that interval)

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'gmw.cronalerts'    # a unique code

    def do(self):
        authGEE()
        latest_image, latest_date = getLatestImage()
        sub_dict = getSubsDict(latest_date)
        for email in sub_dict:
            points = getPointsWithin(sub_dict[email],latest_date)
            number = points.size().getInfo()
            if (number > 0):
                points = points.getInfo()
                projecturl = getCeoProjectURL(points)
                print(email, projecturl, latest_date)
                entry_added = saveProject(email, projecturl, latest_date)
                print(entry_added)
                if (entry_added == "Created"):
                    sendmail(email, projecturl)
                    print('mail sent to ', email)

def getSubsDict(latest_date):
    try:
        subscribe_instances = SubscribeModel.objects.all().values()
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
                email = Profile.objects.get(user=user).email
                if email in sub_dict.keys():
                    sub_dict[email].append(level+'_'+region)
                else:
                    sub_dict[email] = [level+'_'+region]
            except Exception as e:
                print(e)
    return sub_dict

def getCeoProjectURL(points):
    return 'https://collect.earth/collection?projectId=5439'
