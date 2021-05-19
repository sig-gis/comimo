from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100, blank=True)
    sector = models.CharField(max_length=100, blank=True)
    institution = models.CharField(max_length=100, blank=True)
    email = models.EmailField(max_length=150, unique=True)
    default_lang = models.CharField(max_length=4, default="es")

    def __str__(self):
        return str(self.user_id) + ' ' + self.user.username + ' - ' + self.full_name


@receiver(post_save, sender=User)
def update_profile_signal(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()
