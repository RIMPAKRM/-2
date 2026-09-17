import { useState } from 'react'

interface Movie {
  id: number
  title: string
  poster_url: string
  genre: string
  rating: number
  duration: number
}

interface MovieWheelProps {
  movies: Movie[]
  onMovieSelect: (movieId: number) => void
  onClose: () => void
}

export function MovieWheel({ movies, onMovieSelect, onClose }: MovieWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  const handleSpin = () => {
    if (isSpinning || movies.length === 0) return
    
    setIsSpinning(true)
    setSelectedMovie(null)
    
    // Random rotation (at least 5 full spins + random segment)
    const segmentAngle = 360 / movies.length
    const randomSegment = Math.floor(Math.random() * movies.length)
    const extraSpins = 5 + Math.random() * 3 // 5-8 full spins
    const newRotation = rotation + (extraSpins * 360) + (randomSegment * segmentAngle)
    
    setRotation(newRotation)
    
    // Determine winner after spin
    setTimeout(() => {
      // Calculate which segment is under the pointer (top position)
      // When wheel rotates clockwise, the pointer points to segment at (360 - rotation % 360)
      const normalizedRotation = newRotation % 360
      const pointerAngle = (360 - normalizedRotation) % 360
      const winnerIndex = Math.floor(pointerAngle / segmentAngle) % movies.length
      const actualWinner = movies[winnerIndex]
      setSelectedMovie(actualWinner)
      setIsSpinning(false)
    }, 4000)
  }

  const handleSelectMovie = () => {
    if (selectedMovie) {
      onMovieSelect(selectedMovie.id)
      onClose()
    }
  }

  const segmentAngle = 360 / movies.length

  // Generate colors for segments
  const colors = [
    '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', 
    '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#84CC16'
  ]

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>
        
        <h2 className="text-3xl font-bold text-center mb-2 text-purple-400">
          🎬 Колесо фильмов
        </h2>
        <p className="text-gray-400 text-center mb-8">
          Не знаете какой фильм посмотреть? Покрутите колесо!
        </p>

        <div className="flex flex-col items-center">
          {/* Wheel Container */}
          <div className="relative mb-8">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
            </div>
            
            {/* Wheel */}
            <div 
              className="w-72 h-72 md:w-96 md:h-96 rounded-full relative shadow-2xl transition-transform duration-[4000ms] ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {movies.map((movie, index) => {
                const startAngle = index * segmentAngle
                const color = colors[index % colors.length]
                
                return (
                  <div
                    key={movie.id}
                    className="absolute w-full h-full"
                    style={{
                      transform: `rotate(${startAngle}deg)`,
                    }}
                  >
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full"
                      style={{
                        transform: `rotate(${segmentAngle / 2}deg)`,
                      }}
                    >
                      <path
                        d={`M 50 50 L 50 0 A 50 50 0 0 1 ${50 + 50 * Math.sin((segmentAngle * Math.PI) / 180)} ${50 - 50 * Math.cos((segmentAngle * Math.PI) / 180)} Z`}
                        fill={color}
                        stroke="#1F2937"
                        strokeWidth="0.5"
                      />
                      <text
                        x="70"
                        y="30"
                        fontSize="8"
                        fill="white"
                        textAnchor="middle"
                        transform={`rotate(${segmentAngle / 2} 70 30)`}
                        className="font-semibold"
                      >
                        {movie.title.length > 15 ? movie.title.slice(0, 15) + '...' : movie.title}
                      </text>
                    </svg>
                  </div>
                )
              })}
              
              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-900 rounded-full border-4 border-purple-500 flex items-center justify-center">
                <span className="text-2xl">🎬</span>
              </div>
            </div>
          </div>

          {/* Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-xl rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            {isSpinning ? '🎰 Крутим...' : '🎲 Крутить колесо!'}
          </button>

          {/* Selected Movie */}
          {selectedMovie && !isSpinning && (
            <div className="mt-8 bg-gray-800 rounded-xl p-6 w-full max-w-md animate-fade-in">
              <h3 className="text-xl font-bold text-green-400 mb-4 text-center">
                🎉 Вам выпал фильм:
              </h3>
              <div className="flex flex-col items-center gap-4">
                <img
                  src={selectedMovie.poster_url}
                  alt={selectedMovie.title}
                  className="w-32 h-48 object-cover rounded-lg shadow-lg"
                />
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-white">{selectedMovie.title}</h4>
                  <p className="text-gray-400 mt-2">{selectedMovie.genre} • {selectedMovie.duration} мин</p>
                  <p className="text-yellow-400 mt-1">⭐ {selectedMovie.rating}</p>
                </div>
                <button
                  onClick={handleSelectMovie}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Выбрать этот фильм
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
