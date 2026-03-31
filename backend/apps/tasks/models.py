from django.db import models
from django.contrib.auth.models import User
from apps.core.models import Person, Tag  # Place добавим позже

class Task(models.Model):
    """
    Основная модель для задач с поддержкой иерархии
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    
    # Иерархия
    parent_task = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='subtasks'
    )
    
    # Основные поля
    title = models.CharField(max_length=200, verbose_name="Название")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")
    
    # Статус выполнения
    completed = models.BooleanField(default=False, verbose_name="Выполнено")
    
    # Связи с другими таблицами
    assigned_people = models.ManyToManyField(
        Person, 
        blank=True, 
        related_name='assigned_tasks',
        verbose_name="Участники"
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='tasks', verbose_name="Теги")
    
    # Временные метки
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Время создания")
    scheduled_start = models.DateTimeField(null=True, blank=True, verbose_name="Запланированное начало")
    scheduled_end = models.DateTimeField(null=True, blank=True, verbose_name="Запланированное окончание")
    actual_start = models.DateTimeField(null=True, blank=True, verbose_name="Фактическое начало")
    actual_end = models.DateTimeField(null=True, blank=True, verbose_name="Фактическое завершение")
    
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Время обновления")
    
    class Meta:
        verbose_name = "Задача"
        verbose_name_plural = "Задачи"
        ordering = ['-created_at']
    
    def __str__(self):
        prefix = "✓ " if self.completed else "○ "
        level_prefix = "  " * (self.get_level())
        return f"{level_prefix}{prefix}{self.title}"
    
    def get_level(self):
        """
        Вычисляет уровень вложенности задачи
        """
        level = 0
        task = self
        while task.parent_task:
            level += 1
            task = task.parent_task
        return level
    
    def get_task_type_display(self):
        """
        Возвращает текстовое описание типа задачи на основе уровня
        """
        level = self.get_level()
        if level == 0:
            return "Простое действие"
        elif level == 1:
            return "Составная задача"
        elif level >= 2:
            return f"Комплексная задача (уровень {level + 1})"
    
    def save(self, *args, **kwargs):
        """
        Переопределяем save для обновления статуса родительских задач
        """
        super().save(*args, **kwargs)
        if self.parent_task:
            self.parent_task.update_completion_status()
    
    def update_completion_status(self):
        """
        Обновляет статус выполнения на основе подзадач
        """
        if self.subtasks.exists():
            all_completed = all(sub.completed for sub in self.subtasks.all())
            if all_completed != self.completed:
                self.completed = all_completed
                self.save(update_fields=['completed'])
                if self.parent_task:
                    self.parent_task.update_completion_status()


class TimeReminder(models.Model):
    """
    Отдельная таблица для напоминаний
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='reminders')
    remind_at = models.DateTimeField(verbose_name="Время напоминания")
    is_sent = models.BooleanField(default=False, verbose_name="Отправлено")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Напоминание"
        verbose_name_plural = "Напоминания"
        ordering = ['remind_at']
    
    def __str__(self):
        return f"Напоминание для '{self.task.title}' на {self.remind_at}"