# Colombian Mining Monitoring

## Canonical source

The source of Colombian Mining Monitoring (henceforth referred to as CoMiMo) is
[hosted on GitLab.com](https://gitlab.com/sig-gis/gold-mine-watch).

## Windows Installation

### Install git, python and venv

The first step is to install python (3.7.3+) with pip and git. After installing
and having the path added as environment variables install virtual environment.

```shell
pip install virtualenv
```

Now, to set up a new virtual environment, the following command can be used

```shell
virtualenv venv
```

*venv* can be replaced with the name of your choice.

### Clone the repo Install requirements

Now clone this repository into the system. Activate the virtual environment and
install the required packages using pip

```shell
source venv/bin/activate
pip install -r requirements.txt
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
sudo apt -y install python3 python3-venv npm
```

### Clone the repo and initialize virtual env / npm

```shell
git clone git@gitlab.com:sig-gis/gold-mine-watch.git
cd gold-mine-watch
python3 -m venv --prompt comimo venv/
source venv/bin/activate
pip install -r requirements.txt
deactivate
npm install
```

## Configuration

### Deployment specific configuration

Besides the installation and setup for the application there are a few things
required for the application to run and function properly. There are some files
that are not included in git repository but are essential to the working of the
application. You should create them using the steps below.

1. Create the proper files.

```shell
nano src/js/appConfig.js
nano subscribe/config.py
```

2. Fill in `src/js/appConfig.js`

This file contains the access details to your Mapbox and MapQuest accounts.
You should sign up for your own [Mapbox](https://www.mapbox.com/) and
[MapQuest](https://developer.mapquest.com/) accounts and generate a token for
each. Those tokens should then be copied to `src/js/appConfig.js` like so:

```javascript
export const mapboxToken = '<your access token>';
export const mapQuestKey = '<your key>';
```

3. Fill in `subscribe/config.py`

This file contains the configurations for the email client to be used as
well as the CEO related configurations. The secret key must be a large random
value and it must be kept secret.

```python
SECRET_KEY = 'gfsdflksjdfg43453kj3h45k3jh45k3h45'

EMAIL_HOST_USER = '<your email address>'
EMAIL_HOST_PASSWORD = '<your password>'
APP_URL = '<your app URL>'

CEO_GATEWAY_URL = 'http://127.0.0.1:3000/'
CEO_CREATE = "create-project/"
CEO_INFO = "get-project-stats/"
CEO_DELETE = "delete-project/"
CEO_GETDATA = "get-collected-data/"

PROJ_CLASSES = ['Mina','No Mina'] # list of classes for labelling
PLOT_SIZE = 540 # size of plots in meters for CEO Project
PROJ_IMAGERY = 1301 # default imagery selection
```

### Google Service Account Key

A major requirement for everything to work is a service account for Google
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
activate the address for service account on Google Earth Engine before using it.
Creating a key generates a JSON file that should be placed inside the folder
**api** with the name **gee-auth-key.json**.

IMPORTANT! remember to have the service account address whitelisted by Google
Earth Engine!

## Install and run CEO gateway

The project connects to CEO through an application package called CEO gateway
which uses our credentials to make changes to CEO projects such as create,
delete, get info, etc. To get set up with CEO gateway, please read the
instructions from [CEO gateway's README](https://gitlab.com/sig-gis/ceo-gateway).

Note that every time you wish to run CoMiMo, you need to first have
CEO gateway running in a separate terminal.

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
3. Run `python manage.py crontab add` to register cron events.

### Run Django

1. Compile js files with webpack `npm run webpack-[prod dev]`. When you are in
   dev mode make sure to run this command in a separate terminal since webpack-dev
   is a continually running process.
2. Run `python manage.py collectstatic` to collect the static files. Type `yes`
   to replace the existing files on prompt.
3. Run `python manage.py runserver [ip, default 127.0.0.1]:[port, default 8000]`
   to start the server. To have access to the server outside the local
   environment, start with the ip 0.0.0.0.

## Running https via nginx (optional)

### Install required packages

```shell
sudo apt -y install nginx uwsgi uwsgi-plugin-python3
```

### Copy the nginx template and update

```shell
sudo cp nginx/gmw-template.conf /etc/nginx/sites-available/gmw.conf
sudo ln -s /etc/nginx/sites-available/gmw.conf /etc/nginx/sites-enabled/
sudo nano /etc/nginx/sites-available/gmw.conf
sudo service nginx restart
```

### Diagnose errors with nginx by looking in the log

```shell
sudo less +G /var/log/nginx/error.log
```

### Running django under uwsgi

Instead of `python manage.py runserver`, use:

```shell
uwsgi --ini gmwuwsgi.ini
```
