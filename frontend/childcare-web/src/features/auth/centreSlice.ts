import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Centre } from '@/types';
import { mockRooms } from '@/mock/rooms';

interface CentreState {
  currentCentre: Centre | null;
  centres: Centre[];
}

const mockCentre: Centre = {
  id: 'centre-1',
  name: 'Little Explorers Early Learning',
  organisationId: 'org-1',
  address: '42 Eucalyptus Drive, Brisbane QLD 4000',
  phone: '(07) 3456 7890',
  email: 'info@littleexplorers.edu.au',
  capacity: 56,
  rooms: mockRooms,
  timezone: 'Australia/Brisbane',
};

const initialState: CentreState = {
  currentCentre: mockCentre,
  centres: [mockCentre],
};

const centreSlice = createSlice({
  name: 'centre',
  initialState,
  reducers: {
    setCurrentCentre(state, action: PayloadAction<Centre>) {
      state.currentCentre = action.payload;
    },
    setCentres(state, action: PayloadAction<Centre[]>) {
      state.centres = action.payload;
    },
  },
});

export const { setCurrentCentre, setCentres } = centreSlice.actions;
export default centreSlice.reducer;
