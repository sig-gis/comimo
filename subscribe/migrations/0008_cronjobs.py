# Generated by Django 3.1.7 on 2021-03-22 22:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscribe', '0007_auto_20200412_1142'),
    ]

    operations = [
        migrations.CreateModel(
            name='CronJobs',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('job_date', models.DateTimeField()),
                ('finish_message', models.CharField(max_length=500)),
            ],
            options={
                'db_table': 'gmw_cron_jobs',
            },
        ),
    ]
