import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, type PersistedState } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { moviesApi } from './api/moviesApi';
import { bookingsApi } from './api/bookingsApi';
import { sessionsApi } from './api/sessionsApi';
import userSlice from './slices/userSlice';
import bookingSlice from './slices/bookingSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'booking'],
};

const rootReducer = combineReducers({
  [moviesApi.reducerPath]: moviesApi.reducer,
  [sessionsApi.reducerPath]: sessionsApi.reducer,
  [bookingsApi.reducerPath]: bookingsApi.reducer,
  user: userSlice,
  booking: bookingSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(moviesApi.middleware, sessionsApi.middleware, bookingsApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer> & PersistedState;
export type AppDispatch = typeof store.dispatch;
