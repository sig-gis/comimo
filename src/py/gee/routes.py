import ee
import re
from config import IMAGE_REPO, LEVELS, FIELDS
from utils import getImageList, subscribedRegionsToFC



def getInfo(request):
    try:
        dates = request.get('dates')
        visible = request.get('visibleLayers')
        lat = float(request.get('lat'))
        lon = float(request.get('lon'))
        point = ee.Geometry.Point(lon, lat)
        pointFeature = ee.Feature(point)

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

        return {'action': 'Success', 'value': vals}
    except Exception as e:
        print(e)
        return {'action': 'Error', 'message': 'Something went wrong!'}
