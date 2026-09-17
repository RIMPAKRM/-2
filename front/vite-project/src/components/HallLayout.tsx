import { useState, useEffect } from 'react';
import type { SelectedSeat } from '../store/slices/bookingSlice';

interface Seat {
  id: number;
  row: number;
  column: number;
  type: 'standard' | 'vip' | 'premium';
  status: 'available' | 'booked' | 'selected';
  price: number;
}

interface HallLayoutProps {
  totalRows: number;
  seatsPerRow: number;
  onSeatSelect: (seat: Seat) => void;
  selectedSeats: SelectedSeat[];
  availableSeats?: { id: number; row: number; column: number; seat_type: 'standard' | 'vip' | 'premium'; price_multiplier: number }[];
  basePrice?: number;
}

export function HallLayout({ totalRows, seatsPerRow, onSeatSelect, selectedSeats, availableSeats = [], basePrice = 300 }: HallLayoutProps) {
  const [seats, setSeats] = useState<Seat[]>(() => {
    const generatedSeats: Seat[] = [];
    const availableSeatIds = new Set(availableSeats.map(s => `${s.row}-${s.column}`));
    
    for (let row = 1; row <= totalRows; row++) {
      for (let col = 1; col <= seatsPerRow; col++) {
        const seatKey = `${row}-${col}`;
        const availableSeat = availableSeats.find(s => s.row === row && s.column === col);
        
        let type: 'standard' | 'vip' | 'premium' = 'standard';
        let price = basePrice;
        
        if (availableSeat) {
          type = availableSeat.seat_type;
          price = basePrice * availableSeat.price_multiplier;
        } else if (row <= 2) {
          type = 'premium';
          price = basePrice * 1.5;
        } else if (row <= 5) {
          type = 'vip';
          price = basePrice * 1.3;
        }
        
        const isAvailable = availableSeatIds.has(seatKey);
        
        generatedSeats.push({
          id: availableSeat?.id || row * 1000 + col,
          row,
          column: col,
          type,
          status: isAvailable ? 'available' : 'booked',
          price
        });
      }
    }
    return generatedSeats;
  });

  // Update seat status when availableSeats changes
  useEffect(() => {
    const availableSeatIds = new Set(availableSeats.map(s => `${s.row}-${s.column}`));
    setSeats(prev => prev.map(seat => {
      const isAvailable = availableSeatIds.has(`${seat.row}-${seat.column}`);
      const availableSeat = availableSeats.find(s => s.row === seat.row && s.column === seat.column);
      
      return {
        ...seat,
        id: availableSeat?.id || seat.id,
        status: isAvailable ? 'available' : 'booked',
        type: availableSeat?.seat_type || seat.type,
        price: availableSeat ? basePrice * availableSeat.price_multiplier : seat.price
      };
    }));
  }, [availableSeats, basePrice]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'booked') return;
    
    const isSelected = selectedSeats.some(s => s.row === seat.row && s.column === seat.column);
    const newStatus = isSelected ? 'available' : 'selected';
    
    setSeats(prev => prev.map(s => 
      s.row === seat.row && s.column === seat.column 
        ? { ...s, status: newStatus }
        : s
    ));
    
    onSeatSelect({ 
      ...seat, 
      status: newStatus
    } as any);
  };

  const getSeatColor = (seat: Seat) => {
    switch (seat.status) {
      case 'selected':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'booked':
        return 'bg-gray-600 cursor-not-allowed';
      default:
        switch (seat.type) {
          case 'premium':
            return 'bg-yellow-500 hover:bg-yellow-600';
          case 'vip':
            return 'bg-blue-500 hover:bg-blue-600';
          default:
            return 'bg-green-500 hover:bg-green-600';
        }
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Выберите места</h2>
        <div className="text-white">
          <span className="text-gray-400">Итого: </span>
          <span className="text-2xl font-bold text-purple-400">{totalPrice} ₽</span>
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-gray-800 rounded-t-3xl h-8 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Экран</span>
        </div>
        <div className="h-4 bg-gradient-to-b from-gray-800 to-transparent" />
      </div>

      <div className="flex flex-col items-center gap-2 mb-6">
        {Array.from({ length: totalRows }, (_, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {Array.from({ length: seatsPerRow }, (_, colIndex) => {
              const seat = seats.find(s => s.row === rowIndex + 1 && s.column === colIndex + 1);
              if (!seat) return null;
              
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleSeatClick(seat)}
                  disabled={seat.status === 'booked'}
                  className={`w-8 h-8 rounded-lg transition-all duration-200 ${getSeatColor(seat)} ${
                    seat.status === 'booked' ? '' : 'transform hover:scale-110'
                  }`}
                  title={`Ряд ${seat.row}, Место ${seat.column} - ${seat.price} ₽`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-gray-400">Стандарт</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="text-gray-400">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-gray-400">Premium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-600" />
          <span className="text-gray-400">Выбрано</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-600" />
          <span className="text-gray-400">Занято</span>
        </div>
      </div>
    </div>
  );
}
