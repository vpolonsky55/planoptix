from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Task, TimeReminder
from .serializers import TaskSerializer, TimeReminderSerializer

class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet для работы с задачами"""
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Возвращаем только корневые задачи (без parent_task) для списка
        # Полное дерево можно получить через отдельный эндпоинт
        return Task.objects.filter(
            user=self.request.user,
            parent_task__isnull=True
        )
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Отметить задачу как выполненную"""
        task = self.get_object()
        task.completed = True
        task.actual_end = timezone.now()
        task.save()
        return Response({'status': 'completed'})
    
    @action(detail=True, methods=['post'])
    def incomplete(self, request, pk=None):
        """Отметить задачу как невыполненную"""
        task = self.get_object()
        task.completed = False
        task.actual_end = None
        task.save()
        return Response({'status': 'incomplete'})
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Задачи на сегодня"""
        today = timezone.now().date()
        tasks = Task.objects.filter(
            user=request.user,
            scheduled_start__date=today
        )
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
 
    @action(detail=False, methods=['get'])
    def all(self, request):
        """Возвращает все задачи пользователя (для выбора родителя)"""
        tasks = Task.objects.filter(user=request.user)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

class TimeReminderViewSet(viewsets.ModelViewSet):
    """ViewSet для работы с напоминаниями"""
    serializer_class = TimeReminderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TimeReminder.objects.filter(task__user=self.request.user)
    
    def perform_create(self, serializer):
        # Проверяем, что задача принадлежит пользователю
        task = serializer.validated_data['task']
        if task.user != self.request.user:
            raise permissions.PermissionDenied("Это не ваша задача")
        serializer.save()