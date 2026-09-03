import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  mobileDrawerOpen: boolean;
  searchOpen: boolean;
  themeMode: 'light' | 'dark';
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
}

const initialState: UiState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileDrawerOpen: false,
  searchOpen: false,
  themeMode: 'light',
  snackbar: {
    open: false,
    message: '',
    severity: 'success',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setMobileDrawerOpen(state, action: PayloadAction<boolean>) {
      state.mobileDrawerOpen = action.payload;
    },
    toggleSearch(state) {
      state.searchOpen = !state.searchOpen;
    },
    setThemeMode(state, action: PayloadAction<'light' | 'dark'>) {
      state.themeMode = action.payload;
    },
    showSnackbar(state, action: PayloadAction<{ message: string; severity: 'success' | 'error' | 'warning' | 'info' }>) {
      state.snackbar = { open: true, ...action.payload };
    },
    hideSnackbar(state) {
      state.snackbar.open = false;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setMobileDrawerOpen, toggleSearch, setThemeMode, showSnackbar, hideSnackbar } = uiSlice.actions;
export default uiSlice.reducer;
