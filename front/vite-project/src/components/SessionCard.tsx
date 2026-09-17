interface SessionCardProps {
  time: string;
  hall: string;
  price: number;
  availableSeats: number;
  onClick: () => void;
}

export function SessionCard({ time, hall, price, availableSeats, onClick }: SessionCardProps) {
  return (
    <div 
      className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-purple-500"
      onClick={onClick}
    >
      <div className="text-2xl font-bold text-white mb-2">{time}</div>
      <div className="text-gray-400 text-sm mb-2">Зал {hall}</div>
      <div className="flex items-center justify-between">
        <div className="text-purple-400 font-semibold">{price} ₽</div>
        <div className={`text-sm ${availableSeats > 10 ? 'text-green-400' : availableSeats > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
          {availableSeats > 0 ? `${availableSeats} мест` : 'Нет мест'}
        </div>
      </div>
    </div>
  );
}
