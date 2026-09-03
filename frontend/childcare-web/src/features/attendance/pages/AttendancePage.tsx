import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Stack,
  Tooltip,
  Snackbar,
  Alert,
  Checkbox,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Login,
  Logout,
  Download,
  SelectAll,
  PersonAdd,
  AccessTime,
  EventBusy,
  Warning,
  People,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { StatsCard } from '@/components/common/StatsCard';
import { Avatar as ChildAvatar } from '@/components/common/Avatar';
import { mockChildren } from '@/mock/children';
import { mockRooms } from '@/mock/rooms';
import { mockAttendance } from '@/mock/attendance';
import { calculateAge, formatDate, formatTime } from '@/utils/formatters';

const TODAY = '2026-09-03';

type LocalAttendanceStatus = 'EXPECTED' | 'PRESENT' | 'ABSENT' | 'LATE' | 'CHECKED_OUT';

interface AttendanceEntry {
  childId: string;
  status: LocalAttendanceStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
}

const STATUS_CONFIG: Record<LocalAttendanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  EXPECTED: { label: 'Expected', color: '#94A3B8', icon: <Schedule fontSize="small" /> },
  PRESENT: { label: 'Present', color: '#22C55E', icon: <CheckCircle fontSize="small" /> },
  ABSENT: { label: 'Absent', color: '#EF4444', icon: <Cancel fontSize="small" /> },
  LATE: { label: 'Late', color: '#F59E0B', icon: <AccessTime fontSize="small" /> },
  CHECKED_OUT: { label: 'Checked Out', color: '#6B7280', icon: <Logout fontSize="small" /> },
};

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

function calculateAgeFromDOB(dob: string): string {
  return calculateAge(dob);
}

