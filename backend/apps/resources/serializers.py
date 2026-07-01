from rest_framework import serializers
from .models import Resource

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'
        read_only_fields = ['user', 'created_at']
    
    # def validate(self, data):
    #     # Проверяем, что для ссылки есть URL, для файла - файл
    #     resource_type = data.get('resource_type')
        
    #     if resource_type == 'link':
    #         if not data.get('url'):
    #             raise serializers.ValidationError("Для типа 'Ссылка' необходимо указать URL")
    #         # Если это ссылка, удаляем файл из данных (если он вдруг есть)
    #         data.pop('file', None)
        
    #     elif resource_type == 'file':
    #         if not data.get('file'):
    #             raise serializers.ValidationError("Для типа 'Файл' необходимо загрузить файл")
    #         # Если это файл, удаляем URL из данных (если он вдруг есть)
    #         data.pop('url', None)
        
    #     return data
    
    def create(self, validated_data):
        # Устанавливаем пользователя
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)