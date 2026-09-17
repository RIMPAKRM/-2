import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'http://localhost:8000/api';

export interface Session {
  id: number;
  movie: number;
  movie_title: string;
  hall: number;
  hall_name: string;
  start_time: string;
  end_time: string;
  base_price: number;
  is_active: boolean;
  available_seats_count: number;
}

export interface SessionDetail {
  id: number;
  movie: {
    id: number;
    title: string;
    description: string;
    duration: number;
    poster_url: string;
    genre: string;
    rating: number;
  };
  hall: {
    id: number;
    name: string;
    total_rows: number;
    seats_per_row: number;
    total_seats: number;
  };
  start_time: string;
  end_time: string;
  base_price: number;
  is_active: boolean;
  available_seats: Seat[];
}

export interface Seat {
  id: number;
  hall: number;
  row: number;
  column: number;
  seat_type: 'standard' | 'vip' | 'premium';
  price_multiplier: number;
}

export const sessionsApi = createApi({
  reducerPath: 'sessionsApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getSessions: builder.query<Session[], { movie?: number }>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params.movie) query.append('movie', params.movie.toString());
        return `/sessions/?${query.toString()}`;
      },
    }),
    getSession: builder.query<SessionDetail, number>({
      query: (id) => `/sessions/${id}/`,
    }),
    getAvailableSeats: builder.query<Seat[], number>({
      query: (id) => `/sessions/${id}/available_seats/`,
    }),
  }),
});

export const { useGetSessionsQuery, useGetSessionQuery, useGetAvailableSeatsQuery } = sessionsApi;
