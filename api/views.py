from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
import ee
import json
import fiona
import os
from api.utils import *
from api.config import LEVELS, FIELDS
from accounts.models import Profile
from subscribe.utils import getSubscribedRegions

# view to get a single image (prediction) of a certain date


def getSingleImage(request):
    authGEE()
    layerName = request.GET.get("id")
    layerType = request.GET.get("type")
    palettes = {"nMines": "f00", "cMine": "fff", "pMines": "000"}
    img = ee.Image(IMAGE_REPO + "/" + layerName)
    img = img.select(0).selfMask()
    mapid = ee.data.getTileUrl(img.getMapId(
        {"palette": [palettes.get(layerType, "eee")]}), 0, 0, 0)[:-5]+"{z}/{x}/{y}"
    return JsonResponse({"url": mapid})

# get get the list of available images


def getImageNames(request):
    authGEE()
    layerList = getImageList()
    nMines = list(filter(lambda d:
                         re.fullmatch(r"\d{4}-\d{2}-\d{2}-N", d),
                         layerList))
    pMines = list(filter(lambda d:
                         re.fullmatch(r"\d{4}-\d{2}-\d{2}-P", d),
                         layerList))
    cMines = list(filter(lambda d:
                         re.fullmatch(
                             r"\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}-C", d),
                         layerList))
    return JsonResponse({
        'cMines': cMines,
        'nMines': nMines,
        'pMines': pMines
    })

# get the names of features (municipality) and their bounding boxes


def getFeatureNames(request):
    module_dir = os.path.dirname(__file__)
    f = open(os.path.join(module_dir,
                          'shapes',
                          'featureNames.json'), 'r').read()
    return JsonResponse(json.loads(f))


def getGEETiles(request):
    name = request.GET.get("name")
    layerList = {
        "municipalBounds": ["users/comimoapp/Shapes/Municipal_Bounds", "#f66", "#0000"],
        "otherAuthorizations": ["users/comimoapp/Shapes/Solicitudes_de_Legalizacion_2010", "#047", "#00447711"],
        "legalMines": ["users/comimoapp/Shapes/Legal_Mines", "#ff0", "#ffff0011"],
        "tierrasDeCom": ["users/comimoapp/Shapes/Tierras_de_comunidades_negras", "#fd9", "#ffdd9911"],
        "resguardos": ["users/comimoapp/Shapes/Resguardos_Indigenas", "#d9d", "#dd99dd11"],
        "protectedAreas": ["users/comimoapp/Shapes/RUNAP", "#35f0ab", "#dd99dd11"]
    }
    shape, color, fill = layerList.get(name, [None, None, None])
    if (shape):
        table = ee.FeatureCollection(shape)
        layer = table.style(color=color, fillColor=fill, width=1)
        mapid = ee.data.getTileUrl(layer.getMapId(), 0, 0, 0)[
            :-5]+"{z}/{x}/{y}"
        return JsonResponse({"url": mapid})
    else:
        return JsonResponse({"url": None})


# get the downloadurl for images


def getDownloadURL(request):
    region = request.GET.get('region')
    level = request.GET.get('level')
    date = request.GET.get('date')
    if (region and date and region != 'undefined' and date != 'undefined'):
        authGEE()
        img = ee.Image(IMAGE_REPO+'/'+date)
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
            {'region': regionFC.geometry(), 'scale': 540})
        return JsonResponse({'action': 'success', 'url': url})
    else:
        return JsonResponse({'action': 'error', 'message': 'Insufficient Parameters! Malformed URL!'}, status=500)

# get area of predicted mineswithin study region


def getAreaPredicted(request):
    user = request.user
    date = request.GET.get('date')
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        try:
            user = Profile.objects.get(user=user)
            regions = getSubscribedRegions(user)
            authGEE()
            fc = subscribedRegionsToFC(regions)
            image = ee.Image(IMAGE_REPO+'/'+date)
            pa = ee.Image.pixelArea()
            image = image.selfMask().multiply(pa)
            rr = image.reduceRegions(collection=fc,
                                     reducer=ee.Reducer.sum(),
                                     scale=540,
                                     crs='EPSG:4326')
            area = rr.aggregate_array('sum')
            names = rr.aggregate_array('MPIO_CNMBR')
            resp = ee.Dictionary({'area': area, 'names': names}).getInfo()
            resp['action'] = 'Success'
            return JsonResponse(resp)
        except Exception as e:
            print(e)
            return JsonResponse({'action': 'Error', 'message': 'Something went wrong!'}, status=500)

# get area of predicted mineswithin study region


