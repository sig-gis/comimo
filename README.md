# Colombian Mining Monitoring

## Canonical source

The source of Colombian Mining Monitoring (henceforth referred to as CoMiMo) is
[hosted on GitLab.com](https://gitlab.com/sig-gis/gold-mine-watch).

## Windows Installation

### Install git, python and venv

The first step is to install python (3.7.3+) with pip and git. After installing
and having the path added as environment variables install virtual environment.

```python
pip install virtualenv
```

Now, to set up a new virtual environment, the following command can be used

```shell
virtualenv venv
```

*venv* can be replaced witht the name of your choice.

### Clone the repo Install requirements

Now clone this repository into the system. Activate the virtual environment and
install the required packages using pip

```shell
(venv)$ pip install -r requirements.txt
```

### Running django through IIS

Feed the application through wfastcgi and IIS

Some resources on how-to:

[https://medium.com/@Jonny_Waffles/deploy-django-on-iis-def658beae92](https://medium.com/@Jonny_Waffles/deploy-django-on-iis-def658beae92)

[https://nitinnain.com/setting-up-and-running-django-on-windows-iis-server/](https://nitinnain.com/setting-up-and-running-django-on-windows-iis-server/)

[https://medium.com/@ayushi21095/steps-to-deploy-python-django-web-application-on-windows-iis-server-379b2b87fcf9](https://medium.com/@ayushi21095/steps-to-deploy-python-django-web-application-on-windows-iis-server-379b2b87fcf9)

## Ubuntu Installation

### Required packages

```shell
sudo apt install python3 python3-venv
```

### Clone the repo and initialize virtual env

```shell
git clone git@gitlab.com:sig-gis/gold-mine-watch.git
cd gold-mine-watch
python3 -m venv --prompt comimo venv/
source venv/bin/activate
pip install -r requirements.txt
deactivate
```

## Configuration

### Deployment specific configuration

Besides the installation and setup for the application there are a few things
required for the application to run and function  properly. There are some files
that are not included in git repository but are essential to the working of the
application.

```shell
nano gmw/statics/js/appconfigs.js
nano api/config.py
nano subscribe/config.py
```

1. gmw/statics/js/appconfigs.js

This file contains the access details to your mapbox and mapquest accounts.

```text
mapboxgl.accessToken = '<your access token>';
mapquestkey = '<your key>'
```

2. api/config.py

This file is intended to contain all the GEE assets relevant to your project
and should look something like this

```text
# repository containing all the gold mine rasters
IMAGE_REPO = 'users/[user]/GoldMineProbabilities'
# asset for legal mines to load as layer
LEGAL_MINES = 'users/[user]/Shapes/Legal_Mines'
# asset folder that stores
POINTS_FOL = 'users/[user]/GoldMinePoints'
# levels refer to identifier prefixes for the application
LEVELS = {
    'mun' : 'users/[user]/Shapes/Level2',
    'l0' : 'users/[user]/Shapes/Level0'
}
# fields are the field names that contain names of the units
FIELDS = {
    'mun' : 'admin2Name'
}
```

3. subscribe/config.py

This file contains the configurations for all the email client to be used as
well as the CEO related configurations.

```text
EMAIL_HOST_USER = '<your email address>'
EMAIL_HOST_PASSWORD = '<your password>'
APP_URL = '<your app URL>'

CEO_GATEWAY_URL = 'http://127.0.0.1:3000/'
CEO_CREATE = "create-project/"
CEO_INFO = "get-project-stats/"
CEO_DELETE = "delete-project/"
CEO_GETDATA = "get-collected-data/"

PROJ_TITLE_PREFIX = '<prefix for project title>' # to identify in CEO website
PROJ_CLASSES = ['MINE','NOT MINE'] # list of classes for labelling
PLOT_SIZE = 500 # size of plots in meters for CEO Project
```

### Google Service Account Key

A major requirement for everything to work is a service account for google
services to work with GEE.

#### Development

You can use your personal Earth Engine account to log in for access to the GEE
scripts. To do so, use the earth engine command line process. This command will
launch your browser to log in and generate an auth token. Enter this token into
the terminal to save it. You will be able to run the comimo server locally with
this authentication.

```shell
cd gold-mine-watch
source venv/bin/activate
earthengine authenticate
```

#### Production

A service account key can be created from Google developer console. Make sure to
activate the address for service account on google earth engine before using it.
Creating a key generates a json file that should be placed inside the folder
**api** with the name **gee-auth-key.json**.

IMPORTANT! remember to have the service account address whitelisted by Google earth engine!

## Install and run CEO gateway

The project connects to CEO through an application package called CEO gateway
which uses our credentials to make changes to CEO projects such as create,
delete, get info, etc. The gateway can be cloned from here
<https://github.com/rfontanarosa/ceo-gateway>

**src/config.js** needs to be configured with CEO details before it can properly
function.

To activate navigate to the project directory and run `npm run start`

```shell
git@github.com:rfontanarosa/ceo-gateway.git
cd ceo-gateway
nano src/config.js
npm run start
```

## Starting and running the django server

### Enter virtual environment

Navigate to the project directory, and enter the virtual environment.

```shell
cd gold-mine-watch
source venv/bin/activate
```

### Initialize Django

These steps only need to be done once after the server is set up.

1. Run `python manage.py migrate` to create the sqlite DB
2. Run `python manage.py createsuperuser` to create the initial super user.

### Run Django

1. Run `python manage.py collectstatic` to collect the static files. Type yes to
   replace the existing files on prompt.
2. Run `python manage.py runserver [ip, default 127.0.0.1]:[port, default 8000]`
   to start the server. To have access to the server outside the local
   environment start with the ip 0.0.0.0.

### Setting up cronjobs/scheduled tasks

**WIP**
