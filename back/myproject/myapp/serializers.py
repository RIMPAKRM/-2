from rest_framework import serializers
from .models import Movie, Hall, Seat, Session, Booking


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'duration', 'poster_url', 'genre', 'rating', 'created_at']
        read_only_fields = ['created_at']


class HallSerializer(serializers.ModelSerializer):
    total_seats = serializers.ReadOnlyField()

    class Meta:
        model = Hall
        fields = ['id', 'name', 'total_rows', 'seats_per_row', 'total_seats']


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'hall', 'row', 'column', 'seat_type', 'price_multiplier']


class SessionSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)
    available_seats_count = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = ['id', 'movie', 'movie_title', 'hall', 'hall_name', 'start_time', 'end_time', 
                  'base_price', 'is_active', 'available_seats_count']

    def get_available_seats_count(self, obj):
        return obj.available_seats.count()


class SessionDetailSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    hall = HallSerializer(read_only=True)
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = ['id', 'movie', 'hall', 'start_time', 'end_time', 'base_price', 'is_active', 'available_seats']

    def get_available_seats(self, obj):
        from django.utils import timezone
        booked_seats = Booking.objects.filter(
            session=obj,
            status='confirmed',
            expires_at__gt=timezone.now()
        ).values_list('seat', flat=True)
        available = obj.hall.seats.exclude(id__in=booked_seats)
        return SeatSerializer(available, many=True).data


class BookingSerializer(serializers.ModelSerializer):
    seat_details = SeatSerializer(source='seat', read_only=True)
    session_details = SessionSerializer(source='session', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'session', 'seat', 'seat_details', 'session_details', 'status', 
                  'created_at', 'expires_at', 'customer_name', 'customer_email', 'city', 'is_expired']
        read_only_fields = ['created_at', 'expires_at', 'status']


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['session', 'seat', 'customer_name', 'customer_email', 'city']

    def validate(self, data):
        session = data['session']
        seat = data['seat']

        if seat.hall != session.hall:
            raise serializers.ValidationError("Seat does not belong to this session's hall.")

        from django.utils import timezone
        existing_booking = Booking.objects.filter(
            session=session,
            seat=seat,
            status='confirmed',
            expires_at__gt=timezone.now()
        ).first()

        if existing_booking:
            raise serializers.ValidationError("This seat is already booked.")

        return data
