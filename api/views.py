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
    img = ee.Image(IMAGE_REPO+'/'+request.GET.get('id'))
    resp = getDefaultStyled(img)
    return JsonResponse(resp)

# get get the list of available images


def getImageNames(request):
    authGEE()
    return JsonResponse({'ids': getImageList()})
    # return HttpResponse('T')

# get the names of features (municipality) and their bounding boxes


def getFeatureNames(request):
    module_dir = os.path.dirname(__file__)
    f = open(os.path.join(module_dir, 'shapes',
             'featureNames.json'), 'r').read()
    return JsonResponse(json.loads(f))


def getGEETiles(request):
    name = request.GET.get('name')
    if (name == "municipalBounds"):
        table = ee.FeatureCollection("users/comimoapp/Shapes/Municipal_Bounds")
        style = {'color': '#f66', 'fillColor': '#0000', 'width': 1}
    elif (name == "otherAuthorizations"):
        table = ee.FeatureCollection("users/comimoapp/Shapes/Solicitudes_de_Legalizacion_2001")\
                  .merge(ee.FeatureCollection("users/comimoapp/Shapes/Solicitudes_de_Legalizacion_2010"))
        style = {"color": "#047", "fillColor": "#00447711", "width": 1}
    elif (name == "legalMines"):
        table = ee.FeatureCollection("users/comimoapp/Shapes/Legal_Mines")
        style = {'color': '#ff0', 'fillColor': '#ffff0011', 'width': 1}
    elif (name == 'tierrasDeCom'):
        table = ee.FeatureCollection(
            "users/comimoapp/Shapes/Tierras_de_comunidades_negras")
        style = {'color': '#fd9', 'fillColor': '#ffdd9911', 'width': 1}
    elif (name == 'resguardos'):
        table = ee.FeatureCollection(
            "users/comimoapp/Shapes/Resguardos_Indigenas")
        style = {'color': '#d9d', 'fillColor': '#dd99dd11', 'width': 1}
    elif (name == 'protectedAreas'):
        table = ee.FeatureCollection(
            "users/comimoapp/Shapes/RUNAP")  # .filterBounds(bounds)
        style = {'color': '#35f0ab', 'fillColor': '#dd99dd11', 'width': 1}

    layer = table.style(
        color=style['color'], fillColor=style['fillColor'], width=style['width'])
    mapid = ee.data.getTileUrl(layer.getMapId(), 0, 0, 0)[:-5]+'{z}/{x}/{y}'
    return JsonResponse({'url': mapid, 'style': style})

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
        req = json.loads(request.body)
        date = req.get('date')
        authGEE()
        image = ee.Image(IMAGE_REPO + '/' + date).select([0], ['cval'])
        lat = float(req.get('lat'))
        lng = float(req.get('lng'))
        point = ee.Geometry.Point(lng, lat)

        visible = req.get('visible')
        vals = {}

        if "eeLayer" in visible:
            pt = image.sampleRegions(ee.Feature(point))
            vals["eeLayer"] = ee.Algorithms.If(
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
