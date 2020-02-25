from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
import ee
import json, fiona
import os
from api.utils import *
from api.config import LEVELS

def test(request):
    authGEE()
    # parse request parameters
    minp = int(request.GET.get('minp'))/100.
    maxp = int(request.GET.get('maxp'))/100.
    miny = int(request.GET.get('miny'))
    maxy = int(request.GET.get('maxy'))
    img = ee.Image(IMAGE_REPO+'/2020-01-22')
    # img = img.updateMask(img.gte(minp))
    # visparams = {'min':minp,'max':maxp,'palette':['fff','f00']}
    resp = getDefaultStyled()
    resp['minp'] = minp
    return JsonResponse(resp)

def getCompositeImage(request):
    try:
        # parse request parameters
        minp = int(request.GET.get('minp'))/100.
        maxp = int(request.GET.get('maxp'))/100.
        miny = request.GET.get('miny')
        maxy = request.GET.get('maxy')
        authGEE()
        image = getComposite(minp, maxp, miny, maxy)
        resp = getDefaultStyled(image)
        resp['params'] = [minp, maxp, miny, maxy]
        return JsonResponse(resp)
    except TypeError as e:
        print(e)
        # return redirect('login')

def getSingleImage(request):
    authGEE()
    img = ee.Image(IMAGE_REPO+'/'+request.GET.get('id'))
    resp = getDefaultStyled(img)
    return JsonResponse(resp)

def getImageNames(request):
    authGEE()
    return JsonResponse({'ids':getImageList()})
    # return HttpResponse('T')

def getFeatureNames(request):
    module_dir = os.path.dirname(__file__)

    level2 = fiona.open(os.path.join(module_dir,'shapes','Level2.shp'))
    dict = {}
    l2list = []
    for feat in level2:
        l1name = feat['properties']['admin1Name']
        if l1name in dict:
            dict[l1name][feat['properties']['admin2Name']] = bounds(feat)
        else:
            dict[l1name] = {feat['properties']['admin2Name'] : bounds(feat)}
    return JsonResponse({'action':'FeatureNames', 'features': dict});

def getPeruFeatureNames(request):
    module_dir = os.path.dirname(__file__)

    level2 = fiona.open(os.path.join(module_dir,'shapes','PERU','per_admbnda_adm2_2018.shp'))
    dict = {}
    l2list = []
    for feat in level2:
        l1name = feat['properties']['ADM1_ES']
        if l1name in dict:
            dict[l1name][feat['properties']['ADM2_ES']] = bounds(feat)
        else:
            dict[l1name] = {feat['properties']['ADM2_ES'] : bounds(feat)}
    return JsonResponse({'action':'FeatureNames', 'features': dict});


def getCascadingFeatureNames(request):
    authGEE()
    fc = ee.FeatureCollection(MUNICIPAL_BOUNDS)
    fclist = fc.toList(fc.size());

    def getCascadingList(feature, passedObject):
        passedObject = ee.Dictionary(passedObject)
        feature = ee.Feature(feature)
        l1 = feature.get('admin1Name')
        l2 = feature.get('admin2Name')
        subset = passedObject.get(l1, False)
        list = ee.Algorithms.If(subset,ee.List(subset).add(l2),[l2])
        return passedObject.set(l1,list)

    fci = fclist.iterate(getCascadingList, {});

    return JsonResponse(fci.getInfo())

def getFeatures(request):
    module_dir = os.path.dirname(__file__)
    focus = request.GET.get('focus')
    try:
        level = int(request.GET.get('level'))
    except Exception as e:
        level = 0
    if (level == 0):
        level0 = fiona.open(os.path.join(module_dir,'shapes','Level0.shp'))
        return JsonResponse(next(iter(level0)));
    elif (level == 1):
        level1 = fiona.open(os.path.join(module_dir,'shapes','Level1.shp'))
        fcoll = {'type':'FeatureCollection', 'features':[]}
        for feature in level1:
            fcoll['features'].append(feature);
        return JsonResponse(fcoll);
    elif (level == 2):
        level2 = fiona.open(os.path.join(module_dir,'shapes','Level2.shp'))
        fcoll = {'type':'FeatureCollection', 'features':[]}
        for feature in level2:
            if (feature['properties']['admin1Name']==focus):
                fcoll['features'].append(feature)
        return JsonResponse(fcoll)

def getLegalMines(request):
    authGEE()
    return JsonResponse(getLegalMineTiles())

def getMunicipalLayer(request):
    authGEE()
    return JsonResponse(getMunicipalTiles())

def getANPeru(request):
    authGEE()
    return JsonResponse(getANPeruLayer())

def getCatMinPeru(request):
    authGEE()
    return JsonResponse(getCatMinPeruLayer())

def getDownloadURL(request):
    region = request.GET.get('region')
    level = request.GET.get('level')
    date = request.GET.get('date')
    if (region and date and region != 'undefined' and date!='undefined'):
        authGEE()
        img = ee.Image(IMAGE_REPO+'/'+date)
        if (region == 'all'):
            region = ee.FeatureCollection(LEVELS['l0'])
        else:
            region = ee.FeatureCollection(LEVELS[level]).filter(ee.Filter.eq(FIELDS[level],region))
        img = img.clip(region)
        url = img.toByte().getDownloadURL({})
        return JsonResponse({'action':'success', 'url':url})
    else:
        return JsonResponse({'action':'error','message':'Insufficient Parameters! Malformed URL!'}, status=500)

def searchMunicipalities(request):
    return JsonResponse({'asdasd':'qweqwe'})
