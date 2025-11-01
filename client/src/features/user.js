import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      const { username } = action.payload;
      state.username = username;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.username = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
