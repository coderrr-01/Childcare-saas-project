import { useState } from 'react';
import { Box, Typography, TextField, Button, IconButton, InputAdornment, Alert, CircularProgress, Checkbox, FormControlLabel, Link } from '@mui/material';
import { Visibility, VisibilityOff, Login } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/utils/validators';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { loginUser, clearError } from '@/features/auth/authSlice';

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const onSubmit = (data: LoginForm) => {
    dispatch(loginUser(data.email, data.password));
    // Navigate after a short delay to allow mock login to complete
    setTimeout(() => {
      const state = (window as any).__REDUX_STORE__?.getState?.();
      if (state?.auth?.isAuthenticated) {
        navigate('/dashboard');
      }
    }, 1000);
  };

  const demoAccounts = [
    { role: 'Super Admin', email: 'superadmin@example.com' },
    { role: 'Org Admin', email: 'orgadmin@example.com' },
    { role: 'Centre Director', email: 'director@example.com' },
    { role: 'Educator', email: 'educator@example.com' },
    { role: 'Parent', email: 'parent@example.com' },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 420 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Welcome back
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Sign in to your account to continue
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Email address"
          type="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <FormControlLabel
            control={<Checkbox size="small" />}
            label={<Typography variant="body2">Remember me</Typography>}
          />
          <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Login />}
          sx={{ py: 1.5, mb: 3 }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Box>

      {/* Demo accounts */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#F0FDF4', borderRadius: 2, border: '1px solid #BBF7D0' }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.dark', display: 'block', mb: 1 }}>
          Demo Accounts (Password: Password123!)
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {demoAccounts.map((account) => (
            <Box
              key={account.email}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 0.5,
                cursor: 'pointer',
                px: 1,
                borderRadius: 1,
                '&:hover': { backgroundColor: 'rgba(91,140,90,0.1)' },
              }}
              onClick={() => {
                // Use React Hook Form's setValue to fill form
                const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
                const passInput = document.querySelector('input[name="password"]') as HTMLInputElement;
                if (emailInput && passInput) {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                  nativeInputValueSetter?.call(emailInput, account.email);
                  emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                  nativeInputValueSetter?.call(passInput, 'Password123!');
                  passInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }}
            >
              <Typography variant="caption" color="text.secondary">{account.role}</Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{account.email}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
