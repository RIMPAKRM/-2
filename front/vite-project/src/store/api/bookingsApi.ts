import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'http://localhost:8000/api';

export interface Booking {
  id: number;
  session: number;
  seat: number;
  seat_details: {
    id: number;
    hall: number;
    row: number;
    column: number;
    seat_type: 'standard' | 'vip' | 'premium';
    price_multiplier: number;
  };
  session_details: {
    id: number;
    movie: number;
    movie_title: string;
    hall: number;
    hall_name: string;
    start_time: string;
    end_time: string;
    base_price: number;
  };
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  created_at: string;
  expires_at: string;
  customer_name: string;
  customer_email: string;
  city: string;
  is_expired: boolean;
}

export interface CreateBookingRequest {
  session: number;
  seat: number;
  customer_name: string;
  customer_email: string;
  city: string;
}

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    createBooking: builder.mutation<Booking, CreateBookingRequest>({
      query: (data) => ({
        url: '/bookings/',
        method: 'POST',
        body: data,
      }),
    }),
    getMyBookings: builder.query<Booking[], { city?: string }>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params.city) query.append('city', params.city);
        return `/bookings/my_bookings/?${query.toString()}`;
      },
    }),
    cancelBooking: builder.mutation<Booking, number>({
      query: (id) => ({
        url: `/bookings/${id}/cancel/`,
        method: 'POST',
      }),
    }),
  }),
});

export const { useCreateBookingMutation, useGetMyBookingsQuery, useCancelBookingMutation } = bookingsApi;
