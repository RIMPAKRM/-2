import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useGetMoviesQuery } from './store/api/moviesApi'
import { useGetSessionsQuery, useGetSessionQuery } from './store/api/sessionsApi'
import { useCreateBookingMutation } from './store/api/bookingsApi'
import { 
  setSelectedMovie, 
  setSelectedSession, 
  selectSeat, 
  deselectSeat, 
  clearSelectedSeats,
  updateBookingTimer,
  clearBooking 
} from './store/slices/bookingSlice'
import { setUser, updateUser } from './store/slices/userSlice'
import type { RootState } from './store'
import type { SelectedSeat } from './store/slices/bookingSlice'
import { MovieCard } from './components/MovieCard'
import { SessionCard } from './components/SessionCard'
import { HallLayout } from './components/HallLayout'
import { BookingForm } from './components/BookingForm'
import { MyTickets } from './components/MyTickets'
import { MovieWheel } from './components/MovieWheel'

type View = 'movies' | 'sessions' | 'hall' | 'booking' | 'success' | 'tickets'

function App() {
  const dispatch = useDispatch()
  const [currentView, setCurrentView] = useState<View>('movies')
  const [showWheel, setShowWheel] = useState(false)
  
  const selectedMovieId = useSelector((state: RootState) => state.booking.selectedMovieId)
  const selectedSessionId = useSelector((state: RootState) => state.booking.selectedSessionId)
  const selectedSeats = useSelector((state: RootState) => state.booking.selectedSeats)
  const bookingTimer = useSelector((state: RootState) => state.booking.bookingTimer)
  const user = useSelector((state: RootState) => state.user)
  
  const { data: movies, isLoading: moviesLoading } = useGetMoviesQuery()
  const { data: sessions, isLoading: sessionsLoading } = useGetSessionsQuery(
    { movie: selectedMovieId || undefined },
    { skip: !selectedMovieId }
  )
  const { data: sessionDetail } = useGetSessionQuery(selectedSessionId || 0, { skip: !selectedSessionId })
  const [createBooking] = useCreateBookingMutation()

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (currentView === 'hall' && selectedSeats.length > 0 && bookingTimer > 0) {
      interval = setInterval(() => {
        dispatch(updateBookingTimer(bookingTimer - 1))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentView, selectedSeats.length, bookingTimer, dispatch])

  const handleMovieClick = (movieId: number) => {
    dispatch(setSelectedMovie(movieId))
    setCurrentView('sessions')
  }

  const handleSessionClick = (sessionId: number) => {
    dispatch(setSelectedSession(sessionId))
    dispatch(clearSelectedSeats())
    setCurrentView('hall')
  }

  const handleSeatSelect = (seat: any) => {
    const exists = selectedSeats.some((s: SelectedSeat) => s.row === seat.row && s.column === seat.column)
    if (exists) {
      dispatch(deselectSeat({ row: seat.row, column: seat.column }))
    } else {
      dispatch(selectSeat({
        id: seat.id,
        row: seat.row,
        column: seat.column,
        seat_type: seat.type,
        type: seat.type,
        price: seat.price,
        status: seat.status
      }))
    }
  }

  const handleBookingSubmit = (data: { name: string; email: string; city: string }) => {
    dispatch(setUser(data))
    
    // Create bookings for each selected seat
    selectedSeats.forEach((seat: SelectedSeat) => {
      if (selectedSessionId) {
        createBooking({
          session: selectedSessionId,
          seat: seat.id,
          customer_name: data.name,
          customer_email: data.email,
          city: data.city,
        })
      }
    })
    
    dispatch(updateUser({ city: data.city }))
    setCurrentView('success')
  }

  const handleBackToMovies = () => {
    dispatch(clearBooking())
    setCurrentView('movies')
  }

  const handleWheelMovieSelect = (movieId: number) => {
    dispatch(setSelectedMovie(movieId))
    setCurrentView('sessions')
  }

  const selectedMovie = movies?.find(m => m.id === selectedMovieId)
  const selectedSession = sessions?.find(s => s.id === selectedSessionId)
  const totalPrice = selectedSeats.reduce((sum: number, seat: SelectedSeat) => sum + seat.price, 0)

  if (moviesLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-2xl">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 
            className="text-2xl font-bold text-purple-400 cursor-pointer"
            onClick={handleBackToMovies}
            onDoubleClick={() => setShowWheel(true)}
          >
            🎬 КиноТеатр
          </h1>
          <div className="flex gap-6">
            <button 
              onClick={handleBackToMovies}
              className={`hover:text-purple-400 transition-colors ${currentView === 'movies' ? 'text-purple-400' : 'text-gray-400'}`}
            >
              Афиша
            </button>
            <button 
              onClick={() => setCurrentView('tickets')}
              className={`hover:text-purple-400 transition-colors ${currentView === 'tickets' ? 'text-purple-400' : 'text-gray-400'}`}
            >
              Мои билеты
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'movies' && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Афиша фильмов</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {movies?.map(movie => (
                <MovieCard
                  key={movie.id}
                  title={movie.title}
                  poster={movie.poster_url}
                  genre={movie.genre}
                  rating={movie.rating}
                  duration={movie.duration}
                  onClick={() => handleMovieClick(movie.id)}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === 'sessions' && selectedMovie && (
          <div>
            <button 
              onClick={handleBackToMovies}
              className="mb-6 text-purple-400 hover:text-purple-300 transition-colors"
            >
              ← Назад к афише
            </button>
            <div className="mb-8">
              <h2 className="text-3xl font-bold">{selectedMovie.title}</h2>
              <p className="text-gray-400 mt-2">{selectedMovie.genre} • {selectedMovie.duration} мин • ⭐ {selectedMovie.rating}</p>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Сеансы</h3>
            {sessionsLoading ? (
              <div className="text-gray-400">Загрузка сеансов...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {sessions?.map(session => (
                  <SessionCard
                    key={session.id}
                    time={new Date(session.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    hall={session.hall_name}
                    price={session.base_price}
                    availableSeats={session.available_seats_count}
                    onClick={() => handleSessionClick(session.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'hall' && selectedSession && (
          <div>
            <button 
              onClick={() => setCurrentView('sessions')}
              className="mb-6 text-purple-400 hover:text-purple-300 transition-colors"
            >
              ← Назад к сеансам
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{selectedMovie?.title}</h2>
              <p className="text-gray-400">
                Сеанс в {new Date(selectedSession.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} • Зал {selectedSession.hall_name}
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <HallLayout
                  totalRows={sessionDetail?.hall?.total_rows || 10}
                  seatsPerRow={sessionDetail?.hall?.seats_per_row || 12}
                  onSeatSelect={handleSeatSelect}
                  selectedSeats={selectedSeats}
                  availableSeats={sessionDetail?.available_seats}
                  basePrice={selectedSession?.base_price || 300}
                />
              </div>
              
              <div className="lg:col-span-1">
                {selectedSeats.length > 0 && (
                  <BookingForm
                    selectedSeats={selectedSeats}
                    totalPrice={totalPrice}
                    onSubmit={handleBookingSubmit}
                    onCancel={() => dispatch(clearSelectedSeats())}
                  />
                )}
                {selectedSeats.length === 0 && (
                  <div className="bg-gray-900 rounded-xl p-6 text-center">
                    <p className="text-gray-400">Выберите места на схеме зала</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'success' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-400 mb-4">Бронь успешно оформлена!</h2>
              <p className="text-gray-400 mb-6">
                Билеты отправлены на вашу электронную почту {user.email}.
              </p>
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <p className="text-white font-semibold">{selectedMovie?.title}</p>
                <p className="text-gray-400">
                  {selectedSession && new Date(selectedSession.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} • Зал {selectedSession?.hall_name}
                </p>
                <p className="text-purple-400 font-bold mt-2">{selectedSeats.length} мест • {totalPrice} ₽</p>
              </div>
              <button
                onClick={handleBackToMovies}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Вернуться к афише
              </button>
            </div>
          </div>
        )}

        {currentView === 'tickets' && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Мои билеты</h2>
            <MyTickets />
          </div>
        )}
      </main>

      {showWheel && movies && (
        <MovieWheel
          movies={movies}
          onMovieSelect={handleWheelMovieSelect}
          onClose={() => setShowWheel(false)}
        />
      )}
    </div>
  )
}

export default App
