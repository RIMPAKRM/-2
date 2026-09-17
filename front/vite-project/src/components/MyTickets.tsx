import { useGetMyBookingsQuery, useCancelBookingMutation } from '../store/api/bookingsApi'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'

export function MyTickets() {
  const user = useSelector((state: RootState) => state.user)
  const { data: bookings, isLoading, refetch } = useGetMyBookingsQuery(
    { city: user.city || undefined },
    { skip: !user.city }
  )
  const [cancelBooking] = useCancelBookingMutation()

  const handleCancel = async (bookingId: number) => {
    try {
      await cancelBooking(bookingId).unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to cancel booking:', error)
    }
  }

  if (!user.city) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 text-center">
        <p className="text-gray-400">Укажите ваш город в настройках для просмотра билетов</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 text-center">
        <p className="text-gray-400">Загрузка билетов...</p>
      </div>
    )
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 text-center">
        <p className="text-gray-400">У вас пока нет билетов</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{booking.session_details.movie_title}</h3>
              <p className="text-gray-400">
                {new Date(booking.session_details.start_time).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-gray-400">Зал {booking.session_details.hall_name}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm ${
                booking.status === 'confirmed' ? 'bg-green-600 text-white' :
                booking.status === 'cancelled' ? 'bg-red-600 text-white' :
                'bg-yellow-600 text-white'
              }`}>
                {booking.status === 'confirmed' ? 'Подтверждено' :
                 booking.status === 'cancelled' ? 'Отменено' :
                 booking.status === 'expired' ? 'Истекло' : 'В обработке'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400">Место:</span>
              <span className="text-white font-semibold">
                Ряд {booking.seat_details.row}, Место {booking.seat_details.column}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                booking.seat_details.seat_type === 'premium' ? 'bg-yellow-600' :
                booking.seat_details.seat_type === 'vip' ? 'bg-blue-600' :
                'bg-green-600'
              }`}>
                {booking.seat_details.seat_type}
              </span>
            </div>
            <div className="text-purple-400 font-bold">
              {booking.session_details.base_price * booking.seat_details.price_multiplier} ₽
            </div>
          </div>

          <div className="text-sm text-gray-400 mb-4">
            <p>Бронь создана: {new Date(booking.created_at).toLocaleString('ru-RU')}</p>
            {booking.expires_at && (
              <p>Истекает: {new Date(booking.expires_at).toLocaleString('ru-RU')}</p>
            )}
          </div>

          {booking.status === 'confirmed' && !booking.is_expired && (
            <button
              onClick={() => handleCancel(booking.id)}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Отменить бронь
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
