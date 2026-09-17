import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'http://localhost:8000/api';

export interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  poster_url: string;
  genre: string;
  rating: number;
  created_at: string;
}

export const moviesApi = createApi({
  reducerPath: 'moviesApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getMovies: builder.query<Movie[], void>({
      query: () => '/movies/',
    }),
    getMovie: builder.query<Movie, number>({
      query: (id) => `/movies/${id}/`,
    }),
  }),
});

export const { useGetMoviesQuery, useGetMovieQuery } = moviesApi;
