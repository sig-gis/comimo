from subscribe.config import PLOT_SIZE, PROJ_CLASSES, PROJ_TITLE_PREFIX, CEO_GATEWAY_URL, CEO_CREATE
import requests
from datetime import datetime
import json

def getCeoProjectURL(points, latest_date, email):
    try:
        reqobj = {
            "classes": PROJ_CLASSES,
            "plots": getPlots(points),
            "title": "_".join([PROJ_TITLE_PREFIX, datetime.today().strftime("%Y-%m-%d"), email]),
            "plotSize": PLOT_SIZE
        }
        headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        resp = requests.post(CEO_GATEWAY_URL+CEO_CREATE, data=json.dumps(reqobj), headers=headers)
        proj = resp.text
        return json.loads(proj)
    except Exception as e:
        print(e)

def getPlots(points):
    features = points['features']
    plots = []
    for feature in features:
        coords = feature['geometry']['coordinates']
        lon = coords[0]
        lat = coords[1]
        plots.append({'lat':lat,'lon':lon})
    return plots
