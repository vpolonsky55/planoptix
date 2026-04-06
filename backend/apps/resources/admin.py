from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Resource

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'task', 'resource_type', 'created_at')
    list_filter = ('resource_type', 'created_at')
    search_fields = ('name', 'task__title')