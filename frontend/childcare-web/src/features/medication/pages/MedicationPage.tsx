import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Medication, CheckCircle, Schedule, Warning, History, Add } from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsCard } from '@/components/common/StatsCard';
import { Avatar } from '@/components/common/Avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { mockMedications } from '@/mock/medication';
import { mockChildren } from '@/mock/children';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { showSnackbar } from '@/features/auth/uiSlice';
import { MEDICATION_STATUS_COLORS } from '@/constants/statuses';
import { formatDate, formatTime } from '@/utils/formatters';
import type { MedicationRecord } from '@/types';

const TABS = ["Today's Medications", 'All Medications', 'Schedule', 'History'];

type LocalMedStatus = 'SCHEDULED' | 'DUE' | 'ADMINISTERED' | 'MISSED' | 'SKIPPED';

const MedicationPage = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeTab, setActiveTab] = useState(0);
  const [medications, setMedications] = useState<MedicationRecord[]>(mockMedications);
  const [administerDialogOpen, setAdministerDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<MedicationRecord | null>(null);
  const [administerNotes, setAdministerNotes] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [medicationToConfirm, setMedicationToConfirm] = useState<MedicationRecord | null>(null);

  const getChild = useCallback((childId: string) => {
    return mockChildren.find((c) => c.id === childId);
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const scheduled = medications.filter((m) => m.status === 'ACTIVE').length;

    const dueToday = medications.filter((m) => {
      if (m.frequency === 'EMERGENCY') return false;
      if (m.nextDue && m.nextDue.startsWith(todayStr)) return true;
      if (m.frequency === 'AS_NEEDED') return true;
      return false;
    }).length;

    const administeredToday = medications.filter((m) => {
      if (!m.lastAdministered) return false;
      return m.lastAdministered.startsWith(todayStr);
    }).length;

    const missed = medications.filter((m) => {
      if (!m.nextDue) return false;
      const dueDate = new Date(m.nextDue);
      return dueDate < now && m.status === 'ACTIVE';
    }).length;

    return { dueToday, scheduled, administeredToday, missed };
  }, [medications]);

  const todayMedications = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    return medications.filter((m) => {
      if (m.frequency === 'EMERGENCY') return false;
      if (m.nextDue && m.nextDue.startsWith(todayStr)) return true;
      if (m.frequency === 'AS_NEEDED') return true;
      return false;
    });
  }, [medications]);

  const scheduledMedications = useMemo(() => {
    return medications.filter((m) => m.frequency === 'SCHEDULED' && m.status === 'ACTIVE');
  }, [medications]);

  const historyMedications = useMemo(() => {
    return medications.filter((m) => m.lastAdministered).sort((a, b) => {
      const dateA = new Date(a.lastAdministered || 0);
      const dateB = new Date(b.lastAdministered || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [medications]);

  const getMedicationStatus = (med: MedicationRecord): LocalMedStatus => {
    if (med.lastAdministered) {
      const today = new Date().toISOString().split('T')[0];
      if (med.lastAdministered.startsWith(today)) return 'ADMINISTERED';
    }
    if (med.nextDue) {
      const dueDate = new Date(med.nextDue);
      const now = new Date();
      if (dueDate < now) return 'MISSED';
      if (dueDate.toDateString() === now.toDateString()) return 'DUE';
    }
    if (med.frequency === 'AS_NEEDED') return 'DUE';
    return 'SCHEDULED';
  };

  const getStatusColor = (status: LocalMedStatus): string => {
    const colors: Record<LocalMedStatus, string> = {
      SCHEDULED: '#3B82F6',
      DUE: '#F59E0B',
      ADMINISTERED: '#22C55E',
      MISSED: '#EF4444',
      SKIPPED: '#94A3B8',
    };
    return colors[status];
  };

  const getStatusLabel = (status: LocalMedStatus): string => {
    const labels: Record<LocalMedStatus, string> = {
      SCHEDULED: 'Scheduled',
      DUE: 'Due',
      ADMINISTERED: 'Administered',
      MISSED: 'Missed',
      SKIPPED: 'Skipped',
    };
    return labels[status];
  };

  const handleOpenAdminister = (med: MedicationRecord) => {
    setSelectedMedication(med);
    setAdministerNotes('');
    setAdministerDialogOpen(true);
  };

  const handleAdminister = () => {
    if (!selectedMedication) return;

    const now = new Date().toISOString();
    setMedications((prev) =>
      prev.map((m) =>
        m.id === selectedMedication.id
          ? {
              ...m,
              lastAdministered: now,
              administeredBy: 'current-user',
              nextDue: calculateNextDue(m),
              updatedAt: now,
            }
          : m
      )
    );

    setAdministerDialogOpen(false);
    setSelectedMedication(null);
    setAdministerNotes('');

    dispatch(
      showSnackbar({
        message: `${selectedMedication.name} has been administered successfully.`,
        severity: 'success',
      })
    );
  };

  const handleQuickAdminister = (med: MedicationRecord) => {
    setMedicationToConfirm(med);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAdminister = () => {
    if (!medicationToConfirm) return;

    const now = new Date().toISOString();
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medicationToConfirm.id
          ? {
              ...m,
              lastAdministered: now,
              administeredBy: 'current-user',
              nextDue: calculateNextDue(m),
              updatedAt: now,
            }
          : m
      )
    );

    setConfirmDialogOpen(false);
    setMedicationToConfirm(null);

    dispatch(
      showSnackbar({
        message: `${medicationToConfirm.name} has been administered successfully.`,
        severity: 'success',
      })
    );
  };

  const calculateNextDue = (med: MedicationRecord): string | null => {
    if (med.frequency === 'AS_NEEDED' || med.frequency === 'EMERGENCY') return null;
    if (!med.scheduledTimes || med.scheduledTimes.length === 0) return null;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    for (const time of med.scheduledTimes) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledDate = new Date(todayStr);
      scheduledDate.setHours(hours, minutes, 0, 0);

      if (scheduledDate > now) {
        return scheduledDate.toISOString();
      }
    }

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, minutes] = med.scheduledTimes[0].split(':').map(Number);
    tomorrow.setHours(hours, minutes, 0, 0);
    return tomorrow.toISOString();
  };

  const renderTodayTab = () => {
    if (todayMedications.length === 0) {
      return (
        <EmptyState
          icon={<CheckCircle />}
          title="No medications due today"
          description="There are no medications scheduled for today."
        />
      );
    }

    return (
      <Grid container spacing={2}>
        {todayMedications.map((med) => {
          const child = getChild(med.childId);
          const status = getMedicationStatus(med);
          const statusColor = getStatusColor(status);

          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={med.id}>
              <Card
                sx={{
                  height: '100%',
                  borderLeft: '4px solid',
                  borderLeftColor: statusColor,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {child && (
                        <Avatar
                          src={child.photoUrl}
                          firstName={child.firstName}
                          lastName={child.lastName}
                          size="medium"
                        />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {child ? `${child.firstName} ${child.lastName}` : 'Unknown Child'}
                        </Typography>
                        <StatusBadge label={getStatusLabel(status)} color={statusColor} />
                      </Box>
                    </Stack>

                    <Divider />

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Medication
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {med.name}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Dosage
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {med.dosage}
                      </Typography>
                    </Box>

                    {med.nextDue && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Time Due
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatTime(med.nextDue)}
                        </Typography>
                      </Box>
                    )}

                    {med.lastAdministered && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Last Administered
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(med.lastAdministered)}
                        </Typography>
                      </Box>
                    )}

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Instructions
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {med.instructions}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {status === 'ADMINISTERED' ? (
                        <Button
                          variant="outlined"
                          disabled
                          startIcon={<CheckCircle />}
                          fullWidth
                        >
                          Administered
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<Medication />}
                          fullWidth
                          onClick={() => handleOpenAdminister(med)}
                        >
                          Administer
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderAllTab = () => {
    if (medications.length === 0) {
      return (
        <EmptyState
          icon={<Medication />}
          title="No medications"
          description="No medications have been added yet."
        />
      );
    }

    if (isMobile) {
      return (
        <Box>
          {medications.map((med) => {
            const child = getChild(med.childId);
            const status = getMedicationStatus(med);
            return (
              <Card key={med.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {child && (
                      <Avatar
                        src={child.photoUrl}
                        firstName={child.firstName}
                        lastName={child.lastName}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {med.name}
                          </Typography>
                          {child && (
                            <Typography variant="caption" color="text.secondary">
                              {child.firstName} {child.lastName}
                            </Typography>
                          )}
                        </Box>
                        <StatusBadge label={getStatusLabel(status)} color={getStatusColor(status)} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {med.dosage} - {med.frequency}
                      </Typography>
                      {status !== 'ADMINISTERED' && status !== 'MISSED' && (
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ mt: 1 }}
                          onClick={() => handleQuickAdminister(med)}
                        >
                          Quick Administer
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Child</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Medication</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Dosage</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Frequency</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Next Due</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medications.map((med) => {
              const child = getChild(med.childId);
              const status = getMedicationStatus(med);
              return (
                <TableRow key={med.id} hover>
                  <TableCell>
                    {child ? (
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={child.photoUrl}
                          firstName={child.firstName}
                          lastName={child.lastName}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {child.firstName} {child.lastName}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unknown
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {med.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{med.dosage}</TableCell>
                  <TableCell>
                    <Chip label={med.frequency} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={getStatusLabel(status)} color={getStatusColor(status)} />
                  </TableCell>
                  <TableCell>
                    {med.nextDue ? formatDate(med.nextDue, 'dd/MM/yyyy HH:mm') : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {status !== 'ADMINISTERED' && status !== 'MISSED' && (
                      <Tooltip title="Administer">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleQuickAdminister(med)}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="View details">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenAdminister(med)}
                      >
                        <Medication fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderScheduleTab = () => {
    if (scheduledMedications.length === 0) {
      return (
        <EmptyState
          icon={<Schedule />}
          title="No scheduled medications"
          description="No medications are currently on a schedule."
        />
      );
    }

    return (
      <Box>
        {scheduledMedications.map((med) => {
          const child = getChild(med.childId);
          return (
            <Card key={med.id} sx={{ mb: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  {child && (
                    <Avatar
                      src={child.photoUrl}
                      firstName={child.firstName}
                      lastName={child.lastName}
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {med.name}
                        </Typography>
                    {child && (
                      <Typography variant="body2" color="text.secondary">
                        {child.firstName} {child.lastName}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {med.scheduledTimes.map((time) => (
                        <Chip
                          key={time}
                          icon={<Schedule sx={{ fontSize: 14 }} />}
                          label={time}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {med.dosage} - {med.instructions}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };

  const renderHistoryTab = () => {
    if (historyMedications.length === 0) {
      return (
        <EmptyState
          icon={<History />}
          title="No administration history"
          description="No medications have been administered yet."
        />
      );
    }

    return (
      <List>
        {historyMedications.map((med, index) => {
          const child = getChild(med.childId);
          return (
            <Box key={med.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  {child && (
                    <Avatar
                      src={child.photoUrl}
                      firstName={child.firstName}
                      lastName={child.lastName}
                    />
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {med.name}
                      </Typography>
                      <StatusBadge label="Administered" color="#22C55E" />
                    </Stack>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" component="span">
                        {child ? `${child.firstName} ${child.lastName}` : 'Unknown Child'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {med.dosage} - Administered: {formatDate(med.lastAdministered || '')}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < historyMedications.length - 1 && <Divider variant="inset" component="li" />}
            </Box>
          );
        })}
      </List>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="Medication Management"
        subtitle="Track and administer medications for children in your care"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <StatsCard
          title="Due Today"
          value={stats.dueToday}
          icon={<Medication />}
          color="#F59E0B"
        />
        <StatsCard
          title="Scheduled"
          value={stats.scheduled}
          icon={<Schedule />}
          color="#3B82F6"
        />
        <StatsCard
          title="Administered Today"
          value={stats.administeredToday}
          icon={<CheckCircle />}
          color="#22C55E"
        />
        <StatsCard
          title="Missed"
          value={stats.missed}
          icon={<Warning />}
          color="#EF4444"
        />
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab} label={tab} />
        ))}
      </Tabs>

      {activeTab === 0 && renderTodayTab()}
      {activeTab === 1 && renderAllTab()}
      {activeTab === 2 && renderScheduleTab()}
      {activeTab === 3 && renderHistoryTab()}

      <Dialog
        open={administerDialogOpen}
        onClose={() => setAdministerDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Administer Medication</DialogTitle>
        <DialogContent>
          {selectedMedication && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Medication
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedMedication.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Child
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {(() => {
                    const child = getChild(selectedMedication.childId);
                    return child ? `${child.firstName} ${child.lastName}` : 'Unknown';
                  })()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Dosage
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedMedication.dosage}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Instructions
                </Typography>
                <Typography variant="body2">
                  {selectedMedication.instructions}
                </Typography>
              </Box>
              <TextField
                label="Notes (optional)"
                multiline
                rows={3}
                fullWidth
                value={administerNotes}
                onChange={(e) => setAdministerNotes(e.target.value)}
                placeholder="Add any notes about the administration..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAdministerDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleAdminister} variant="contained" color="primary">
            Confirm Administration
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDialogOpen}
        title="Quick Administer"
        message={`Are you sure you want to administer ${medicationToConfirm?.name} to ${
          getChild(medicationToConfirm?.childId || '')?.firstName || ''
        } ${getChild(medicationToConfirm?.childId || '')?.lastName || ''}?`}
        confirmLabel="Administer"
        onConfirm={handleConfirmAdminister}
        onCancel={() => {
          setConfirmDialogOpen(false);
          setMedicationToConfirm(null);
        }}
        severity="info"
      />
    </Box>
  );
};

export default MedicationPage;
