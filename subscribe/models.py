from django.db import models
from datetime import datetime

class SubscribeModel(models.Model):
    sys_id = models.AutoField(primary_key=True, null=False, blank=True)
    email = models.EmailField(null=False, blank=True, max_length=200)
    region = models.CharField(max_length=200, null=False)
    last_alert_for = models.DateTimeField(null=False, blank=True)
    created_date = models.DateTimeField(null=False, blank=True)
    updated_date = models.DateTimeField(null=False, blank=True)
    mail_count = models.IntegerField(null=False, default=0)

    class Meta:
        app_label = "subscribe"
        db_table = "gmw_subscribe"

    def __str__(self):
        return self.email+' : '+self.region
