import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { theme } from '@/theme/theme';
import { router } from '@/app/router';
import { GlobalSnackbar } from '@/components/layout/Snackbar';

// Expose store for demo login navigation
(window as any).__REDUX_STORE__ = store;

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
        <GlobalSnackbar />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