def getAreaPredictedTS(request):
    user = request.user
    if not(user.is_authenticated):
        return requestLogin(request)
    else:
        try:
            user = Profile.objects.get(user=user)
            regions = getSubscribedRegions(user)
            authGEE()
            fc = subscribedRegionsToFC(regions)
            # print(fc.getInfo())

            def asBands(image, passedImage):
                image = ee.Image(image)
                id = image.id()
                pa = ee.Image.pixelArea()
                image = image.selfMask().multiply(pa)
                passedImage = ee.Image(passedImage)
                return passedImage.addBands(image.rename(id))
            image = ee.Image(ee.ImageCollection(
                IMAGE_REPO).iterate(asBands, ee.Image()))
            image = image.select(image.bandNames().remove('constant'))
            rr = image.reduceRegion(geometry=fc.geometry(),
                                    reducer=ee.Reducer.sum(),
                                    scale=540,
                                    crs='EPSG:4326',
                                    bestEffort=True)
            area = rr.values()
            names = rr.keys()
            resp = ee.Dictionary({'area': area, 'names': names}).getInfo()
            resp['action'] = 'Success'
            return JsonResponse(resp)
        except Exception as e:
            print(e)
            return JsonResponse({'action': 'Error', 'message': 'Something went wrong!'}, status=500)


def getInfo(request):
    try:
        authGEE()
        req = json.loads(request.body)
        dates = req.get('dates')
        visible = req.get('visible')
        lat = float(req.get('lat'))
        lng = float(req.get('lng'))
        point = ee.Geometry.Point(lng, lat)
        pointFeature = ee.Feature(ee.Geometry.Point(lng, lat))

        vals = {}

        if "nMines" in visible:
            nDate = dates.get('nMines')
            image = ee.Image(IMAGE_REPO + '/' + nDate).select([0], ['cval'])
            pt = image.sampleRegions(pointFeature)
            vals["nMines"] = ee.Algorithms.If(
                pt.size().gt(0), pt.first().get('cval'), 0).getInfo()

        if "pMines" in visible:
            pDate = dates.get('pMines')
            image = ee.Image(IMAGE_REPO + '/' + pDate).select([0], ['cval'])
            pt = image.sampleRegions(pointFeature)
            vals["pMines"] = ee.Algorithms.If(
                pt.size().gt(0), pt.first().get('cval'), 0).getInfo()

        if "cMines" in visible:
            cDate = dates.get('cMines')
            image = ee.Image(IMAGE_REPO + '/' + cDate).select([0], ['cval'])
            pt = image.sampleRegions(pointFeature)
            vals["cMines"] = ee.Algorithms.If(
                pt.size().gt(0), pt.first().get('cval'), 0).getInfo()

        if "municipalBounds" in visible:
            admnames = ee.FeatureCollection(
                "users/comimoapp/Shapes/Municipal_Bounds").filterBounds(point)
            vals["municipalBounds"] = ee.Algorithms.If(admnames.size().gt(0),
                                                       admnames.first().get('MPIO_CNMBR').getInfo() + ", " +
                                                       admnames.first().get('DPTO_CNMBR').getInfo(),
                                                       False).getInfo()

        if "protectedAreas" in visible:
            pa = ee.FeatureCollection(
                "users/comimoapp/Shapes/RUNAP").filterBounds(point)
            vals["protectedAreas"] = ee.Algorithms.If(pa.size().gt(0),
                                                      [pa.first().get('categoria'),
                                                       pa.first().get('nombre')],
                                                      [False, False]).getInfo()

        if "otherAuthorizations" in visible:
            oth_auth = ee.FeatureCollection("users/comimoapp/Shapes/Solicitudes_de_Legalizacion_2010")\
                .filterBounds(point)
            vals["otherAuthorizations"] = ee.Algorithms.If(oth_auth.size().gt(0),
                                                           oth_auth.first().get('ID'),
                                                           False).getInfo()

        if "legalMines" in visible:
            legal_mine = ee.FeatureCollection(
                "users/comimoapp/Shapes/Legal_Mines").filterBounds(point)
            vals["legalMines"] = ee.Algorithms.If(legal_mine.size().gt(0),
                                                  legal_mine.first().get('ID'),
                                                  False).getInfo()

        if "tierrasDeCom" in visible:
            et1 = ee.FeatureCollection(
                "users/comimoapp/Shapes/Tierras_de_comunidades_negras").filterBounds(point)
            vals["tierrasDeCom"] = ee.Algorithms.If(et1.size().gt(0),
                                                    et1.first().get('NOMBRE'),
                                                    False).getInfo()

        if "resguardos" in visible:
            et2 = ee.FeatureCollection(
                "users/comimoapp/Shapes/Resguardos_Indigenas").filterBounds(point)
            vals["resguardos"] = ee.Algorithms.If(et2.size().gt(0),
                                                  et2.first().get('NOMBRE'),
                                                  False).getInfo()

        return JsonResponse({'action': 'Success', 'value': vals})
    except Exception as e:
        print(e)
        return JsonResponse({'action': 'Error', 'message': 'Something went wrong!'}, status=500)
