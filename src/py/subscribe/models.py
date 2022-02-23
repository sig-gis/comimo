from django.db import models
from accounts.models import Profile


class ExtractedData(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    project = models.ForeignKey(
        ProjectsModel, on_delete=models.CASCADE, null=True)
    # Latitude
    x = models.FloatField(null=False)
    # Longitude
    y = models.FloatField(null=False)
    data_layer = models.CharField(max_length=25, default='')
    class_num = models.CharField(max_length=2, null=False)
    class_name = models.CharField(max_length=10, null=False)
    project_name = models.TextField(null=False)

    class Meta:
        app_label = "subscribe"
        db_table = "gmw_extracted_data"

    def __str__(self):
        return str(self.id) + ' - ' + self.data_layer + ' - ' + self.class_name + ' by ' + self.user.user.username
