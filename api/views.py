from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
import ee
import json, fiona
import os
from api.utils import *
from api.config import LEVELS, FIELDS
from accounts.models import Profile
from subscribe.utils import getSubscribedRegions

# view to get composite image between two dates
def getCompositeImage(request):
    try:
        # parse request parameters
        minp = int(request.GET.get('minp'))/100.
        maxp = int(request.GET.get('maxp'))/100.
        miny = request.GET.get('miny')
        maxy = request.GET.get('maxy')
        authGEE()
        percent = getComposite(miny, maxy)
        image = percent.gte(minp).And(percent.lte(maxp))
        resp = getDefaultStyled(image)
        resp['params'] = [minp, maxp, miny, maxy]
        return JsonResponse(resp)
    except TypeError as e:
        print(e)
        # return redirect('login')

# view to get a single image (prediction) of a certain date
def getSingleImage(request):
    authGEE()
    img = ee.Image(IMAGE_REPO+'/'+request.GET.get('id'))
    resp = getDefaultStyled(img)
    return JsonResponse(resp)

# get get the list of available images
def getImageNames(request):
    authGEE()
    return JsonResponse({'ids':getImageList()})
    # return HttpResponse('T')

# get the names of features (municipality) and their bounding boxes
def getFeatureNames(request):
    module_dir = os.path.dirname(__file__)
    f = open(os.path.join(module_dir,'shapes','featureNames.json'),'r').read()
    return JsonResponse(json.loads(f))


    # level2 = fiona.open(os.path.join(module_dir,'shapes','Level2.shp'))
    # dict = {}
    # l2list = []
    # for feat in level2:
    #     l1name = feat['properties']['DPTO_CNMBR']
    #     if l1name in dict:
    #         dict[l1name][feat['properties']['MPIO_CNMBR']] = bounds(feat)
    #     else:
    #         dict[l1name] = {feat['properties']['MPIO_CNMBR'] : bounds(feat)}
    # return JsonResponse({'action':'FeatureNames', 'features': dict})

# get features in a cascading pattern
def getCascadingFeatureNames(request):
    authGEE()
    fc = ee.FeatureCollection(MUNICIPAL_BOUNDS)
    fclist = fc.toList(fc.size())

    def getCascadingList(feature, passedObject):
        passedObject = ee.Dictionary(passedObject)
        feature = ee.Feature(feature)
        l1 = feature.get('admin1Name')
        l2 = feature.get('admin2Name')
        subset = passedObject.get(l1, False)
        list = ee.Algorithms.If(subset,ee.List(subset).add(l2),[l2])
        return passedObject.set(l1,list)

    fci = fclist.iterate(getCascadingList, {})

    return JsonResponse(fci.getInfo())

# get features in a geojson format
def getFeatures(request):
    module_dir = os.path.dirname(__file__)
    focus = request.GET.get('focus')
    try:
        level = int(request.GET.get('level'))
    except Exception as e:
        level = 0
    if (level == 0):
        level0 = fiona.open(os.path.join(module_dir,'shapes','Level0.shp'))
        return JsonResponse(next(iter(level0)))
    elif (level == 1):
        level1 = fiona.open(os.path.join(module_dir,'shapes','Level1.shp'))
        fcoll = {'type':'FeatureCollection', 'features':[]}
        for feature in level1:
            fcoll['features'].append(feature)
        return JsonResponse(fcoll)
    elif (level == 2):
        level2 = fiona.open(os.path.join(module_dir,'shapes','Level2.shp'))
        fcoll = {'type':'FeatureCollection', 'features':[]}
        for feature in level2:
            if (feature['properties']['admin1Name']==focus):
                fcoll['features'].append(feature)
        return JsonResponse(fcoll)

# get mapid for the legal mines layer
def getLegalMines(request):
    authGEE()
    return JsonResponse(getLegalMineTiles())

# get mapid for municipal boundaries layer
def getMunicipalLayer(request):
    authGEE()
    return JsonResponse(getMunicipalTiles())

def getGEETiles(request):
    name = request.GET.get('name')
    if (name == "national_parks"):
        table = ee.FeatureCollection("users/comimoapp/Shapes/National_Parks")
        style = {'color':'#6f6', 'fillColor':'#0000', 'width':1}
    elif (name == "municipal_bounds"):
        table = ee.FeatureCollection("users/comimoapp/Shapes/Municipal_Bounds")
        style = {'color':'#f66', 'fillColor':'#0000', 'width':1}
    elif (name == "other_authorizations"):
        table = ee.FeatureCollection("users/comimoapp/Shapes/Solicitudes_de_Legalizacion_2001")\
                  .merge(ee.FeatureCollection("users/comimoapp/Shapes/Solicitudes_de_Legalizacion_2010"))
        style = {"color":"#047", "fillColor":"#00447711", "width":1}
    elif (name == "legal_mines"):
        table = ee.FeatureCollection("users/comimoapp/Shapes/Legal_Mines")
        style = {'color':'#ff0', 'fillColor':'#ffff0011', 'width':1}
    elif (name == 'tierras_de_com'):
        table = ee.FeatureCollection("users/comimoapp/Shapes/Tierras_de_comunidades_negras")
        style = {'color':'#fd9', 'fillColor':'#ffdd9911', 'width':1}
    elif (name == 'resguardos'):
        table = ee.FeatureCollection("users/comimoapp/Shapes/Resguardos_Indigenas")
        style = {'color':'#d9d', 'fillColor':'#dd99dd11', 'width':1}
    elif (name == 'protected_areas'):
        # bounds = ee.FeatureCollection('users/comimoapp/Shapes/Level0')
        table = ee.FeatureCollection("users/comimoapp/Shapes/RUNAP")#.filterBounds(bounds)
        style = {'color':'#35f0ab', 'fillColor':'#dd99dd11', 'width':1}

    layer = table.style(color=style['color'],fillColor=style['fillColor'],width=style['width'])
    mapid = ee.data.getTileUrl(layer.getMapId(),0,0,0)[:-5]+'{z}/{x}/{y}'
    return JsonResponse({'url':mapid,'style':style})

