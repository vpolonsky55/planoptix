from django.shortcuts import render

from rest_framework import viewsets, permissions
from .models import Person, Tag
from .serializers import PersonSerializer, TagSerializer

class PersonViewSet(viewsets.ModelViewSet):
    """ViewSet для работы с контактами"""
    serializer_class = PersonSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Пользователь видит только свои контакты
        return Person.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TagViewSet(viewsets.ModelViewSet):
    """ViewSet для работы с тегами"""
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)