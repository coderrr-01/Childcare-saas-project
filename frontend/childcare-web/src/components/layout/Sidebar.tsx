import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard, ChildCare, FamilyRestroom, Assignment, People,
  EventAvailable, Restaurant, HealthAndSafety, Medication,
  ReportProblem, School, Message, Description, Gavel,
  Receipt, Assessment, Settings, ChevronLeft, ChevronRight,
  PhotoLibrary, Today, MenuBook, AssignmentInd,
  Queue, PendingActions,
} from '@mui/icons-material';
import { useAppSelector } from '@/hooks/useAppSelector';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const allNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
  { label: 'Children', path: '/children', icon: <ChildCare /> },
  { label: 'Families', path: '/families', icon: <FamilyRestroom /> },
  { label: 'Enrolments', path: '/enrolments', icon: <Assignment /> },
  { label: 'Waitlist', path: '/waitlist', icon: <Queue /> },
  { label: 'Attendance', path: '/attendance', icon: <EventAvailable /> },
  { label: 'Daily Care', path: '/daily-care', icon: <Restaurant /> },
  { label: 'Health', path: '/health', icon: <HealthAndSafety /> },
  { label: 'Medication', path: '/medication', icon: <Medication /> },
  { label: 'Incidents', path: '/incidents', icon: <ReportProblem /> },
  { label: 'Learning', path: '/learning', icon: <School /> },
  { label: 'Messages', path: '/messages', icon: <Message /> },
  { label: 'Documents', path: '/documents', icon: <Description /> },
  { label: 'Consent', path: '/consent', icon: <Gavel /> },
  { label: 'Billing', path: '/billing', icon: <Receipt /> },
  { label: 'Reports', path: '/reports', icon: <Assessment /> },
  { label: 'Settings', path: '/settings', icon: <Settings /> },
];

const educatorNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
  { label: 'Children', path: '/children', icon: <ChildCare /> },
  { label: 'Attendance', path: '/attendance', icon: <EventAvailable /> },
  { label: 'Daily Care', path: '/daily-care', icon: <Restaurant /> },
  { label: 'Medication', path: '/medication', icon: <Medication /> },
  { label: 'Incidents', path: '/incidents', icon: <ReportProblem /> },
  { label: 'Learning', path: '/learning', icon: <School /> },
  { label: 'Messages', path: '/messages', icon: <Message /> },
];

const parentNavItems: NavItem[] = [
  { label: 'My Children', path: '/children', icon: <ChildCare /> },
  { label: "Today's Updates", path: '/dashboard', icon: <Today /> },
  { label: 'Attendance', path: '/attendance', icon: <EventAvailable /> },
  { label: 'Daily Diary', path: '/daily-care', icon: <MenuBook /> },
  { label: 'Photos', path: '/media', icon: <PhotoLibrary /> },
  { label: 'Learning Stories', path: '/learning', icon: <School /> },
  { label: 'Messages', path: '/messages', icon: <Message /> },
  { label: 'Documents', path: '/documents', icon: <Description /> },
  { label: 'Billing', path: '/billing', icon: <Receipt /> },
];

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ open, collapsed, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const navItems = user?.role === 'PARENT'
    ? parentNavItems
    : user?.role === 'EDUCATOR'
    ? educatorNavItems
    : allNavItems;

  if (!open) return null;

  return (
    <Box
      sx={{
        width: collapsed ? 72 : 260,
        height: '100vh',
        backgroundColor: '#2D4A3E',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 64 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            backgroundColor: '#5B8C5A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ChildCare sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        {!collapsed && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
              Little Explorers
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem' }}>
              Early Learning Centre
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 1 }} />

      {/* Navigation */}
      <List sx={{ flex: 1, py: 1, px: 1, overflow: 'auto' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                minHeight: 44,
                px: collapsed ? 1.5 : 2,
                justifyContent: collapsed ? 'center' : 'flex-start',
                backgroundColor: isActive ? 'rgba(91, 140, 90, 0.3)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(91, 140, 90, 0.2)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? '#A8D5A2' : '#94A3B8',
                  minWidth: collapsed ? 0 : 40,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#fff' : '#CBD5E1',
                      },
                    },
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* Collapse button */}
      <Box sx={{ p: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <IconButton
          onClick={onToggleCollapse}
          sx={{ color: '#94A3B8', width: '100%', borderRadius: 1.5 }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
    </Box>
  );
}
