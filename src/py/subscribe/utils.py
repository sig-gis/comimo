import logging
import traceback
import pytz
from datetime import datetime


def insertCollectedData(profile, data, project):
    try:
        data_instance = ExtractedData()
        data_instance.user = profile
        data_instance.project = project
        data_instance.y = float(data[1])
        data_instance.x = float(data[2])
        data_instance.data_layer = project.data_layer
        data_instance.project_name = project.name
        data_instance.class_num = data[3]
        data_instance.class_name = data[4]
        data_instance.save()
        return 'Created'
    except Exception as e:
        print(e)
        logging.getLogger("error").error(traceback.format_exc())
        return 'Error'
