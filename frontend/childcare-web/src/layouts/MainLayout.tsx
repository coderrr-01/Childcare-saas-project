import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { toggleSidebar, setMobileDrawerOpen } from '@/features/auth/uiSlice';

export function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const { sidebarCollapsed, mobileDrawerOpen } = useAppSelector((state) => state.ui);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar
          open={true}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          open={mobileDrawerOpen}
          onClose={() => dispatch(setMobileDrawerOpen(false))}
          PaperProps={{ sx: { width: 260 } }}
        >
          <Sidebar
            open={true}
            collapsed={false}
            onToggleCollapse={() => dispatch(setMobileDrawerOpen(false))}
          />
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#F8FAF7',
            p: { xs: 2, sm: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
