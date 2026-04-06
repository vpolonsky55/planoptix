from django.contrib import admin
from .models import Place

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'address')