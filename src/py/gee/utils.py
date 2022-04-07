import os
import ee
from config import IMAGE_REPO, LEVELS, FIELDS, POINTS_FOL

### Initialize

def initialize(ee_account='', ee_key_path=''):
    try:
        if ee_account and ee_key_path and os.path.exists(ee_key_path):
            credentials = ee.ServiceAccountCredentials(ee_account, ee_key_path)
            ee.Initialize(credentials)
        else:
            ee.Initialize()
    except Exception as e:
        print(e)


### Image helpers

def getImageList(imageFolder):
    assetList = ee.data.getList({'id': imageFolder})
    dates = list(map(lambda img: img['id'].split('/')[-1], assetList))
    dates.sort(reverse=True)
    return dates


def getVectorUrl(source, color, fill):
    table = ee.FeatureCollection(source)
    layer = table.style(color=color, fillColor=fill, width=1)
    mapid = ee.data.getTileUrl(layer.getMapId(), 0, 0, 0)[:-5]+"{z}/{x}/{y}"
    return mapid


def getImageUrl(source, color):
    img = ee.Image(source)
    img = img.select(0).selfMask()
    mapid = ee.data.getTileUrl(img.getMapId({"palette": [color]}), 0, 0, 0)[:-5]+"{z}/{x}/{y}"
    return mapid


def getDownloadURL(source, region, level, scale):
    img = ee.Image(source)
    if (region == 'all'):
        regionFC = ee.FeatureCollection(LEVELS['l0'])
    else:
        l1, l2 = region.split("_")
        regionFC = ee.FeatureCollection(LEVELS[level])\
            .filter(ee.Filter.eq(FIELDS['mun_l1'], l1.upper()))\
            .filter(ee.Filter.eq(FIELDS['mun'], l2.upper()))
    img = img.clip(regionFC)
    img.reduceRegion(ee.Reducer.sum(),
                     regionFC.first().geometry(),
                     540,
                     bestEffort=True).getInfo()
    url = img.toByte().getDownloadURL(
        {'region': regionFC.geometry(), 'scale': scale})
    return {'action': 'success', 'url': url}


### Plot helpers


def addBuffer(feature):
    feature.buffer(1000)

def locationInCountry(lat, lon):
    point = ee.Geometry.Point(lon, lat)
    admnames = ee.FeatureCollection(
        "users/comimoapp/Shapes/Level0").filterBounds(point)
    return ee.Algorithms.If(admnames.size().gt(0), True, False).getInfo()


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
            lat = coords[0]
            lon = coords[1]
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


def statsByRegion(source, regions):
    fc = subscribedRegionsToFC(regions)
    image = ee.Image(source)
    pa = ee.Image.pixelArea()
    image = image.selfMask().multiply(pa)
    rr = image.reduceRegions(collection=fc,
                                reducer=ee.Reducer.count(),
                                scale=540,
                                crs='EPSG:4326')
    count = rr.aggregate_array('count')
    names = rr.aggregate_array('MPIO_CNMBR')
    resp = ee.Dictionary({'count': count, 'names': names}).getInfo()
    resp['action'] = 'Success'
    return resp

def statTotals(subscribedRegions):
    fc = subscribedRegionsToFC(subscribedRegions)
    def asBands(image, passedImage):
        image = ee.Image(image)
        id = image.id()
        image = image.selfMask()
        passedImage = ee.Image(passedImage)
        return passedImage.addBands(image.rename(id))
    image = ee.Image(ee.ImageCollection(IMAGE_REPO)
                        .filter(ee.Filter.stringEndsWith('system:index', '-C'))
                        .iterate(asBands, ee.Image()))
    image = image.select(image.bandNames().remove('constant'))
    rr = image.reduceRegion(geometry=fc.geometry(),
                            reducer=ee.Reducer.count(),
                            scale=540,
                            crs='EPSG:4326',
                            bestEffort=True)
    count = rr.values()
    names = rr.keys()
    resp = ee.Dictionary({'count': count, 'names': names}).getInfo()
    resp['action'] = 'Success'
    return resp
