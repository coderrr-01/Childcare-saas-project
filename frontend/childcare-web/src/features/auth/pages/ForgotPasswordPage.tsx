import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '@/utils/validators';

interface ForgotForm {
  email: string;
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (_data: ForgotForm) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <Box sx={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          If an account exists with that email, we've sent password reset instructions.
        </Alert>
        <Button component={RouterLink} to="/login" startIcon={<ArrowBack />}>
          Back to Sign In
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 420 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Forgot password?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Enter your email address and we'll send you a link to reset your password.
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Email address"
          type="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={{ mb: 3 }}
        />
        <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ py: 1.5, mb: 3 }}>
          {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
        </Button>
      </Box>

      <Button component={RouterLink} to="/login" startIcon={<ArrowBack />} sx={{ textTransform: 'none' }}>
        Back to Sign In
      </Button>
    </Box>
  );
}
