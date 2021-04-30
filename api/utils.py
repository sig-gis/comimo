import ee
import os
import re
import datetime
import pytz
import fiona
from api.config import *

# codes to interface with GEE

# function to authenticate GEE


def authGEE():
    geeAuthKey = os.path.join(os.path.dirname(__file__), 'gee-auth-key.json')
    if os.path.exists(geeAuthKey):
        service_account = 'comimo@earth-engine-comimo.iam.gserviceaccount.com'
        credentials = ee.ServiceAccountCredentials(
            service_account, geeAuthKey)
        ee.Initialize(credentials)
    else:
        ee.Initialize()
    return True


def getImageList():
    assetList = ee.data.getList({'id': IMAGE_REPO})
    dates = list(map(lambda img: img['id'].split('/')[-1], assetList))
    dates.sort(reverse=True)
    return dates


def getLatestImage():
    # TODO filter P type.  Move to cron.py
    imgList = getImageList()
    latest = imgList[0]
    y, m, d = list(map(lambda x: int(x), latest.split('-')))
    return ee.Image(IMAGE_REPO+'/'+latest), datetime.datetime(y, m, d).replace(tzinfo=pytz.UTC)


def subscribedRegionsToFC(regions):
    fc = ee.FeatureCollection([])
    for region in regions:
        r = region.split("_")
        # print(r)
        f = ee.FeatureCollection([])
        if (r[0] == 'mun'):
            # filter by level 1 name and then by mun name
            f = ee.FeatureCollection(LEVELS[r[0]])\
                .filter(ee.Filter.eq(FIELDS['mun_l1'], r[1]))\
                .filter(ee.Filter.eq(FIELDS['mun'], r[2]))
        fc = fc.merge(f)
    return fc


def getPointsWithin(regions, date):
    fc = subscribedRegionsToFC(regions)
    try:
        points = ee.FeatureCollection(POINTS_FOL+'/'+date.strftime("%Y-%m-%d"))
        return points.filterBounds(fc)
    except Exception as e:
        print(e)
