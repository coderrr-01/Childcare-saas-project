import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Avatar,
  Stack,
  Tooltip,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Add,
  Warning,
  Medication as MedIcon,
  Visibility,
  MoreVert,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { StatusBadge } from '@/components/common/StatusBadge';
import { FilterPanel } from '@/components/common/FilterPanel';
import { EmptyState } from '@/components/common/EmptyState';
import { mockChildren } from '@/mock/children';
import { mockRooms } from '@/mock/rooms';
import type { Child } from '@/types';
import { calculateAge, formatDate } from '@/utils/formatters';
import { ATTENDANCE_STATUS_COLORS } from '@/constants/statuses';

const ChildrenListPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredChildren = useMemo(() => {
    return mockChildren.filter((child) => {
      const matchesSearch =
        child.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.lastName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRoom =
        selectedRoom === 'all' || child.roomId === selectedRoom;

      const matchesStatus =
        selectedStatus === 'all' || child.attendanceStatus === selectedStatus;

      return matchesSearch && matchesRoom && matchesStatus;
    });
  }, [searchQuery, selectedRoom, selectedStatus]);

  const handleRowClick = (childId: string) => {
    navigate(`/children/${childId}`);
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = ATTENDANCE_STATUS_COLORS || {
      checked_in: '#4caf50',
      checked_out: '#9e9e9e',
      absent: '#f44336',
      late: '#ff9800',
    };
    return statusMap[status] || '#9e9e9e';
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      checked_in: 'Checked In',
      checked_out: 'Checked Out',
      absent: 'Absent',
      late: 'Late',
    };
    return labelMap[status] || status;
  };

  const getRoomName = (roomId: string) => {
    const room = mockRooms.find((r) => r.id === roomId);
    return room?.name || 'Unknown';
  };

  const renderChildCard = (child: Child) => (
    <Card
      key={child.id}
      sx={{
        mb: 1.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-1px)',
        },
      }}
      onClick={() => handleRowClick(child.id)}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            src={child.photoUrl}
            alt={`${child.firstName} ${child.lastName}`}
            sx={{ width: 56, height: 56 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{ mb: 0.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                {child.firstName} {child.lastName}
              </Typography>
              <StatusBadge
                label={getStatusLabel(child.attendanceStatus)}
                color={getStatusColor(child.attendanceStatus)}
                size="small"
              />
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Age: {calculateAge(child.dateOfBirth)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Room: {getRoomName(child.roomId)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Parent: {child.parentName}
              </Typography>
            </Stack>
            {(child.allergies && child.allergies.length > 0) ||
            child.hasMedication ? (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {child.allergies && child.allergies.length > 0 && (
                  <Chip
                    icon={<Warning sx={{ fontSize: 14 }} />}
                    label="Allergies"
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                )}
                {child.hasMedication && (
                  <Chip
                    icon={<MedIcon sx={{ fontSize: 14 }} />}
                    label="Medication"
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                )}
              </Stack>
            ) : null}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="Children"
        action={{
          label: 'Add Child',
          icon: <Add />,
          onClick: () => navigate('/children/new'),
        }}
      />

      <FilterPanel sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ width: '100%' }}
        >
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name..."
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="room-filter-label">Room</InputLabel>
            <Select
              labelId="room-filter-label"
              value={selectedRoom}
              label="Room"
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              <MenuItem value="all">All Rooms</MenuItem>
              {mockRooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="checked_in">Checked In</MenuItem>
              <MenuItem value="checked_out">Checked Out</MenuItem>
              <MenuItem value="absent">Absent</MenuItem>
              <MenuItem value="late">Late</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </FilterPanel>

      {filteredChildren.length === 0 ? (
        <EmptyState
          title="No children found"
          description="Try adjusting your search or filter criteria."
        />
      ) : isMobile ? (
        <Box>
          {filteredChildren.map((child) => renderChildCard(child))}
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Photo & Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Age</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Parent</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Attendance</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Alerts</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredChildren.map((child) => (
                <TableRow
                  key={child.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                  onClick={() => handleRowClick(child.id)}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        src={child.photoUrl}
                        alt={`${child.firstName} ${child.lastName}`}
                        sx={{ width: 40, height: 40 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {child.firstName} {child.lastName}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{calculateAge(child.dateOfBirth)}</TableCell>
                  <TableCell>{getRoomName(child.roomId)}</TableCell>
                  <TableCell>{child.parentName}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={getStatusLabel(child.attendanceStatus)}
                      color={getStatusColor(child.attendanceStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {child.allergies && child.allergies.length > 0 && (
                        <Tooltip
                          title={`Allergies: ${child.allergies.join(', ')}`}
                        >
                          <IconButton size="small" color="warning">
                            <Warning fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {child.hasMedication && (
                        <Tooltip title="Has medication requirements">
                          <IconButton size="small" color="info">
                            <MedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View profile">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(child.id);
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More actions">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredChildren.length} of {mockChildren.length} children
        </Typography>
      </Box>
    </Box>
  );
};

export default ChildrenListPage;
