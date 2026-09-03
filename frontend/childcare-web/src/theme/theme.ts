import { createTheme } from '@mui/material/styles';
import { colors } from './colors';
import { typography } from './typography';

export const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
    divider: colors.divider,
  },
  typography,
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '0 2px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
    '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
    '0 6px 16px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.04)',
    '0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04)',
    '0 12px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04)',
    '0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.04)',
    '0 16px 40px rgba(0,0,0,0.12), 0 6px 12px rgba(0,0,0,0.04)',
    '0 16px 40px rgba(0,0,0,0.14), 0 6px 12px rgba(0,0,0,0.04)',
    '0 20px 48px rgba(0,0,0,0.14), 0 8px 16px rgba(0,0,0,0.04)',
    '0 20px 48px rgba(0,0,0,0.16), 0 8px 16px rgba(0,0,0,0.04)',
    '0 24px 56px rgba(0,0,0,0.16), 0 8px 16px rgba(0,0,0,0.04)',
    '0 24px 56px rgba(0,0,0,0.18), 0 10px 20px rgba(0,0,0,0.04)',
    '0 28px 64px rgba(0,0,0,0.18), 0 10px 20px rgba(0,0,0,0.04)',
    '0 28px 64px rgba(0,0,0,0.20), 0 12px 24px rgba(0,0,0,0.04)',
    '0 32px 72px rgba(0,0,0,0.20), 0 12px 24px rgba(0,0,0,0.04)',
    '0 32px 72px rgba(0,0,0,0.22), 0 12px 24px rgba(0,0,0,0.04)',
    '0 36px 80px rgba(0,0,0,0.22), 0 14px 28px rgba(0,0,0,0.04)',
    '0 36px 80px rgba(0,0,0,0.24), 0 14px 28px rgba(0,0,0,0.04)',
    '0 40px 88px rgba(0,0,0,0.24), 0 14px 28px rgba(0,0,0,0.04)',
    '0 40px 88px rgba(0,0,0,0.26), 0 16px 32px rgba(0,0,0,0.04)',
    '0 44px 96px rgba(0,0,0,0.26), 0 16px 32px rgba(0,0,0,0.04)',
    '0 44px 96px rgba(0,0,0,0.28), 0 16px 32px rgba(0,0,0,0.04)',
    '0 48px 100px rgba(0,0,0,0.30), 0 16px 32px rgba(0,0,0,0.04)',
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary.dark} 0%, #2E5A2D 100%)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${colors.divider}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          fontSize: '0.875rem',
        },
        head: {
          fontWeight: 600,
          color: colors.text.secondary,
          backgroundColor: colors.neutral[50],
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
        },
      },
    },
  },
});