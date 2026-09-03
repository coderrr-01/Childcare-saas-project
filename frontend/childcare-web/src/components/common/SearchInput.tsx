import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
}

export function SearchInput({ value, onChange, placeholder = 'Search...', fullWidth = true, size = 'small' }: SearchInputProps) {
  return (
    <TextField
      fullWidth={fullWidth}
      size={size}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: 'text.disabled', fontSize: 20 }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper',
          borderRadius: 2,
        },
      }}
    />
  );
}
