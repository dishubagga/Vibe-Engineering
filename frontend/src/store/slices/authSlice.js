import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: !!localStorage.getItem('token'),
  user: null,
  token: localStorage.getItem('token') || null,
  onboardingCompleted: localStorage.getItem('onboardingCompleted') === 'true',
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.onboardingCompleted = action.payload.onboardingCompleted ?? false;
      state.loading = false;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('onboardingCompleted', action.payload.onboardingCompleted ?? false);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setOnboardingCompleted: (state) => {
      state.onboardingCompleted = true;
      localStorage.setItem('onboardingCompleted', 'true');
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.onboardingCompleted = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('onboardingCompleted');
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  setUser,
  setOnboardingCompleted,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
