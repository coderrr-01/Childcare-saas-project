import { Avatar as MuiAvatar } from '@mui/material';
import { getInitials, generateColor } from '@/utils/formatters';

interface AvatarProps {
  src?: string;
  firstName: string;
  lastName: string;
  size?: 'small' | 'medium' | 'large';
  sx?: any;
}

const sizeMap = { small: 36, medium: 44, large: 64 };

export function Avatar({ src, firstName, lastName, size = 'medium', sx }: AvatarProps) {
  const initials = getInitials(firstName, lastName);
  const bgColor = generateColor(`${firstName}${lastName}`);
  const px = sizeMap[size];

  return (
    <MuiAvatar
      src={src}
      sx={{
        width: px,
        height: px,
        fontSize: px * 0.4,
        fontWeight: 600,
        bgcolor: bgColor,
        color: '#fff',
        ...sx,
      }}
    >
      {initials}
    </MuiAvatar>
  );
}
