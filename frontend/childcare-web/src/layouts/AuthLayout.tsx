import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { ChildCare, Nature } from '@mui/icons-material';

export function AuthLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Left branding panel - hidden on mobile */}
      {!isMobile && (
        <Box
          sx={{
            width: '45%',
            background: 'linear-gradient(135deg, #2D4A3E 0%, #3D6B3C 50%, #5B8C5A 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 250, height: 250, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)' }} />

          <Box sx={{ textAlign: 'center', zIndex: 1, maxWidth: 400 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <ChildCare sx={{ fontSize: 48, color: '#fff' }} />
              </Box>
            </Box>
            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
              Little Explorers
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
              Simplifying everyday care, learning and communication for early learning centres across Australia and New Zealand.
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 3 }}>
              {['Care', 'Learn', 'Connect'].map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.7)' }}>
                  <Nature sx={{ fontSize: 16 }} />
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Right form area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 4, md: 6 },
          backgroundColor: '#F8FAF7',
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
