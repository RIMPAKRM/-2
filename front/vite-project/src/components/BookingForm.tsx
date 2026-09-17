import { useState } from 'react';

interface BookingFormProps {
  selectedSeats: any[];
  totalPrice: number;
  onSubmit: (data: { name: string; email: string; city: string }) => void;
  onCancel: () => void;
}

export function BookingForm({ selectedSeats, totalPrice, onSubmit, onCancel }: BookingFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && city) {
      onSubmit({ name, email, city });
    }
  };

  const timeLeft = 15 * 60;

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Оформление брони</h2>
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-mono">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Выбранные места</h3>
        <div className="flex flex-wrap gap-2">
          {selectedSeats.map((seat, index) => (
            <span key={index} className="bg-purple-600 text-white px-3 py-1 rounded text-sm">
              Ряд {seat.row}, Место {seat.column}
            </span>
          ))}
        </div>
        <div className="mt-3 text-right">
          <span className="text-gray-400">К оплате: </span>
          <span className="text-2xl font-bold text-purple-400">{totalPrice} ₽</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2">Имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 focus:outline-none"
            placeholder="Введите ваше имя"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 focus:outline-none"
            placeholder="example@mail.com"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Город</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 focus:outline-none"
            placeholder="Москва"
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={!name || !email || !city}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Подтвердить бронь
          </button>
        </div>
      </form>
    </div>
  );
}