# get the downloadurl for images
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
            l1, l2 = region.split("_")
            region = ee.FeatureCollection(LEVELS[level])\
                        .filter(ee.Filter.eq(FIELDS['mun_l1'],l1.upper()))\
                        .filter(ee.Filter.eq(FIELDS['mun'],l2.upper()))
        img = img.clip(region)
        print(img.reduceRegion(ee.Reducer.sum(),region.first().geometry(),510, bestEffort=True).getInfo())
        url = img.toByte().getDownloadURL({'region':region.geometry(),'scale':510})
        return JsonResponse({'action':'success', 'url':url})
    else:
        return JsonResponse({'action':'error','message':'Insufficient Parameters! Malformed URL!'}, status=500)

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
            # pa = ee.Image.pixelArea()
            image = image.selfMask()#.multiply(1)
            rr = image.reduceRegions(collection=fc,
                reducer=ee.Reducer.count(),
                scale=540,
                crs='EPSG:4326')
            area = rr.aggregate_array('count')
            names = rr.aggregate_array('MPIO_CNMBR')
            dict = ee.Dictionary({'area':area,'names':names}).getInfo()
            dict['action'] = 'Success'
            return JsonResponse(dict)
        except Exception as e:
            print(e)
            return JsonResponse({'action':'Error','message':'Something went wrong!'},status=500)

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
                # pa = ee.Image.pixelArea()
                image = image.selfMask()#.multiply(pa)
                passedImage = ee.Image(passedImage)
                return passedImage.addBands(image.rename(id))
            image =  ee.Image(ee.ImageCollection(IMAGE_REPO).iterate(asBands,ee.Image()))
            image = image.select(image.bandNames().remove('constant'))
            rr = image.reduceRegion(geometry=fc.geometry(),
                reducer=ee.Reducer.count(),
                scale=540,
                crs='EPSG:4326',
                bestEffort=True)
            area = rr.values()
            names = rr.keys()
            dict = ee.Dictionary({'area':area,'names':names}).getInfo()
            dict['action'] = 'Success'
            return JsonResponse(dict)
        except Exception as e:
            print(e)
            return JsonResponse({'action':'Error','message':'Something went wrong!'},status=500)

def getInfo(request):
    try:
        lat = float(request.GET.get('lat'))
        lng = float(request.GET.get('lon'))
        image = request.GET.get('image')
        authGEE()
        if image != "false":
            image = ee.Image(IMAGE_REPO+'/'+image).select([0],['cval'])
        else:
            minp = int(request.GET.get('minp'))/100.
            maxp = int(request.GET.get('maxp'))/100.
            miny = request.GET.get('miny')
            maxy = request.GET.get('maxy')
            image = getComposite(miny, maxy).select([0],['cval'])
        dist = ee.FeatureCollection(LEVELS['mun'])
        point = ee.Geometry.Point(lng,lat)
        pt = image.sampleRegions(ee.Feature(point))
        print(pt.getInfo())
        # f = dist.filterBounds(point)
        classval = ee.Algorithms.If(pt.size().gt(0),pt.first().get('cval'),0)

        admnames = ee.FeatureCollection("users/comimoapp/Shapes/Municipal_Bounds").filterBounds(point)
        admnames = ee.Algorithms.If(admnames.size().gt(0),[admnames.first().get('MPIO_CNMBR'),
                                                        admnames.first().get('DPTO_CNMBR')],[False,False])
        pa = ee.FeatureCollection("users/comimoapp/Shapes/RUNAP").filterBounds(point)
        pa = ee.Algorithms.If(pa.size().gt(0),[pa.first().get('categoria'),
                                               pa.first().get('nombre')],[False,False])
        npark = ee.FeatureCollection("users/comimoapp/Shapes/National_Parks").filterBounds(point)
        npark = ee.Algorithms.If(npark.size().gt(0),[npark.first().get('Name')],[False])
        oth_auth = ee.FeatureCollection("users/comimoapp/Shapes/Solicitudes_de_Legalizacion_2001")\
                  .merge(ee.FeatureCollection("users/comimoapp/Shapes/Solicitudes_de_Legalizacion_2010"))\
                  .filterBounds(point)
        oth_auth = ee.Algorithms.If(oth_auth.size().gt(0),[oth_auth.first().get('Name')],[False])
        legal_mine = ee.FeatureCollection("users/comimoapp/Shapes/Legal_Mines").filterBounds(point)
        legal_mine = ee.Algorithms.If(legal_mine.size().gt(0),[legal_mine.first().get('CODIGO_RMN')],[False])
        et1 = ee.FeatureCollection("users/comimoapp/Shapes/Tierras_de_comunidades_negras").filterBounds(point)
        et1 = ee.Algorithms.If(et1.size().gt(0),[et1.first().get('Name')],[False])
        vals = ee.List([classval]).cat(admnames).cat(pa).cat(npark).cat(oth_auth).cat(legal_mine).cat(et1).getInfo()
        return JsonResponse({'action':'Success','value':vals})
    except Exception as e:
        print(e)
        return JsonResponse({'action':'Error','message':'Something went wrong!'},status=500)
