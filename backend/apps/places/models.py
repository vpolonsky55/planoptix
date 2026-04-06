from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Place(models.Model):
    """
    Модель для хранения мест (локаций)
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='places')
    name = models.CharField(max_length=200, verbose_name="Название места")
    address = models.TextField(verbose_name="Адрес")
    latitude = models.FloatField(blank=True, null=True, verbose_name="Широта")
    longitude = models.FloatField(blank=True, null=True, verbose_name="Долгота")
    notes = models.TextField(blank=True, null=True, verbose_name="Заметки")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        verbose_name = "Место"
        verbose_name_plural = "Места"
        ordering = ['name']
    
    def __str__(self):
        return self.name