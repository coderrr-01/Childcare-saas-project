import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export function formatDate(dateStr: string, fmt: string = 'dd/MM/yyyy'): string {
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, fmt) : dateStr;
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, 'dd/MM/yyyy HH:mm');
}

export function formatTime(dateStr: string): string {
  return formatDate(dateStr, 'HH:mm');
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : dateStr;
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function calculateAge(dateOfBirth: string): string {
  const dob = parseISO(dateOfBirth);
  const now = new Date();
  const years = now.getFullYear() - dob.getFullYear();
  const months = now.getMonth() - dob.getMonth();
  if (years === 0) {
    const days = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
    return days < 30 ? `${days}d` : `${months}m`;
  }
  if (months < 0) {
    return `${years - 1}y ${months + 12}m`;
  }
  return months === 0 ? `${years}y` : `${years}y ${months}m`;
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function generateColor(str: string): string {
  const colors = [
    '#5B8C5A', '#4A9EAD', '#D4956A', '#A8A0C8', '#87CEEB',
    '#E8B89D', '#7BA87A', '#6DB5C2', '#2E7A87', '#3D6B3C',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}