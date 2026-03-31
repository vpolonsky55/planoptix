from django.contrib import admin
from .models import Task, TimeReminder  # Обе модели должны быть импортированы

class SubtaskInline(admin.TabularInline):
    model = Task
    fk_name = 'parent_task'
    extra = 1
    fields = ['title', 'completed']
    verbose_name = "Подзадача"
    verbose_name_plural = "Подзадачи"

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'get_task_type_display', 'completed', 'created_at', 'scheduled_end')
    list_filter = ('completed', 'created_at')
    search_fields = ('title', 'description')
    filter_horizontal = ('assigned_people', 'tags')
    readonly_fields = ('created_at', 'updated_at', 'get_task_type_display')
    fieldsets = (
        ('Основное', {
            'fields': ('user', 'title', 'description', 'get_task_type_display', 'completed')
        }),
        ('Связи', {
            'fields': ('parent_task', 'assigned_people', 'tags')
        }),
        ('Время', {
            'fields': ('scheduled_start', 'scheduled_end', 'actual_start', 'actual_end')
        }),
        ('Служебное', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    inlines = [SubtaskInline]
    
    def get_task_type_display(self, obj):
        return obj.get_task_type_display()
    get_task_type_display.short_description = "Тип задачи"

@admin.register(TimeReminder)
class TimeReminderAdmin(admin.ModelAdmin):
    list_display = ('task', 'remind_at', 'is_sent')
    list_filter = ('is_sent', 'remind_at')
    search_fields = ('task__title',)