from django_cron import CronJobBase, Schedule
from subscribe.models import SubscribeModel, ProjectsModel
from subscribe.utils import saveProject, projectExists
from accounts.models import Profile
import os, json
import datetime, pytz
from api.utils import authGEE, getLatestImage, getShape, reduceRegion, getPointsWithin
from subscribe.mailhelper import sendmail
from subscribe.ceohelper import getCeoProjectURL
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
            if (not projectExists(email, latest_date)):
                points = getPointsWithin(sub_dict[email],latest_date)
                number = points.size().getInfo()
                if (number > 0):
                    try:
                        points = points.getInfo()
                        proj = getCeoProjectURL(points, latest_date, email)
                        projid = proj['projectId']
                        projurl = proj['ceoCollectionUrl']
                        entry_added = saveProject(email, projurl, projid, latest_date)
                        if (entry_added == "Created"):
                            sendmail(email, projurl)
                            print('mail sent to ', email)
                    except Exception as e:
                        print("Exception",e)
            else:
                print('Project already exists')

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
