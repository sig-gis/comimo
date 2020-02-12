import ee, os
import datetime, pytz
import fiona
from api.config import *

#function to authenticate GEE
def authGEE():
    module_dir = os.path.dirname(__file__)
    service_account = 'gee-auth@earthengine-228009.iam.gserviceaccount.com'
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

def getLegalMineTiles():
    table = ee.FeatureCollection(LEGAL_MINES)
    style = {'color':'#ff0', 'fillColor':'#ffff0011', 'width':1}
    table = table.style(color=style['color'],fillColor=style['fillColor'],width=style['width'])
    mapid = ee.data.getTileUrl(table.getMapId(),0,0,0)[:-5]+'{z}/{x}/{y}'
    return {'url':mapid,'style':style}

def getMunicipalTiles():
    table = ee.FeatureCollection(LEVELS['mun'])
    style = {'color':'#7f00ff', 'fillColor':'#0000', 'width':1}
    table = table.style(color=style['color'],fillColor=style['fillColor'],width=style['width'])
    mapid = ee.data.getTileUrl(table.getMapId(),0,0,0)[:-5]+'{z}/{x}/{y}'
    return {'url':mapid,'style':style}

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
