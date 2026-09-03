import { useState } from 'react';
import { Box, Typography, TextField, Button, IconButton, InputAdornment, Alert } from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '@/utils/validators';

interface ResetForm {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const token = searchParams.get('token');

  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (_data: ResetForm) => {
    await new Promise(r => setTimeout(r, 1000));
    setSuccess(true);
    setTimeout(() => navigate('/login'), 2000);
  };

  if (!token) {
    return (
      <Box sx={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Invalid or expired reset link. Please request a new one.
        </Alert>
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>Password Reset!</Typography>
        <Typography variant="body2" color="text.secondary">Redirecting to sign in...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 420 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Reset password</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Enter your new password below.
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="New password"
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
        <TextField
          fullWidth
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          {...register('confirmPassword')}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          sx={{ mb: 3 }}
        />
        <Button type="submit" fullWidth variant="contained" size="large" sx={{ py: 1.5 }}>
          Reset Password
        </Button>
      </Box>
    </Box>
  );
}
