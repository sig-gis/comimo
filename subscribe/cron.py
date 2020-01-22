from django_cron import CronJobBase, Schedule
from .models import SubscribeModel
import ee
import os
import fiona
import datetime, pytz

# repository containing all the gold mine rasters
IMAGE_REPO = 'users/nk-sig/GoldMineProbabilities'
# flag for the probability threshold, mail will be sent if there are pixels
# that cross said threshold
FLAG_THRESHOLD = 0.1

def authGEE():
    ee.Initialize()
    return True


def getLatestImage():
    imgList = ee.data.getList({'id':IMAGE_REPO})
    imgList = list(map(lambda img: img['id'].split('/')[-1], imgList))
    imgList.sort(reverse=True)
    latest = imgList[0]
    y, m, d = list(map(lambda x: int(x), latest.split('-')));
    return ee.Image(IMAGE_REPO+'/'+latest), datetime.datetime(y,m,d).replace(tzinfo=pytz.UTC)


def getShape(region, level):
    module_dir = os.path.dirname(__file__)
    shapefile = os.path.join(os.path.dirname(module_dir),'api','shapes','Level'+str(level)+'.shp')
    iterator = fiona.open(shapefile)
    if (level == 0):
        return iterator.next();
    elif (level == 1):
        for feature in iterator:
            if (feature['properties']['admin1RefN'] == region):
                return feature
    elif (level == 2):
        for feature in iterator:
            if (feature['properties']['admin2RefN'] == region):
                return feature


def reduceRegion(shapeObj,raster):

    sadasd

class GoldAlerts(CronJobBase):
    RUN_EVERY_MINS = 0.001 # every 1 min
    REPOSITORY = 'users/nk-sig/GoldMineProbabilities'

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'gmw.cronalerts'    # a unique code


    def getLatestImage(self):
        print('here')
        # imgList = ee.data.getList({'id':REPOSITORY})
        # print(imgList)
        # return imgList

    def do(self):
        authGEE()
        subscribe_instances = SubscribeModel.objects.all().values()
        # print('Fetching instances ... Done')
        latest_image, latest_date = getLatestImage()
        print('Fetching latest image ... Done')
        emails = {}
        values = {}
        for instance in iter(subscribe_instances):
            last_alert = instance['last_alert_for']
            if (latest_date>last_alert):
                try:
                    ad = str(instance['email'])
                    if ad in emails:
                        emails[ad] += ','+instance['region']+'_'+str(instance['level'])
                    else:
                        emails[ad] = instance['region']+'_'+str(instance['level'])

                    region = instance['region']
                    level = instance['level']
                    shapeObj = getShape(region, level)
                    flag = reduceRegion(shapeObj['geometry'], latest_image)
                    # print(shapeObj)
                except Exception as e:
                    print('error occured!!', instance, e)
        # print(emails)
        pass    # do your thing here
