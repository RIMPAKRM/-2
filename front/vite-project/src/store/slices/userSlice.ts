import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  email: string;
  city: string;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  name: '',
  email: '',
  city: '',
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ name: string; email: string; city: string }>) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.city = action.payload.city;
      state.isAuthenticated = true;
    },
    updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload);
    },
    clearUser: (state) => {
      state.name = '';
      state.email = '';
      state.city = '';
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
