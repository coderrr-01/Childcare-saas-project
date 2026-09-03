import { Card, CardContent, Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: { value: number; isPositive: boolean };
  sx?: SxProps<Theme>;
}

export function StatsCard({ title, value, subtitle, icon, color = '#5B8C5A', trend, sx }: StatsCardProps) {
  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Typography
                variant="caption"
                sx={{
                  color: trend.isPositive ? 'success.main' : 'error.main',
                  fontWeight: 600,
                  mt: 0.5,
                  display: 'block',
                }}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </Typography>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: `${color}15`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
