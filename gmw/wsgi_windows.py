activate_this = 'C:/Users/nkhanal/pyenv/Scripts/activate_this.py'
# execfile(activate_this, dict(__file__=activate_this))
exec(open(activate_this).read(),dict(__file__=activate_this))

import os
import sys
import site

# Add the site-packages of the chosen virtualenv to work with
site.addsitedir('C:/Users/nkhanal/pyenv/Lib/site-packages')


# Add the app's directory to the PYTHONPATH
sys.path.append('C:/Users/nkhanal/pyenv')
sys.path.append('C:/Users/nkhanal/pyenv/gmw')
sys.path.append('C:/Users/nkhanal/pyenv/gmw/gmw')

os.environ['DJANGO_SETTINGS_MODULE'] = 'gmw.settings'
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gmw.settings")

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
