import { Box, Typography, Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  sx?: SxProps<Theme>;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, sx }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
        ...sx,
      }}
    >
      {icon && (
        <Box sx={{ mb: 2, color: 'text.disabled', '& svg': { fontSize: 64 } }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
