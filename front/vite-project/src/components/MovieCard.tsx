interface MovieCardProps {
  title: string;
  poster: string;
  genre: string;
  rating: number;
  duration: number;
  onClick: () => void;
}

export function MovieCard({ title, poster, genre, rating, duration, onClick }: MovieCardProps) {
  return (
    <div 
      className="group relative bg-gray-900 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      onClick={onClick}
    >
      <div className="aspect-[2/3] overflow-hidden">
        <img 
          src={poster} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span className="bg-purple-600 px-2 py-1 rounded text-xs">{genre}</span>
          <span>⭐ {rating}</span>
          <span>{duration} мин</span>
        </div>
      </div>
      <div className="absolute top-2 right-2 bg-yellow-500 text-black font-bold px-2 py-1 rounded text-sm">
        ⭐ {rating}
      </div>
    </div>
  );
}
