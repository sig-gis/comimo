import os
import ee
from config import IMAGE_REPO, LEVELS, FIELDS, POINTS_FOL


########## Helper functions ##########


def initialize(ee_account='', ee_key_path=''):
    try:
        if ee_account and ee_key_path and os.path.exists(ee_key_path):
            credentials = ee.ServiceAccountCredentials(ee_account, ee_key_path)
            ee.Initialize(credentials)
        else:
            ee.Initialize()
    except Exception as e:
        print(e)


def addBuffer(feature):
    feature.buffer(1000)


def getImageList():
    assetList = ee.data.getList({'id': IMAGE_REPO})
    dates = list(map(lambda img: img['id'].split('/')[-1], assetList))
    dates.sort(reverse=True)
    return dates


def subscribedRegionsToFC(regions):
    fc = ee.FeatureCollection([])
    for region in regions:
        r = region.split("_")
        f = ee.FeatureCollection([])
        if (r[0] == 'mun'):
            # filter by level 1 name and then by mun name
            f = ee.FeatureCollection(LEVELS[r[0]])\
                .filter(ee.Filter.And(
                    ee.Filter.eq(FIELDS['mun_l1'], r[1]),
                    ee.Filter.eq(FIELDS['mun'], r[2])))
        if (r[0] == 'nationalPark'):
            f = ee.FeatureCollection(LEVELS[r[0]])\
                .filter(ee.Filter.eq(FIELDS['nombre'], r[1]))\
                .map(addBuffer)
        fc = fc.merge(f)
    return fc


def getPlots(points):
    features = points['features']
    plots = []
    for feature in features:
        try:
            coords = feature['geometry']['coordinates']
            lon = coords[0]
            lat = coords[1]
            plots.append({'lat': lat, 'lon': lon})
        except Exception as e:
            print("issue with feature:", feature)
    return plots


def getPointsWithin(regions, dataLayer):
    fc = subscribedRegionsToFC(regions)
    try:
        points = ee.FeatureCollection(POINTS_FOL + '/' + dataLayer)
        return getPlots(points.filterBounds(fc).getInfo())
    except Exception as e:
        print(e)


def locationInCountry(lat, lon):
    point = ee.Geometry.Point(lon, lat)
    admnames = ee.FeatureCollection(
        "users/comimoapp/Shapes/Level0").filterBounds(point)
    return ee.Algorithms.If(admnames.size().gt(0), True, False).getInfo()
