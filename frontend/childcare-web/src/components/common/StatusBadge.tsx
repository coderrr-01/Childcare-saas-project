import { Chip } from '@mui/material';

interface StatusBadgeProps {
  label: string;
  color: string;
  size?: 'small' | 'medium';
}

export function StatusBadge({ label, color, size = 'small' }: StatusBadgeProps) {
  return (
    <Chip
      label={label}
      size={size}
      sx={{
        backgroundColor: `${color}15`,
        color: color,
        fontWeight: 500,
        border: `1px solid ${color}30`,
      }}
    />
  );
}
