from django.contrib import admin

# Register your models here.
from . import models

admin.site.register(models.SubscribeModel)
admin.site.register(models.ProjectsModel)
