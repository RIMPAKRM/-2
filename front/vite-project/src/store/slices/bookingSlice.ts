import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SelectedSeat {
  id: number;
  row: number;
  column: number;
  seat_type: 'standard' | 'vip' | 'premium';
  price: number;
}

interface BookingState {
  selectedSeats: SelectedSeat[];
  selectedSessionId: number | null;
  selectedMovieId: number | null;
  bookingTimer: number;
  isBookingInProgress: boolean;
}

const initialState: BookingState = {
  selectedSeats: [],
  selectedSessionId: null,
  selectedMovieId: null,
  bookingTimer: 15 * 60,
  isBookingInProgress: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    selectSeat: (state, action: PayloadAction<SelectedSeat>) => {
      const exists = state.selectedSeats.some(
        seat => seat.row === action.payload.row && seat.column === action.payload.column
      );
      if (!exists) {
        state.selectedSeats.push(action.payload);
      }
    },
    deselectSeat: (state, action: PayloadAction<{ row: number; column: number }>) => {
      state.selectedSeats = state.selectedSeats.filter(
        seat => seat.row !== action.payload.row || seat.column !== action.payload.column
      );
    },
    clearSelectedSeats: (state) => {
      state.selectedSeats = [];
    },
    setSelectedSession: (state, action: PayloadAction<number>) => {
      state.selectedSessionId = action.payload;
      state.selectedSeats = [];
      state.bookingTimer = 15 * 60;
    },
    setSelectedMovie: (state, action: PayloadAction<number>) => {
      state.selectedMovieId = action.payload;
    },
    updateBookingTimer: (state, action: PayloadAction<number>) => {
      state.bookingTimer = action.payload;
    },
    setBookingInProgress: (state, action: PayloadAction<boolean>) => {
      state.isBookingInProgress = action.payload;
    },
    clearBooking: (state) => {
      state.selectedSeats = [];
      state.selectedSessionId = null;
      state.selectedMovieId = null;
      state.bookingTimer = 15 * 60;
      state.isBookingInProgress = false;
    },
  },
});

export const {
  selectSeat,
  deselectSeat,
  clearSelectedSeats,
  setSelectedSession,
  setSelectedMovie,
  updateBookingTimer,
  setBookingInProgress,
  clearBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
