from subscribe.config import *
import requests
from datetime import datetime
import json

def getCeoProjectURL(points, latest_date, email, name):
    try:
        reqobj = {
            "classes": PROJ_CLASSES,
            "plots": getPlots(points),
            "title": "_".join([PROJ_TITLE_PREFIX, datetime.today().strftime("%Y-%m-%d"), email, name]),
            "plotSize": PLOT_SIZE,
            # "baseMapSource": PROJ_DEFAULT_BM
        }
        headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        resp = requests.post(CEO_GATEWAY_URL+CEO_CREATE, data=json.dumps(reqobj), headers=headers)
        proj = resp.text
        # print(reqobj)
        print("proj",proj)
        return json.loads(proj)
    except Exception as e:
        print(e)

def getPlots(points):
    import random
    features = points['features']
    plots = []
    for feature in features:
        coords = feature['geometry']['coordinates']
        lon = coords[0]
        lat = coords[1]
        plots.append({'lat':lat,'lon':lon})
    random.shuffle(plots)
    return plots

def getProjectInfo(pid):
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    resp = requests.get(CEO_GATEWAY_URL+CEO_INFO+pid, headers=headers)
    return json.loads(resp.text)

def getCollectedData(pid):
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    resp = requests.get(CEO_GATEWAY_URL+CEO_GETDATA+pid, headers=headers)
    csv = resp.text.split('\n')
    csv = list(map(lambda x: x.split(','), csv))
    csv = list(filter(lambda x: x[3] != '',csv))
    return csv

def deleteProject(pid):
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    print(CEO_GATEWAY_URL+CEO_DELETE+pid)
    resp = requests.get(CEO_GATEWAY_URL+CEO_DELETE+pid, headers=headers)
    return resp.text
