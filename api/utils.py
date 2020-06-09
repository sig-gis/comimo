import ee, os
import datetime, pytz
import fiona
from api.config import *

#codes to interface with GEE

#function to authenticate GEE
def authGEE():
    module_dir = os.path.dirname(__file__)
    service_account = 'comimo@earth-engine-comimo.iam.gserviceaccount.com'
    credentials = ee.ServiceAccountCredentials(service_account, os.path.join(module_dir,'gee-auth-key.json'))
    ee.Initialize(credentials)
    # ee.Initialize()
    return True

def getImageList():
    assetList = ee.data.getList({'id':IMAGE_REPO})
    return list(map(lambda img: img['id'].split('/')[-1], assetList))

def getRenderedMunicipalBounds():
    table = ee.FeatureCollection()
    style = {color:'#ff0', fillColor:'#0000', width:1}
    table = table.style(style)
    mapid = ee.data.getTileUrl(table.getMapId(),0,0,0)[:-5]+'{z}/{x}/{y}'
    return {'url':mapid,'style':style}

def getLatestImage():
    imgList = getImageList();
    imgList.sort(reverse=True)
    latest = imgList[0]
    y, m, d = list(map(lambda x: int(x), latest.split('-')));
    return ee.Image(IMAGE_REPO+'/'+latest), datetime.datetime(y,m,d).replace(tzinfo=pytz.UTC)

def getComposite(minp, maxp, miny, maxy):
    imageDates = getImageList()
    validDates = [ee.Image(IMAGE_REPO+'/'+imageDates[i]).selfMask() for i in range(len(imageDates)) if (imageDates[i]>=miny and imageDates[i]<= maxy)]
    icoll = ee.ImageCollection.fromImages(validDates)
    count = icoll.count()
    percent = icoll.sum().reproject(crs='EPSG:4326', scale=30).divide(count)
    thresholded = percent.gte(minp).And(percent.lte(maxp))
    return thresholded


def getShape(region, level):
    module_dir = os.path.dirname(__file__)
    shapefile = os.path.join(module_dir,'shapes','Level'+str(level)+'.shp')
    iterator = fiona.open(shapefile)

    if (level == 0):
        return next(iter(iterator))
    elif (level == 1):
        for feature in iterator:
            if (feature['properties']['admin1RefN'] == region):
                return feature
    elif (level == 2):
        for feature in iterator:
            if (feature['properties']['admin2RefN'] == region):
                return feature

def reduceRegion(shapeObj,raster):
    authGEE()
    polygon = ee.Geometry.MultiPolygon(shapeObj['coordinates']);
    value = raster.reduceRegion(ee.Reducer.sum(), polygon, 30, bestEffort = True)
    return value.getInfo()['b1']>0


def getDefaultStyled(img):
    img = img.select(0).selfMask()
    visparams = {'palette':['f00']}
    mapid = ee.data.getTileUrl(img.getMapId(visparams),0,0,0)[:-5]+'{z}/{x}/{y}'
    return {'url':mapid,'visparams':visparams}

def subscribedRegionsToFC(regions):
    fc = ee.FeatureCollection([])
    for region in regions:
        r = region.split("_")
        # print(r)
        f = ee.FeatureCollection([])
        if (r[0] == 'mun'):
            # filter by level 1 name and then by mun name
            f = ee.FeatureCollection(LEVELS[r[0]])\
                .filter(ee.Filter.eq(FIELDS['mun_l1'],r[1].upper()))\
                .filter(ee.Filter.eq(FIELDS['mun'],r[2].upper()))
        fc = fc.merge(f)
    return fc

def getPointsWithin(regions,date):
    fc = subscribedRegionsToFC(regions)
    try:
        points = ee.FeatureCollection(POINTS_FOL+'/'+date.strftime("%Y-%m-%d"))
        return points.filterBounds(fc)
    except Exception as e:
        print(e)
    # points = ee.FeatureCollection(POINTS_FOL+'/'+date.strftime("%Y-%m-%d"))
    # print(points.first().getInfo())


# helper functions
def explode(coords):
    for e in coords:
        if isinstance(e, (float, int)):
            yield coords
            break
        else:
            for f in explode(e):
                yield f

def bounds(feature):
    x, y = zip(*list(explode(feature['geometry']['coordinates'])))
    return [[min(x), min(y)], [max(x), max(y)]]
