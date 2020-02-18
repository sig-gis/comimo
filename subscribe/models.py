from django.db import models
from datetime import datetime
from accounts.models import Profile

class SubscribeModel(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    region = models.CharField(max_length=200, null=False)
    level = models.CharField(max_length=20)
    last_alert_for = models.DateTimeField(null=False, blank=True)
    created_date = models.DateTimeField(null=False, blank=True)
    updated_date = models.DateTimeField(null=False, blank=True)
    mail_count = models.IntegerField(null=False, default=0)

    class Meta:
        app_label = "subscribe"
        db_table = "gmw_subscribe"

    def __str__(self):
        return self.user.user.username+' : '+self.region


class ProjectsModel(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    projurl = models.TextField(null=False)
    data_date =  models.DateTimeField(null=False, blank=True)
    created_date =  models.DateTimeField(null=False, blank=True)
    status =  models.TextField(null=False, default='active')

    class Meta:
        app_label = "subscribe"
        db_table = "gmw_projects"

    def __str__(self):
        return self.user.user.username+' : '+self.projurl
