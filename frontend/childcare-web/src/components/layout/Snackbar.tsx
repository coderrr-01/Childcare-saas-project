import { Snackbar, Alert } from '@mui/material';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { hideSnackbar } from '@/features/auth/uiSlice';

export function GlobalSnackbar() {
  const dispatch = useAppDispatch();
  const { snackbar } = useAppSelector((state) => state.ui);

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={() => dispatch(hideSnackbar())}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={() => dispatch(hideSnackbar())}
        severity={snackbar.severity}
        variant="filled"
        sx={{ borderRadius: 2 }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}
