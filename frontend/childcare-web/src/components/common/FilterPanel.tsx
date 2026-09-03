import { Box, Paper } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface FilterPanelProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export function FilterPanel({ children, sx }: FilterPanelProps) {
  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        borderRadius: 2,
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}
