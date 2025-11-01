import { configureStore } from '@reduxjs/toolkit';

import userReducer from '../features/user.js';

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;
