from django.contrib import admin
from .models import Profile


class ProfileAdmin(admin.ModelAdmin):
    search_fields = ('email', 'full_name', 'user__email',
                     'institution', 'sector', 'default_lang')


admin.site.register(Profile, ProfileAdmin)
