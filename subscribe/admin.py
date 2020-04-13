from django.contrib import admin
from django.utils.translation import ugettext_lazy as _
from django.db.models import Q
from accounts.models import Profile
from django.contrib.admin import DateFieldListFilter

# Register your models here.
from . import models

class InputFilter(admin.SimpleListFilter):
    template = 'admin/input_filter.html'
    def lookups(self, request, model_admin):
        return ((),)
    def choices(self, changelist):
        all_choice = next(super().choices(changelist))
        all_choice['query_parts'] = (
            (k, v)
            for k, v in changelist.get_filters_params().items()
            if k != self.parameter_name
        )
        yield all_choice

class NameFilter(InputFilter):
    parameter_name = 'name'
    title = _('Project Name')

    def queryset(self, request, queryset):
        if self.value() is not None:
            name = self.value()
            return queryset.filter(Q(name__contains=name))
        else:
            return queryset

class UserFilter(InputFilter):
    parameter_name = 'user'
    title = _('User Name')

    def queryset(self, request, queryset):
        if self.value() is not None:
            name = self.value()
            return queryset.filter(Q(user__user__username__contains=name))
        else:
            return queryset

class StatusFilter(InputFilter):
    parameter_name = 'status'
    title = _('Status')

    def queryset(self, request, queryset):
        if self.value() is not None:
            name = self.value()
            return queryset.filter(Q(status__contains=name))
        else:
            return queryset

class RegionFilter(InputFilter):
    parameter_name = 'regions'
    title = _('Regions')

    def queryset(self, request, queryset):
        if self.value() is not None:
            name = self.value()
            return queryset.filter(Q(regions__contains=name))
        else:
            return queryset

class ProjectsAdmin(admin.ModelAdmin):
    search_fields = ('name', 'status', 'data_date', 'user__user__username')
    list_filter = (
        NameFilter,
        UserFilter,
        StatusFilter,
        RegionFilter,
        ('data_date', DateFieldListFilter)
    )

class ExtractedAdmin(admin.ModelAdmin):
    search_fields = ('user__user__username', 'data_date', 'class_name')
    list_filter = (
        UserFilter,
        ('data_date',DateFieldListFilter),
    )

admin.site.register(models.SubscribeModel)
admin.site.register(models.ProjectsModel,ProjectsAdmin)
admin.site.register(models.ExtractedData,ExtractedAdmin)
