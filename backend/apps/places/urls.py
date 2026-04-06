from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'places', views.PlaceViewSet, basename='place')

urlpatterns = [
    path('', include(router.urls)),
]