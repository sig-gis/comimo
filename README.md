
# Colombian Mining Monitoring

## Cannonical source
The source of Colombian Mining Monitoring (henceforth referred to as CoMiMo) is [hosted on GitLab.com](https://gitlab.com/sig-gis/gold-mine-watch).

## Installation
**WIP**
### Install python and venv
### Install gdal
### Install requirements
### Install and run CEO gateway
### Fetch the repo
### Additional requirements
Besides the installation and setup for the application there are a few things required for the application to run and function properly. There are some files that are not included in git repository but are essential to the working of the application.

 1. gmw/statics/js/appconfigs.js
This file contains the access details to your mapbox and mapquest accounts.
```
mapboxgl.accessToken = '<your access token>';
mapquestkey = '<your key>'
```
2. api/gee-auth-key.json
Your service account key obrained from google developer console. Make sure to activate the address for service account on google earth engine before using it. 

3. api/config.py
This file is intended to contain all the GEE assets relevant to your project and should look something like this
```
# repository containing all the gold mine rasters
IMAGE_REPO = 'users/nk-sig/GoldMineProbabilities'
# asset for legal mines to load as layer
LEGAL_MINES = 'users/nk-sig/Shapes/Legal_Mines'
# asset folder that stores 
POINTS_FOL = 'users/nk-sig/GoldMinePoints'
# levels refer to identifier prefixes for the application
LEVELS = {
    'mun' : 'users/nk-sig/Shapes/Level2',
    'l0' : 'users/nk-sig/Shapes/Level0'
}
# fields are the field names that contain names of the units
FIELDS = {
    'mun' : 'admin2Name'
}
```
4. subscribe/config.py
This file contains the configurations for all the email client to be used as well as the CEO related configurations.
```
EMAIL_HOST_USER = '<your email address>'
EMAIL_HOST_PASSWORD = '<your password>'
APP_URL = '<your app URL>'

CEO_GATEWAY_URL = '<CEO gateway app URL>'
CEO_CREATE = "create-project/"
CEO_INFO = "get-project-stats/"
CEO_DELETE = "delete-project/"
CEO_GETDATA = "get-collected-data/"

PROJ_TITLE_PREFIX = '<prefix for project title>' # to identify in CEO website
PROJ_CLASSES = ['MINE','NOT MINE'] # list of classes for labelling
PLOT_SIZE = 500 # size of plots in meters for CEO Project
```
### Starting and running the django server
1. Run `python manage.py collectstatic` to collect the static files. Type yes to replace the existing files on prompt.
**WIP**

### Setting up cronjobs/scheduled tasks
**WIP**