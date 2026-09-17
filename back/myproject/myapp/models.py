from django.db import models
from django.utils import timezone


class Movie(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration = models.PositiveIntegerField(help_text='Duration in minutes')
    poster_url = models.URLField(blank=True)
    genre = models.CharField(max_length=100, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Hall(models.Model):
    name = models.CharField(max_length=100)
    total_rows = models.PositiveIntegerField()
    seats_per_row = models.PositiveIntegerField()

    def __str__(self):
        return self.name

    @property
    def total_seats(self):
        return self.total_rows * self.seats_per_row


class Seat(models.Model):
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name='seats')
    row = models.PositiveIntegerField()
    column = models.PositiveIntegerField()
    seat_type = models.CharField(
        max_length=20,
        choices=[
            ('standard', 'Standard'),
            ('vip', 'VIP'),
            ('premium', 'Premium'),
        ],
        default='standard'
    )
    price_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.0)

    class Meta:
        unique_together = ['hall', 'row', 'column']
        ordering = ['row', 'column']

    def __str__(self):
        return f'{self.hall.name} - Row {self.row}, Seat {self.column}'


class Session(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='sessions')
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name='sessions')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return f'{self.movie.title} - {self.start_time.strftime("%Y-%m-%d %H:%M")}'

    @property
    def available_seats(self):
        booked_seats = Booking.objects.filter(
            session=self,
            status='confirmed',
            expires_at__gt=timezone.now()
        ).values_list('seat', flat=True)
        return self.hall.seats.exclude(id__in=booked_seats)


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='bookings')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE, related_name='bookings')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    customer_name = models.CharField(blank=True, max_length=255)
    customer_email = models.EmailField(blank=True)
    city = models.CharField(max_length=100, blank=True)

    class Meta:
        unique_together = ['session', 'seat']
        ordering = ['created_at']

    def __str__(self):
        return f'{self.session} - {self.seat} ({self.status})'

    def is_expired(self):
        return timezone.now() > self.expires_at

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=15)
        super().save(*args, **kwargs)
