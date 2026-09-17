from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta, time
from myapp.models import Movie, Hall, Seat, Session, Booking

class Command(BaseCommand):
    help = 'Seed database with sample movies, halls, seats, and sessions'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Clear existing data
        Booking.objects.all().delete()
        Session.objects.all().delete()
        Seat.objects.all().delete()
        Hall.objects.all().delete()
        Movie.objects.all().delete()
        
        # Create movies
        movie1 = Movie.objects.create(
            title='Дюна: Часть вторая',
            description='Пол Дрейден Атрейдес объединяется с Чани и фрименами, чтобы отомстить заговорщикам, уничтожившим его семью.',
            duration=166,
            poster_url='https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
            genre='Фантастика',
            rating=8.5
        )
        
        movie2 = Movie.objects.create(
            title='Оппенгеймер',
            description='История американского учёного Роберта Оппенгеймера и его роли в разработке атомной бомбы.',
            duration=180,
            poster_url='https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
            genre='Драма',
            rating=8.9
        )
        
        self.stdout.write(f'Created movies: {movie1.title}, {movie2.title}')
        
        # Create halls
        hall1 = Hall.objects.create(
            name='Зал 1',
            total_rows=10,
            seats_per_row=12
        )
        
        hall2 = Hall.objects.create(
            name='Зал 2',
            total_rows=8,
            seats_per_row=10
        )
        
        self.stdout.write(f'Created halls: {hall1.name}, {hall2.name}')
        
        # Create seats for Hall 1
        for row in range(1, hall1.total_rows + 1):
            for col in range(1, hall1.seats_per_row + 1):
                if row <= 2:
                    seat_type = 'premium'
                    price_multiplier = 1.5
                elif row <= 5:
                    seat_type = 'vip'
                    price_multiplier = 1.3
                else:
                    seat_type = 'standard'
                    price_multiplier = 1.0
                
                Seat.objects.create(
                    hall=hall1,
                    row=row,
                    column=col,
                    seat_type=seat_type,
                    price_multiplier=price_multiplier
                )
        
        # Create seats for Hall 2
        for row in range(1, hall2.total_rows + 1):
            for col in range(1, hall2.seats_per_row + 1):
                if row <= 2:
                    seat_type = 'premium'
                    price_multiplier = 1.5
                elif row <= 4:
                    seat_type = 'vip'
                    price_multiplier = 1.3
                else:
                    seat_type = 'standard'
                    price_multiplier = 1.0
                
                Seat.objects.create(
                    hall=hall2,
                    row=row,
                    column=col,
                    seat_type=seat_type,
                    price_multiplier=price_multiplier
                )
        
        self.stdout.write(f'Created seats: {hall1.total_seats + hall2.total_seats} total')
        
        # Create sessions for today and tomorrow
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        
        # Movie 1 sessions
        Session.objects.create(
            movie=movie1,
            hall=hall1,
            start_time=timezone.make_aware(datetime.combine(today, time(hour=10))),
            end_time=timezone.make_aware(datetime.combine(today, time(hour=13))),
            base_price=300,
            is_active=True
        )
        
        Session.objects.create(
            movie=movie1,
            hall=hall1,
            start_time=timezone.make_aware(datetime.combine(today, time(hour=14))),
            end_time=timezone.make_aware(datetime.combine(today, time(hour=17))),
            base_price=300,
            is_active=True
        )
        
        Session.objects.create(
            movie=movie1,
            hall=hall2,
            start_time=timezone.make_aware(datetime.combine(today, time(hour=16))),
            end_time=timezone.make_aware(datetime.combine(today, time(hour=19))),
            base_price=350,
            is_active=True
        )
        
        Session.objects.create(
            movie=movie1,
            hall=hall1,
            start_time=timezone.make_aware(datetime.combine(tomorrow, time(hour=10))),
            end_time=timezone.make_aware(datetime.combine(tomorrow, time(hour=13))),
            base_price=300,
            is_active=True
        )
        
        # Movie 2 sessions
        Session.objects.create(
            movie=movie2,
            hall=hall1,
            start_time=timezone.make_aware(datetime.combine(today, time(hour=18))),
            end_time=timezone.make_aware(datetime.combine(today, time(hour=21, minute=30))),
            base_price=300,
            is_active=True
        )
        
        Session.objects.create(
            movie=movie2,
            hall=hall2,
            start_time=timezone.make_aware(datetime.combine(today, time(hour=20))),
            end_time=timezone.make_aware(datetime.combine(today, time(hour=23, minute=30))),
            base_price=350,
            is_active=True
        )
        
        Session.objects.create(
            movie=movie2,
            hall=hall1,
            start_time=timezone.make_aware(datetime.combine(tomorrow, time(hour=14))),
            end_time=timezone.make_aware(datetime.combine(tomorrow, time(hour=17, minute=30))),
            base_price=300,
            is_active=True
        )
        
        self.stdout.write(f'Created sessions: {Session.objects.count()} total')
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
