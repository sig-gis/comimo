from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
import ee
import json
import os
import fiona

def authGEE():
    ee.Initialize()
    return True

def test(request):
    authGEE()
    # parse request parameters
    minp = int(request.GET.get('minp'))/100.
    maxp = int(request.GET.get('maxp'))/100.
    miny = int(request.GET.get('miny'))
    maxy = int(request.GET.get('maxy'))
    img = ee.Image('users/nk-sig/example-gold')
    img = img.updateMask(img.gte(minp))
    visparams = {'min':minp,'max':maxp,'palette':['225ea8','41b6c4','a1dab4','ffffcc']}
    mapid = ee.data.getTileUrl(img.getMapId(visparams),0,0,0)[:-5]+'{z}/{x}/{y}'
    return JsonResponse({'url':mapid,'visparams':visparams,'minp':minp})

def getfeaturenames(request):
    module_dir = os.path.dirname(__file__)

    l1list = []
    l2list = []

    level1 = fiona.open(os.path.join(module_dir,'shapes','Level1.shp'))
    level2 = fiona.open(os.path.join(module_dir,'shapes','Level2.shp'))
    for feat in level1:
        l1list.append(feat['properties']['admin1RefN'])
    for feat in level2:
        l2list.append(feat['properties']['admin2RefN'])
    return JsonResponse({'action':'FeatureNames', 'l0':'Colombia', 'l1':l1list, 'l2': l2list});

def getfeatures(request):
    module_dir = os.path.dirname(__file__)
    focus = request.GET.get('focus')
    try:
        level = int(request.GET.get('level'))
    except Exception as e:
        level = 0

    if (level == 0):
        level0 = fiona.open(os.path.join(module_dir,'shapes','Level3.shp'))
        return JsonResponse(level0.next());
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
