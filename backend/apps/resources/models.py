from django.db import models
from django.contrib.auth.models import User
from apps.tasks.models import Task

class Resource(models.Model):
    """
    Модель для хранения файлов и ссылок, прикрепленных к задачам
    """
    RESOURCE_TYPES = [
        ('file', 'Файл'),
        ('link', 'Ссылка'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resources')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='task_resources')  # ← изменено
    
    resource_type = models.CharField(max_length=10, choices=RESOURCE_TYPES, verbose_name="Тип ресурса")
    
    # Для ссылки
    url = models.URLField(blank=True, null=True, verbose_name="URL")
    
    # Для файла
    file = models.FileField(upload_to='task_resources/', blank=True, null=True, verbose_name="Файл")
    
    # Общие поля
    name = models.CharField(max_length=255, verbose_name="Название")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")
    
    class Meta:
        verbose_name = "Ресурс"
        verbose_name_plural = "Ресурсы"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def clean(self):
        """
        Валидация: для ссылки должен быть url, для файла - file
        """
        from django.core.exceptions import ValidationError
        if self.resource_type == 'link' and not self.url:
            raise ValidationError("Для типа 'Ссылка' необходимо указать URL")
        if self.resource_type == 'file' and not self.file:
            raise ValidationError("Для типа 'Файл' необходимо загрузить файл")