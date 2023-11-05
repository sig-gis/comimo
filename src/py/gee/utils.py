import os
import ee
from functools import lru_cache

# Initialize


def initialize(ee_account="", ee_key_path=""):
    try:
        if ee_account and ee_key_path and os.path.exists(ee_key_path):
            credentials = ee.ServiceAccountCredentials(ee_account, ee_key_path)
            ee.Initialize(credentials)
        else:
            ee.Initialize()
    except Exception as e:
        print(e)


# Image helpers

def getImageList(imageFolder):
    assetList = ee.data.getList({"id": imageFolder})
    dates = list(map(lambda img: img["id"].split("/")[-1], assetList))
    dates.sort(reverse=True)
    return dates


def getVectorUrl(source, color, fill):
    table = ee.FeatureCollection(source)
    layer = table.style(color=color, fillColor=fill, width=1)
    mapid = ee.data.getTileUrl(layer.getMapId(), 0, 0, 0)[:-5]+"{z}/{x}/{y}"
    return mapid


def subscribedRegionsToFC(regions):
    regionsFC = ee.FeatureCollection([])
    for region in regions:
        r = region.split("_")
        thisFC = ee.FeatureCollection("users/comimoapp/Shapes/Municipal_Bounds")\
            .filter(ee.Filter.And(
                ee.Filter.eq("DPTO_CNMBR", r[1]),
                ee.Filter.eq("MPIO_CNMBR", r[2])))
        regionsFC = regionsFC.merge(thisFC)
    return regionsFC

def addPolygonCoords(polygon):
    feature = ee.Feature(ee.Geometry.Polygon(polygon), {})
    coords = feature.geometry().coordinates()
    return feature.set("coordinates", coords)

@lru_cache(maxsize=128)
def getDownloadURL(source, region):
   fc = ee.FeatureCollection(source)
   regionFC = ee.FeatureCollection("users/comimoapp/Shapes/Level0") if region == "all" else subscribedRegionsToFC([region])
   intersect = fc.geometry().intersection(regionFC.geometry())
   intersectFc = ee.FeatureCollection(intersect.coordinates().map(addPolygonCoords))

   urlCsv = intersectFc.getDownloadURL(**{
       "selectors": ["coordinates"],
       "filetype": "CSV",
       "filename": source[32:]
   })
   urlKml = intersectFc.getDownloadURL(**{
       "filetype": "KML",
       "filename": source[32:]
   })

   return {
       "csvUrl": urlCsv,
       "kmlUrl": urlKml
   }

def vectorPointOverlaps(source, lat, lon, cols):
    try:
        point = ee.Geometry.Point(lon, lat)
        fc = ee.FeatureCollection(source).filterBounds(point)
        return list(map((lambda c: fc.first().get(c).getInfo()), cols))
    except:
        return None

# Plot helpers


def addBuffer(feature):
    feature.buffer(1000)


def locationInCountry(lat, lon):
    point = ee.Geometry.Point(lon, lat)
    admnames = ee.FeatureCollection(
        "users/comimoapp/Shapes/Level0").filterBounds(point)
    return ee.Algorithms.If(admnames.size().gt(0), True, False).getInfo()


def getPlots(points):
    features = points["features"]
    plots = []
    for feature in features:
        try:
            coords = feature["geometry"]["coordinates"]
            lat = coords[0]
            lon = coords[1]
            plots.append({"lat": lat, "lon": lon})
        except Exception as e:
            print("issue with feature:", feature)
    return plots


def getPointsWithin(source, regions):
    fc = subscribedRegionsToFC(regions)
    try:
        points = ee.FeatureCollection(source)
        return getPlots(points.filterBounds(fc).getInfo())
    except Exception as e:
        print(e)


def statsByRegion(source, subscribedRegions):
    fc = subscribedRegionsToFC(subscribedRegions)
    image = ee.Image(source)
    pa = ee.Image.pixelArea()
    image = image.selfMask().multiply(pa)
    rr = image.reduceRegions(collection=fc,
                             reducer=ee.Reducer.count(),
                             scale=540,
                             crs="EPSG:4326")
    count = rr.aggregate_array("count")
    names = rr.aggregate_array("MPIO_CNMBR")
    return ee.Dictionary({"count": count, "names": names}).getInfo()


def asBands(image, passedImage):
    image = ee.Image(image)
    id = image.id()
    image = image.selfMask()
    passedImage = ee.Image(passedImage)
    return passedImage.addBands(image.rename(id))


def statTotals(source, subscribedRegions):
    fc = subscribedRegionsToFC(subscribedRegions)
    image = ee.Image(ee.ImageCollection(source)
                     .filter(ee.Filter.stringEndsWith("system:index", "-C"))
                     .iterate(asBands, ee.Image()))
    image = image.select(image.bandNames().remove("constant"))
    return image.reduceRegion(geometry=fc.geometry(),
                              reducer=ee.Reducer.count(),
                              scale=540,
                              crs="EPSG:4326",
                              bestEffort=True).getInfo()
