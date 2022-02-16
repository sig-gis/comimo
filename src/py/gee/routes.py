from distutils.util import strtobool
import json

from gee.utils import initialize


def safeListGet(l, idx, default=None):
    try:
        return l[idx]
    except IndexError:
        return default


def getDefault(dict, key, default=None):
    val = dict.get(key)
    if val is None or val == '':
        return default
    else:
        return val

def blankRoute():
    return 'hello world'
