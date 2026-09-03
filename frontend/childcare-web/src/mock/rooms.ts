import type { Room } from '@/types';

export const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Babies',
    minAge: 0,
    maxAge: 2,
    capacity: 10,
    centreId: 'centre-1',
    leadEducatorId: 'user-4',
    isActive: true,
  },
  {
    id: 'room-2',
    name: 'Toddlers',
    minAge: 1,
    maxAge: 3,
    capacity: 14,
    centreId: 'centre-1',
    leadEducatorId: 'user-4',
    isActive: true,
  },
  {
    id: 'room-3',
    name: 'Preschool',
    minAge: 3,
    maxAge: 4,
    capacity: 20,
    centreId: 'centre-1',
    leadEducatorId: 'user-4',
    isActive: true,
  },
  {
    id: 'room-4',
    name: 'Kindergarten',
    minAge: 4,
    maxAge: 5,
    capacity: 12,
    centreId: 'centre-1',
    leadEducatorId: 'user-4',
    isActive: true,
  },
];
