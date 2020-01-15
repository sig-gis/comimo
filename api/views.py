from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
import ee
import json

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
