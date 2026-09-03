import { Box, Typography, IconButton, Badge, Avatar, Menu, MenuItem, ListItemIcon, Divider, TextField, InputAdornment, Chip } from '@mui/material';
import { Menu as MenuIcon, Search, Notifications, Logout, Person, Settings, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { logout } from '@/features/auth/authSlice';
import { setMobileDrawerOpen } from '@/features/auth/uiSlice';
import { ROLE_LABELS } from '@/constants/roles';
import { getInitials, generateColor } from '@/utils/formatters';

export function Header() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, centre } = useAppSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const unreadCount = 5; // Mock

  return (
    <Box
      sx={{
        height: 64,
        px: { xs: 2, sm: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderBottom: '1px solid',
        borderColor: 'divider',
        gap: 2,
      }}
    >
      {/* Left side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <IconButton
          sx={{ display: { xs: 'flex', md: 'none' } }}
          onClick={() => dispatch(setMobileDrawerOpen(true))}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {centre?.name || 'Childcare Centre'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {centre?.address}
          </Typography>
        </Box>
      </Box>

      {/* Right side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => navigate('/notifications')} size="small">
          <Badge badgeContent={unreadCount} color="error" max={9}>
            <Notifications fontSize="small" />
          </Badge>
        </IconButton>

        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', p: 0.5, borderRadius: 1.5, '&:hover': { backgroundColor: 'action.hover' } }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          {user && (
            <>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  bgcolor: generateColor(`${user.firstName}${user.lastName}`),
                  display: { xs: 'none', sm: 'flex' },
                }}
              >
                {getInitials(user.firstName, user.lastName)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {ROLE_LABELS[user.role]}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            Profile & Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { dispatch(logout()); navigate('/login'); setAnchorEl(null); }}>
            <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
            Sign Out
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
