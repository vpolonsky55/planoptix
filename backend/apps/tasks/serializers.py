from rest_framework import serializers
from .models import Task, TimeReminder
from apps.core.serializers import PersonSerializer, TagSerializer

class TaskSerializer(serializers.ModelSerializer):
    # Вложенные сериализаторы для связанных объектов
    assigned_people_detail = PersonSerializer(source='assigned_people', many=True, read_only=True)
    tags_detail = TagSerializer(source='tags', many=True, read_only=True)
    subtasks = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    task_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_subtasks(self, obj):
        """Возвращает подзадачи в виде дерева"""
        subtasks = obj.subtasks.all()
        return TaskSerializer(subtasks, many=True, context=self.context).data
    
    def get_level(self, obj):
        return obj.get_level()
    
    def get_task_type_display(self, obj):
        return obj.get_task_type_display()
    
    def create(self, validated_data):
        # Автоматически устанавливаем пользователя
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class TimeReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeReminder
        fields = '__all__'
        read_only_fields = ['created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)