export default function AttendancePage() {
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceMap, setAttendanceMap] = useState<Map<string, AttendanceEntry>>(() => {
    const map = new Map<string, AttendanceEntry>();
    const todayRecords = mockAttendance.filter((r) => r.date === TODAY);

    const enrolledChildren = mockChildren.filter((c) => c.enrolmentStatus === 'ENROLLED');
    for (const child of enrolledChildren) {
      const record = todayRecords.find((r) => r.childId === child.id);
      if (record) {
        let status: LocalAttendanceStatus = record.status as LocalAttendanceStatus;
        if (record.status === 'PRESENT' && record.checkOutTime) {
          status = 'CHECKED_OUT';
        }
        map.set(child.id, {
          childId: child.id,
          status,
          checkInTime: record.checkInTime ?? null,
          checkOutTime: record.checkOutTime ?? null,
        });
      } else {
        map.set(child.id, {
          childId: child.id,
          status: 'EXPECTED',
          checkInTime: null,
          checkOutTime: null,
        });
      }
    }
    return map;
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [selectedChildren, setSelectedChildren] = useState<Set<string>>(new Set());

  const enrolledChildren = useMemo(
    () => mockChildren.filter((c) => c.enrolmentStatus === 'ENROLLED'),
    []
  );

  const getChildAttendance = useCallback(
    (childId: string): AttendanceEntry => {
      return attendanceMap.get(childId) ?? {
        childId,
        status: 'EXPECTED',
        checkInTime: null,
        checkOutTime: null,
      };
    },
    [attendanceMap]
  );

  const updateAttendance = useCallback((childId: string, newStatus: LocalAttendanceStatus) => {
    setAttendanceMap((prev) => {
      const next = new Map(prev);
      const existing = prev.get(childId) ?? {
        childId,
        status: 'EXPECTED' as LocalAttendanceStatus,
        checkInTime: null,
        checkOutTime: null,
      };

      const now = getCurrentTime();
      let updated: AttendanceEntry;

      switch (newStatus) {
        case 'PRESENT':
          updated = {
            ...existing,
            status: 'PRESENT',
            checkInTime: existing.checkInTime ?? now,
            checkOutTime: null,
          };
          break;
        case 'LATE':
          updated = {
            ...existing,
            status: 'LATE',
            checkInTime: existing.checkInTime ?? now,
            checkOutTime: null,
          };
          break;
        case 'CHECKED_OUT':
          updated = {
            ...existing,
            status: 'CHECKED_OUT',
            checkOutTime: now,
          };
          break;
        case 'ABSENT':
          updated = {
            ...existing,
            status: 'ABSENT',
            checkInTime: null,
            checkOutTime: null,
          };
          break;
        default:
          updated = { ...existing, status: newStatus };
      }

      next.set(childId, updated);
      return next;
    });
  }, []);

  const handleCheckIn = useCallback(
    (childId: string) => {
      updateAttendance(childId, 'PRESENT');
      const child = enrolledChildren.find((c) => c.id === childId);
      setSnackbar({ open: true, message: `${child?.firstName} checked in`, severity: 'success' });
    },
    [updateAttendance, enrolledChildren]
  );

  const handleCheckOut = useCallback(
    (childId: string) => {
      updateAttendance(childId, 'CHECKED_OUT');
      const child = enrolledChildren.find((c) => c.id === childId);
      setSnackbar({ open: true, message: `${child?.firstName} checked out`, severity: 'info' });
    },
    [updateAttendance, enrolledChildren]
  );

  const handleMarkAbsent = useCallback(
    (childId: string) => {
      updateAttendance(childId, 'ABSENT');
      const child = enrolledChildren.find((c) => c.id === childId);
      setSnackbar({ open: true, message: `${child?.firstName} marked absent`, severity: 'info' });
    },
    [updateAttendance, enrolledChildren]
  );

  const handleMarkLate = useCallback(
    (childId: string) => {
      updateAttendance(childId, 'LATE');
      const child = enrolledChildren.find((c) => c.id === childId);
      setSnackbar({ open: true, message: `${child?.firstName} marked late`, severity: 'info' });
    },
    [updateAttendance, enrolledChildren]
  );

  const handleMarkPresent = useCallback(
    (childId: string) => {
      updateAttendance(childId, 'PRESENT');
      const child = enrolledChildren.find((c) => c.id === childId);
      setSnackbar({ open: true, message: `${child?.firstName} marked present`, severity: 'success' });
    },
    [updateAttendance, enrolledChildren]
  );

  const handleBulkMarkPresent = useCallback(() => {
    setAttendanceMap((prev) => {
      const next = new Map(prev);
      const now = getCurrentTime();
      const roomChildren = getFilteredChildren();
      for (const child of roomChildren) {
        const entry = prev.get(child.id);
        if (entry && (entry.status === 'EXPECTED' || entry.status === 'ABSENT')) {
          next.set(child.id, {
            ...entry,
            status: 'PRESENT',
            checkInTime: entry.checkInTime ?? now,
            checkOutTime: null,
          });
        }
      }
      return next;
    });
    setSelectedChildren(new Set());
    setSnackbar({ open: true, message: 'All expected/absent children marked present', severity: 'success' });
  }, []);

  const handleBulkCheckOut = useCallback(() => {
    setAttendanceMap((prev) => {
      const next = new Map(prev);
      const now = getCurrentTime();
      for (const childId of selectedChildren) {
        const entry = prev.get(childId);
        if (entry && (entry.status === 'PRESENT' || entry.status === 'LATE')) {
          next.set(childId, {
            ...entry,
            status: 'CHECKED_OUT',
            checkOutTime: now,
          });
        }
      }
      return next;
    });
    setSelectedChildren(new Set());
    setSnackbar({ open: true, message: 'Selected children checked out', severity: 'info' });
  }, [selectedChildren]);

  const toggleChildSelection = useCallback((childId: string) => {
    setSelectedChildren((prev) => {
      const next = new Set(prev);
      if (next.has(childId)) {
        next.delete(childId);
      } else {
        next.add(childId);
      }
      return next;
    });
  }, []);

  const toggleSelectAllInRoom = useCallback(() => {
    const roomChildren = getFilteredChildren();
    const allSelected = roomChildren.every((c) => selectedChildren.has(c.id));
    if (allSelected) {
      setSelectedChildren(new Set());
    } else {
      setSelectedChildren(new Set(roomChildren.map((c) => c.id)));
    }
  }, [selectedChildren]);

  const getRoomName = useCallback((roomId: string) => {
    const room = mockRooms.find((r) => r.id === roomId);
    return room?.name ?? 'Unknown';
  }, []);

  const getFilteredChildren = useCallback(() => {
    return enrolledChildren.filter((child) => {
      const matchesSearch =
        child.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.lastName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRoom = selectedRoom === 'all' || child.roomId === selectedRoom;
      return matchesSearch && matchesRoom;
    });
  }, [enrolledChildren, searchQuery, selectedRoom]);

  const filteredChildren = getFilteredChildren();

  const stats = useMemo(() => {
    const entries = Array.from(attendanceMap.values());
    return {
      present: entries.filter((e) => e.status === 'PRESENT' || e.status === 'LATE').length,
      expected: entries.filter((e) => e.status === 'EXPECTED').length,
      absent: entries.filter((e) => e.status === 'ABSENT').length,
      late: entries.filter((e) => e.status === 'LATE').length,
      total: entries.length,
    };
  }, [attendanceMap]);

  const roomTabs = useMemo(() => {
    const rooms = mockRooms;
    return [{ id: 'all', name: 'All Rooms' }, ...rooms];
  }, []);

  const handleExport = useCallback(() => {
    setSnackbar({ open: true, message: 'Attendance report exported', severity: 'success' });
  }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Attendance"
        subtitle={formatDate(TODAY, 'EEEE, d MMMM yyyy')}
        actions={
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{ minWidth: 120, minHeight: 44 }}
          >
            Export
          </Button>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <StatsCard
          title="Present"
          value={stats.present}
          subtitle={`of ${stats.total} enrolled`}
          color="#22C55E"
          icon={<CheckCircle />}
        />
        <StatsCard
          title="Expected"
          value={stats.expected}
          subtitle="not yet arrived"
          color="#3B82F6"
          icon={<Schedule />}
        />
        <StatsCard
          title="Absent"
          value={stats.absent}
          subtitle="not attending"
          color="#EF4444"
          icon={<EventBusy />}
        />
        <StatsCard
          title="Late"
          value={stats.late}
          subtitle="arrived after 9am"
          color="#F59E0B"
          icon={<AccessTime />}
        />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search children..."
            />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {selectedChildren.size > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Logout />}
                  onClick={handleBulkCheckOut}
                  sx={{ minHeight: 36 }}
                >
                  Check Out ({selectedChildren.size})
                </Button>
              )}
              <Tooltip title="Select all in room">
                <IconButton
                  onClick={toggleSelectAllInRoom}
                  sx={{ minWidth: 44, minHeight: 44 }}
                  color={filteredChildren.length > 0 && filteredChildren.every((c) => selectedChildren.has(c.id)) ? 'primary' : 'default'}
                >
                  <SelectAll />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Tabs
            value={selectedRoom}
            onChange={(_, value) => {
              setSelectedRoom(value);
              setSelectedChildren(new Set());
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 2,
              '& .MuiTab-root': {
                minHeight: 44,
                textTransform: 'none',
                fontWeight: 500,
              },
            }}
          >
            {roomTabs.map((room) => {
              const roomChildCount = room.id === 'all'
                ? enrolledChildren.length
                : enrolledChildren.filter((c) => c.roomId === room.id).length;
              return (
                <Tab
                  key={room.id}
                  value={room.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{room.name}</span>
                      <Chip
                        label={roomChildCount}
                        size="small"
                        sx={{
                          height: 22,
                          minWidth: 22,
                          '& .MuiChip-label': { px: 0.75, fontSize: '0.75rem' },
                        }}
                      />
                    </Box>
                  }
                />
              );
            })}
          </Tabs>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {filteredChildren.length} {filteredChildren.length === 1 ? 'child' : 'children'} in {selectedRoom === 'all' ? 'all rooms' : getRoomName(selectedRoom)}
            </Typography>
            <Button
              size="small"
              startIcon={<PersonAdd />}
              onClick={handleBulkMarkPresent}
              sx={{ textTransform: 'none', minHeight: 36 }}
            >
              Mark All Present
            </Button>
          </Box>

          {filteredChildren.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <People sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                No children found
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {filteredChildren.map((child) => {
                const entry = getChildAttendance(child.id);
                const config = STATUS_CONFIG[entry.status];
                const isSelected = selectedChildren.has(child.id);
                const isPresent = entry.status === 'PRESENT' || entry.status === 'LATE';
                const isCheckedOut = entry.status === 'CHECKED_OUT';
                const isAbsent = entry.status === 'ABSENT';
                const isExpected = entry.status === 'EXPECTED';

                return (
                  <Card
                    key={child.id}
                    variant="outlined"
                    sx={{
                      transition: 'all 0.15s ease-in-out',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      borderWidth: isSelected ? 2 : 1,
                      backgroundColor: isSelected ? 'primary.50' : 'background.paper',
                      '&:hover': { boxShadow: 2 },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        '&:last-child': { pb: { xs: 1.5, sm: 2 } },
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1.5, sm: 2 },
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleChildSelection(child.id)}
                        sx={{ p: 0.5, minWidth: 44, minHeight: 44 }}
                      />

                      <ChildAvatar
                        src={child.photoUrl}
                        firstName={child.firstName}
                        lastName={child.lastName}
                        size="medium"
                      />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                            {child.firstName} {child.lastName}
                          </Typography>
                          {child.allergies && child.allergies.length > 0 && (
                            <Tooltip title={`Allergies: ${child.allergies.join(', ')}`}>
                              <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
                            </Tooltip>
                          )}
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography variant="body2" color="text.secondary">
                            {calculateAgeFromDOB(child.dateOfBirth)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">·</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getRoomName(child.roomId)}
                          </Typography>
                        </Stack>
                        {(isPresent || isCheckedOut) && entry.checkInTime && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                            In: {formatTime(entry.checkInTime)}
                            {entry.checkOutTime && ` · Out: ${formatTime(entry.checkOutTime)}`}
                          </Typography>
                        )}
                      </Box>

                      <Chip
                        icon={config.icon as React.ReactElement}
                        label={config.label}
                        size="small"
                        sx={{
                          backgroundColor: `${config.color}18`,
                          color: config.color,
                          fontWeight: 600,
                          minWidth: 100,
                          justifyContent: 'center',
                          '& .MuiChip-icon': { color: config.color },
                          display: { xs: 'none', sm: 'flex' },
                        }}
                      />

                      <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
                        {(isExpected || isAbsent) && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<Login />}
                              onClick={() => isAbsent ? handleMarkPresent(child.id) : handleCheckIn(child.id)}
                              sx={{
                                minWidth: { xs: 44, sm: 100 },
                                minHeight: 44,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                px: { xs: 1, sm: 2 },
                              }}
                            >
                              {isAbsent ? 'Present' : 'Check In'}
                            </Button>
                            {!isAbsent && (
                              <Button
                                variant="outlined"
                                color="warning"
                                size="small"
                                startIcon={<AccessTime />}
                                onClick={() => handleMarkLate(child.id)}
                                sx={{
                                  minWidth: { xs: 44, sm: 80 },
                                  minHeight: 44,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                  px: { xs: 1, sm: 1.5 },
                                }}
                              >
                                Late
                              </Button>
                            )}
                          </>
                        )}

                        {isPresent && (
                          <>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<Logout />}
                              onClick={() => handleCheckOut(child.id)}
                              sx={{
                                minWidth: { xs: 44, sm: 100 },
                                minHeight: 44,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                px: { xs: 1, sm: 2 },
                              }}
                            >
                              Check Out
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Cancel />}
                              onClick={() => handleMarkAbsent(child.id)}
                              sx={{
                                minWidth: { xs: 44, sm: 90 },
                                minHeight: 44,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                px: { xs: 1, sm: 1.5 },
                              }}
                            >
                              Absent
                            </Button>
                          </>
                        )}

                        {isCheckedOut && (
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            startIcon={<Login />}
                            onClick={() => handleCheckIn(child.id)}
                            sx={{
                              minWidth: { xs: 44, sm: 100 },
                              minHeight: 44,
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                              px: { xs: 1, sm: 2 },
                            }}
                          >
                            Re-Check In
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
