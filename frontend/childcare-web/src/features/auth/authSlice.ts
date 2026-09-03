import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, Centre } from '@/types';
import { mockUsers, demoPasswords } from '@/mock/users';
import { mockRooms } from '@/mock/rooms';

interface AuthState {
  user: User | null;
  centre: Centre | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  mfaPending: boolean;
}

const storedUser = localStorage.getItem('childcare_user');
const storedCentre = localStorage.getItem('childcare_centre');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  centre: storedCentre ? JSON.parse(storedCentre) : null,
  isAuthenticated: !!storedUser,
  loading: false,
  error: null,
  mfaPending: false,
};

const mockCentre: Centre = {
  id: 'centre-1',
  name: 'Little Explorers Early Learning',
  organisationId: 'org-1',
  address: '42 Eucalyptus Drive, Brisbane QLD 4000',
  phone: '(07) 3456 7890',
  email: 'info@littleexplorers.edu.au',
  capacity: 56,
  rooms: mockRooms,
  timezone: 'Australia/Brisbane',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<User>) {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.centre = mockCentre;
      state.error = null;
      localStorage.setItem('childcare_user', JSON.stringify(action.payload));
      localStorage.setItem('childcare_centre', JSON.stringify(mockCentre));
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    mfaRequired(state) {
      state.mfaPending = true;
      state.loading = false;
    },
    mfaVerified(state) {
      state.mfaPending = false;
      state.loading = false;
      if (state.user) {
        state.isAuthenticated = true;
      }
    },
    logout(state) {
      state.user = null;
      state.centre = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.mfaPending = false;
      localStorage.removeItem('childcare_user');
      localStorage.removeItem('childcare_centre');
    },
    clearError(state) {
      state.error = null;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('childcare_user', JSON.stringify(state.user));
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, mfaRequired, mfaVerified, logout, clearError, updateUser } = authSlice.actions;

export const loginUser = (email: string, password: string) => (dispatch: any) => {
  dispatch(loginStart());
  
  // Simulate async login
  setTimeout(() => {
    const user = mockUsers.find(u => u.email === email);
    const validPassword = demoPasswords[email];
    
    if (user && password === validPassword) {
      dispatch(loginSuccess(user));
    } else {
      dispatch(loginFailure('Invalid email or password. Please try again.'));
    }
  }, 800);
};

export default authSlice.reducer;
