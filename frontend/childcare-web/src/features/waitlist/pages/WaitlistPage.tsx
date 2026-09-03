import { useState, useMemo } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Select, MenuItem, FormControl, InputLabel, useMediaQuery, useTheme, Card, CardContent, Chip } from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { StatusBadge } from '@/components/common/StatusBadge';
import { FilterPanel } from '@/components/common/FilterPanel';
import { EmptyState } from '@/components/common/EmptyState';
import { mockWaitlist } from '@/mock/waitlist';
import { mockChildren } from '@/mock/children';
import { mockFamilies } from '@/mock/families';
import { mockRooms } from '@/mock/rooms';
import { WAITLIST_STATUS_COLORS } from '@/constants/statuses';
import { formatDate } from '@/utils/formatters';

const priorityColors: Record<string, { color: string; label: string }> = {
  HIGH: { color: '#EF4444', label: 'High' },
  MEDIUM: { color: '#F59E0B', label: 'Medium' },
  LOW: { color: '#22C55E', label: 'Low' },
};

export function WaitlistPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return mockWaitlist.filter(entry => {
      const child = mockChildren.find(c => c.id === entry.childId);
      const matchSearch = !search || `${child?.firstName} ${child?.lastName}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || entry.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <Box>
      <PageHeader
        title="Waitlist"
        subtitle={`${mockWaitlist.length} entries`}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <StatusBadge label={`Active: ${mockWaitlist.filter(w => w.status === 'ACTIVE').length}`} color="#3B82F6" />
          </Box>
        }
      />

      <FilterPanel>
        <SearchInput value={search} onChange={setSearch} placeholder="Search waitlist..." />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="OFFERED">Offered</MenuItem>
            <MenuItem value="ENROLLED">Enrolled</MenuItem>
            <MenuItem value="EXPIRED">Expired</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </FilterPanel>

      {filtered.length === 0 ? (
        <EmptyState title="No waitlist entries" description="The waitlist is currently empty." actionLabel="Add to Waitlist" onAction={() => {}} />
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(entry => {
            const child = mockChildren.find(c => c.id === entry.childId);
            const family = mockFamilies.find(f => f.id === entry.familyId);
            const pri = priorityColors[entry.priority] || priorityColors[3];
            return (
              <Card key={entry.id}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {child?.firstName} {child?.lastName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip label={pri.label} size="small" sx={{ backgroundColor: `${pri.color}15`, color: pri.color, fontWeight: 500 }} />
                      <StatusBadge label={entry.status} color={WAITLIST_STATUS_COLORS[entry.status]} />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Family: {family?.primaryContact.firstName} {family?.primaryContact.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Requested: {formatDate(entry.preferredStartDate)} • Room: {entry.preferredRoomId || 'Any'}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Child</TableCell>
                <TableCell>Family</TableCell>
                <TableCell>Requested Start</TableCell>
                <TableCell>Preferred Days</TableCell>
                <TableCell>Preferred Room</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(entry => {
                const child = mockChildren.find(c => c.id === entry.childId);
                const family = mockFamilies.find(f => f.id === entry.familyId);
                const pri = priorityColors[entry.priority] || priorityColors[3];
                return (
                  <TableRow key={entry.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{child?.firstName} {child?.lastName}</Typography>
                    </TableCell>
                    <TableCell>{family?.primaryContact.firstName} {family?.primaryContact.lastName}</TableCell>
                    <TableCell>{formatDate(entry.requestedStartDate)}</TableCell>
                    <TableCell>{entry.preferredRoomId ? mockRooms.find(r => r.id === entry.preferredRoomId)?.name || entry.preferredRoomId : 'Any'}</TableCell>
                    <TableCell>{entry.preferredRoomId || 'Any'}</TableCell>
                    <TableCell>
                      <Chip label={pri.label} size="small" sx={{ backgroundColor: `${pri.color}15`, color: pri.color, fontWeight: 500 }} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge label={entry.status} color={WAITLIST_STATUS_COLORS[entry.status]} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
