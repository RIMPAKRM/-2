from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovieViewSet, HallViewSet, SessionViewSet, BookingViewSet

router = DefaultRouter()
router.register(r'movies', MovieViewSet)
router.register(r'halls', HallViewSet)
router.register(r'sessions', SessionViewSet)
router.register(r'bookings', BookingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
