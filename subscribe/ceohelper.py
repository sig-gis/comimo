import requests
import json
from subscribe.config import PROJ_CLASSES, PLOT_SIZE, PROJ_IMAGERY, CEO_GATEWAY_URL, CEO_CREATE, CEO_INFO, CEO_GETDATA, CEO_DELETE
from datetime import datetime


def getPlots(points):
    import random
    features = points['features']
    plots = []
    for feature in features:
        try:
            coords = feature['geometry']['coordinates']
            lon = coords[0]
            lat = coords[1]
            plots.append({'lat': lat, 'lon': lon})
        except Exception as e:
            print("issue with feature:", feature)
    random.shuffle(plots)
    return plots


def createCEOProject(points, title):
    try:
        reqobj = {
            "classes": PROJ_CLASSES,
            "plots": getPlots(points),
            "title": title,
            "plotSize": PLOT_SIZE,
            "imageryId": PROJ_IMAGERY
        }
        headers = {'Content-type': 'application/json',
                   'Accept': 'application/json'}
        resp = requests.post(CEO_GATEWAY_URL + CEO_CREATE,
                             data=json.dumps(reqobj),
                             headers=headers,
                             timeout=300)
        return json.loads(resp.text)
    except Exception as e:
        print(e)


def getProjectInfo(pid):
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    resp = requests.get(CEO_GATEWAY_URL + CEO_INFO + str(pid), headers=headers)
    return json.loads(resp.text)


def getCollectedData(pid):
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    resp = requests.get(CEO_GATEWAY_URL + CEO_GETDATA + str(pid),
                        headers=headers)
    if (resp.status_code == 200):
        csv = resp.text.split('\n')
        csv = list(map(lambda x: x.split(','), csv))
        csv = list(filter(lambda x: x[3] != '', csv))
        return csv
    else:
        return list()


def deleteProject(pid):
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    resp = requests.get(CEO_GATEWAY_URL + CEO_DELETE + str(pid),
                        headers=headers)
    return resp.text
