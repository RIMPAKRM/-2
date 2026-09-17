from django.contrib import admin
from .models import Movie, Hall, Seat, Session, Booking


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ['title', 'genre', 'duration', 'rating', 'created_at']
    list_filter = ['genre', 'created_at']
    search_fields = ['title', 'description']


@admin.register(Hall)
class HallAdmin(admin.ModelAdmin):
    list_display = ['name', 'total_rows', 'seats_per_row', 'total_seats']


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ['hall', 'row', 'column', 'seat_type', 'price_multiplier']
    list_filter = ['hall', 'seat_type']


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['movie', 'hall', 'start_time', 'end_time', 'base_price', 'is_active']
    list_filter = ['movie', 'hall', 'is_active', 'start_time']
    date_hierarchy = 'start_time'


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['session', 'seat', 'status', 'created_at', 'expires_at', 'customer_name']
    list_filter = ['status', 'created_at', 'session']
    search_fields = ['customer_name', 'customer_email']

