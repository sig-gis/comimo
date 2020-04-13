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
    projid = models.IntegerField(null=False)
    projurl = models.TextField(null=False)
    name = models.TextField(null=False)
    regions = models.TextField(null=False)
    data_date =  models.DateTimeField(null=False)
    created_date =  models.DateTimeField(null=False, blank=True)
    status =  models.TextField(null=False, default='active')

    class Meta:
        app_label = "subscribe"
        db_table = "gmw_projects"

    def __str__(self):
        return '('+self.status+') '+self.name+' : '+self.user.user.username+' - '+self.data_date.strftime('%Y-%m-%d')

class ExtractedData(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    y = models.FloatField(null=False)
    x = models.FloatField(null=False)
    data_date = models.DateTimeField(null=False)
    class_num = models.CharField(max_length=2,null=False)
    class_name = models.CharField(max_length=10, null=False)

    class Meta:
        app_label = "subscribe"
        db_table = "gmw_extracted_data"

    def __str__(self):
        return str(self.id)+' - '+self.class_name+' by '+self.user.user.username
