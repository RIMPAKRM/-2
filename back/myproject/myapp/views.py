from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Movie, Hall, Seat, Session, Booking
from .serializers import (
    MovieSerializer, HallSerializer, SeatSerializer, 
    SessionSerializer, SessionDetailSerializer, 
    BookingSerializer, BookingCreateSerializer
)


class MovieViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer


class HallViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hall.objects.all()
    serializer_class = HallSerializer


class SessionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Session.objects.filter(is_active=True)
    serializer_class = SessionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        movie_id = self.request.query_params.get('movie')
        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = SessionDetailSerializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def available_seats(self, request, pk=None):
        session = self.get_object()
        booked_seats = Booking.objects.filter(
            session=session,
            status='confirmed',
            expires_at__gt=timezone.now()
        ).values_list('seat', flat=True)
        available = session.hall.seats.exclude(id__in=booked_seats)
        serializer = SeatSerializer(available, many=True)
        return Response(serializer.data)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        session = serializer.validated_data['session']
        seat = serializer.validated_data['seat']
        
        # Optimistic booking - check for conflicts
        from django.db import transaction
        try:
            with transaction.atomic():
                # Check again within transaction for race condition
                existing_booking = Booking.objects.filter(
                    session=session,
                    seat=seat,
                    status='confirmed',
                    expires_at__gt=timezone.now()
                ).select_for_update().first()
                
                if existing_booking:
                    return Response(
                        {'error': 'This seat is already booked by another user.'},
                        status=status.HTTP_409_CONFLICT
                    )
                
                # Create the booking
                booking = serializer.save(status='confirmed')
                
                return Response(
                    BookingSerializer(booking).data,
                    status=status.HTTP_201_CREATED
                )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        city = request.query_params.get('city')
        queryset = self.queryset.filter(status='confirmed', expires_at__gt=timezone.now())
        
        if city:
            queryset = queryset.filter(city=city)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'confirmed':
            return Response(
                {'error': 'Only confirmed bookings can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.save()
        return Response(BookingSerializer(booking).data)
