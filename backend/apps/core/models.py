from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Person(models.Model):
    """
    Модель для хранения информации о людях (контактах)
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='persons')
    first_name = models.CharField(max_length=100, verbose_name="Имя")
    last_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Фамилия")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Телефон")
    email = models.EmailField(blank=True, null=True, verbose_name="Email")
    address = models.TextField(blank=True, null=True, verbose_name="Адрес")
    photo = models.ImageField(upload_to='persons/', blank=True, null=True, verbose_name="Фото")
    notes = models.TextField(blank=True, null=True, verbose_name="Заметки")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        verbose_name = "Контакт"
        verbose_name_plural = "Контакты"
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name or ''}".strip()
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name or ''}".strip()


class Tag(models.Model):
    """
    Универсальные теги для всего
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=50, verbose_name="Название тега")
    color = models.CharField(max_length=7, default='#6c757d', verbose_name="Цвет (HEX)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        verbose_name = "Тег"
        verbose_name_plural = "Теги"
        ordering = ['name']
        unique_together = ['user', 'name']
    
    def __str__(self):
        return self.name
