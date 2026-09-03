import { useState, useMemo } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Select, MenuItem, FormControl, InputLabel, useMediaQuery, useTheme, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add, Visibility } from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { StatusBadge } from '@/components/common/StatusBadge';
import { FilterPanel } from '@/components/common/FilterPanel';
import { EmptyState } from '@/components/common/EmptyState';
import { mockEnrolments } from '@/mock/enrolments';
import { mockChildren } from '@/mock/children';
import { mockFamilies } from '@/mock/families';
import { ENROLMENT_STATUS_COLORS } from '@/constants/statuses';
import { formatDate } from '@/utils/formatters';

export function EnrolmentsListPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return mockEnrolments.filter(e => {
      const child = mockChildren.find(c => c.id === e.childId);
      const family = mockFamilies.find(f => f.id === e.familyId);
      const matchSearch = !search ||
        `${child?.firstName} ${child?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        `${family?.primaryContact.firstName} ${family?.primaryContact.lastName}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: mockEnrolments.length };
    mockEnrolments.forEach(e => { counts[e.status] = (counts[e.status] || 0) + 1; });
    return counts;
  }, []);

  return (
    <Box>
      <PageHeader
        title="Enrolments"
        subtitle={`${mockEnrolments.length} total enrolments`}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <StatusBadge label={`Active: ${statusCounts.ACTIVE || 0}`} color={ENROLMENT_STATUS_COLORS.ACTIVE} />
          </Box>
        }
      />

      <FilterPanel>
        <SearchInput value={search} onChange={setSearch} placeholder="Search enrolments..." />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="ALL">All ({statusCounts.ALL})</MenuItem>
            <MenuItem value="DRAFT">Draft ({statusCounts.DRAFT || 0})</MenuItem>
            <MenuItem value="PENDING_APPROVAL">Pending ({statusCounts.PENDING_APPROVAL || 0})</MenuItem>
            <MenuItem value="ACTIVE">Active ({statusCounts.ACTIVE || 0})</MenuItem>
            <MenuItem value="COMPLETED">Completed ({statusCounts.COMPLETED || 0})</MenuItem>
            <MenuItem value="CANCELLED">Cancelled ({statusCounts.CANCELLED || 0})</MenuItem>
          </Select>
        </FormControl>
      </FilterPanel>

      {filtered.length === 0 ? (
        <EmptyState
          title="No enrolments found"
          description="Try adjusting your search or filter criteria."
          actionLabel="New Enrolment"
          onAction={() => {}}
        />
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(enrolment => {
            const child = mockChildren.find(c => c.id === enrolment.childId);
            const family = mockFamilies.find(f => f.id === enrolment.familyId);
            return (
              <Card key={enrolment.id} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/enrolments/${enrolment.id}`)}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {child?.firstName} {child?.lastName}
                    </Typography>
                    <StatusBadge label={enrolment.status.replace(/_/g, ' ')} color={ENROLMENT_STATUS_COLORS[enrolment.status]} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Family: {family?.primaryContact.firstName} {family?.primaryContact.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start: {formatDate(enrolment.startDate)} • {enrolment.hoursPerWeek}h/week
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
                <TableCell>Start Date</TableCell>
                <TableCell>Days/Week</TableCell>
                <TableCell>Daily Rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(enrolment => {
                const child = mockChildren.find(c => c.id === enrolment.childId);
                const family = mockFamilies.find(f => f.id === enrolment.familyId);
                return (
                  <TableRow
                    key={enrolment.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/enrolments/${enrolment.id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {child?.firstName} {child?.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {family?.primaryContact.firstName} {family?.primaryContact.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(enrolment.startDate)}</TableCell>
                    <TableCell>{enrolment.hoursPerWeek}h</TableCell>
                    <TableCell>${enrolment.dailyRate}/day</TableCell>
                    <TableCell>
                      <StatusBadge label={enrolment.status.replace(/_/g, ' ')} color={ENROLMENT_STATUS_COLORS[enrolment.status]} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/enrolments/${enrolment.id}`); }}>
                        <Visibility fontSize="small" />
                      </IconButton>
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
