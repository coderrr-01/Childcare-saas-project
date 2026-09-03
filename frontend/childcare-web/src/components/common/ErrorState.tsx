import { Box, Typography, Button } from '@mui/material';
import { ErrorOutlined } from '@mui/icons-material';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        textAlign: 'center',
      }}
    >
      <ErrorOutlined sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Box>
  );
}
