from rest_framework import viewsets, permissions, parsers, status
from rest_framework.response import Response 
from .models import Resource
from .serializers import ResourceSerializer

class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    
    def get_queryset(self):
        return Resource.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # Добавь этот метод для отладки
    def create(self, request, *args, **kwargs):
        print("=== DEBUG CREATE RESOURCE ===")
        print("Content-Type:", request.content_type)
        print("POST data:", request.POST)
        print("FILES:", request.FILES)
        print("Data keys:", request.data.keys() if hasattr(request.data, 'keys') else 'not dict')
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
