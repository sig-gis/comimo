from django_cron import CronJobBase, Schedule
from subscribe.models import SubscribeModel, ProjectsModel
from subscribe.utils import saveProject, projectExists
from accounts.models import Profile
import os, json
import datetime, pytz
from api.utils import authGEE, getLatestImage, getShape, reduceRegion, getPointsWithin
from api.config import *

from subscribe.mailhelper import sendmail
from subscribe.ceohelper import getCeoProjectURL
from subscribe import utils as subutils

class GoldAlerts(CronJobBase):
    RUN_EVERY_MINS = 0.001 # every 0.001 min (doesn't run on it's timer but blocks if executed in less that that interval)

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'gmw.cronalerts'    # a unique code

    def do(self):
        try:
            authGEE()
            latest_image, latest_date = getLatestImage()
            users = SubscribeModel.objects.all().values('user').distinct()
            for user in iter(users):
                proj_created = subutils.createProject(user['user'], latest_date)
                if (proj_created['action'] == "Created"):
                    sendmail(email, projurl)
                    print('mail sent to ', email)
                else:
                    print(proj_created)
        except Exception as e:
            print(e)
