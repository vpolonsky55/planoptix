from django.contrib import admin
from .models import Person, Tag

# Register your models here.

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'phone', 'email', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('first_name', 'last_name', 'phone', 'email')
    readonly_fields = ('created_at',)

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name',)
