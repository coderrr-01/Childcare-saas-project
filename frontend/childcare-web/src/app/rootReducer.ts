import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import uiReducer from '@/features/auth/uiSlice';
import centreReducer from '@/features/auth/centreSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  centre: centreReducer,
});
