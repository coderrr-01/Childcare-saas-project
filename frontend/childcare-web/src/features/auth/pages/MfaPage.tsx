import { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { mfaVerified } from '@/features/auth/authSlice';

export function MfaPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    dispatch(mfaVerified());
    navigate('/dashboard');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Two-factor authentication
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Enter the 6-digit code from your authenticator app.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          slotProps={{
            input: {
              maxLength: 6,
              style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', fontFamily: 'monospace' },
            },
          }}
          sx={{ mb: 3 }}
        />
        <Button type="submit" fullWidth variant="contained" size="large" disabled={code.length !== 6 || loading} sx={{ py: 1.5 }}>
          {loading ? <CircularProgress size={24} /> : 'Verify'}
        </Button>
      </Box>
    </Box>
  );
}
