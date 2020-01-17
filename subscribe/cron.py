from django_cron import CronJobBase, Schedule

class GoldAlerts(CronJobBase):
    RUN_EVERY_MINS = 1 # every 1 min

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'gmw.cronalerts'    # a unique code

    def do(self):
        print('#$#$#$#$#$#$#$#$#$#$#$#$#$#$ testing out cron #$#$#$#$#$#$#$#$#$#$#$#$#$#$#$#$#$#$')
        pass    # do your thing here
