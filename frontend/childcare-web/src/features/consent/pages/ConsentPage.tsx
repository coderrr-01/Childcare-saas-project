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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Button,
  useMediaQuery,
  useTheme,
  Chip,
  Drawer,
  Divider,
  Stack,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Block,
  Add,
  Close,
  Info,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterPanel } from '@/components/common/FilterPanel';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StatsCard } from '@/components/common/StatsCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { mockConsents } from '@/mock/consent';
import { mockChildren } from '@/mock/children';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { showSnackbar } from '@/features/auth/uiSlice';
import { CONSENT_STATUS_COLORS } from '@/constants/statuses';
import { formatDate } from '@/utils/formatters';

const STATUS_FILTERS = ['All', 'Approved', 'Pending', 'Declined', 'Expired'] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

function getStatusIcon(status: string) {
  switch (status?.toLowerCase()) {
    case 'approved':
      return <CheckCircle sx={{ color: 'success.main' }} />;
    case 'pending':
      return <HourglassEmpty sx={{ color: 'warning.main' }} />;
    case 'declined':
      return <Cancel sx={{ color: 'error.main' }} />;
    case 'expired':
      return <Block sx={{ color: 'grey.500' }} />;
    default:
      return <Info sx={{ color: 'grey.400' }} />;
  }
}

function getStatusChipColor(status: string): 'success' | 'warning' | 'error' | 'default' | 'info' {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'declined':
      return 'error';
    case 'expired':
      return 'default';
    default:
      return 'info';
  }
}

interface ConsentDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  consent: typeof mockConsents[0] | null;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
}

function ConsentDetailDrawer({
  open,
  onClose,
  consent,
  onApprove,
  onDecline,
}: ConsentDetailDrawerProps) {
  if (!consent) return null;

  const isPending = consent.status?.toLowerCase() === 'pending';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 420 } } } }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Consent Details</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Child
            </Typography>
            <Typography variant="body1">{mockChildren.find(c => c.id === consent.childId) ? `${mockChildren.find(c => c.id === consent.childId)!.firstName} ${mockChildren.find(c => c.id === consent.childId)!.lastName}` : consent.childId}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Consent Type
            </Typography>
            <Typography variant="body1">{consent.type}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1">{consent.description}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusIcon(consent.status)}
              <Chip
                label={consent.status}
                color={getStatusChipColor(consent.status)}
                size="small"
              />
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Requested Date
            </Typography>
            <Typography variant="body1">{formatDate(consent.createdAt)}</Typography>
          </Box>

          {consent.approvedAt && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Response Date
              </Typography>
              <Typography variant="body1">{formatDate(consent.approvedAt)}</Typography>
            </Box>
          )}

          {consent.expiresAt && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Expiry Date
              </Typography>
              <Typography variant="body1">              {formatDate(consent.expiresAt)}</Typography>
            </Box>
          )}

          {consent.description && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Notes
              </Typography>
                <Typography variant="body1">{consent.description}</Typography>
            </Box>
          )}

          {isPending && (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                fullWidth
                onClick={() => {
                  onApprove(consent.id);
                  onClose();
                }}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                fullWidth
                onClick={() => {
                  onDecline(consent.id);
                  onClose();
                }}
              >
                Decline
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}

interface ConsentCardProps {
  consent: typeof mockConsents[0];
  onViewDetails: (consent: typeof mockConsents[0]) => void;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
}

function ConsentCard({ consent, onViewDetails, onApprove, onDecline }: ConsentCardProps) {
  const isPending = consent.status?.toLowerCase() === 'pending';

  return (
    <Card sx={{ mb: 2, cursor: 'pointer' }} onClick={() => onViewDetails(consent)}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1">{mockChildren.find(c => c.id === consent.childId) ? `${mockChildren.find(c => c.id === consent.childId)!.firstName} ${mockChildren.find(c => c.id === consent.childId)!.lastName}` : consent.childId}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {consent.type}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {consent.description}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            {getStatusIcon(consent.status)}
            <Chip
              label={consent.status}
              color={getStatusChipColor(consent.status)}
              size="small"
            />
          </Box>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Requested: {formatDate(consent.createdAt)}
          </Typography>
          {consent.expiresAt && (
            <Typography variant="body2" color="text.secondary">
              Expires:               {formatDate(consent.expiresAt)}
            </Typography>
          )}
        </Stack>

        {isPending && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} onClick={(e) => e.stopPropagation()}>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => onApprove(consent.id)}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => onDecline(consent.id)}
            >
              Decline
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default function ConsentPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<typeof mockConsents[0] | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    type: 'approve' | 'decline';
    consentId: string | null;
  }>({ open: false, type: 'approve', consentId: null });

  const stats = useMemo(() => {
    const counts = { approved: 0, pending: 0, declined: 0, expired: 0 };
    mockConsents.forEach((c) => {
      const status = c.status?.toLowerCase();
      if (status === 'approved') counts.approved++;
      else if (status === 'pending') counts.pending++;
      else if (status === 'declined') counts.declined++;
      else if (status === 'expired') counts.expired++;
    });
    return counts;
  }, []);

  const filteredConsents = useMemo(() => {
    return mockConsents.filter((consent) => {
      const matchesStatus =
        statusFilter === 'All' || consent.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesSearch =
        (mockChildren.find(c => c.id === consent.childId)?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mockChildren.find(c => c.id === consent.childId)?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        consent.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consent.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchQuery]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
  };

  const handleViewDetails = (consent: typeof mockConsents[0]) => {
    setSelectedConsent(consent);
    setDetailDrawerOpen(true);
  };

  const handleApprove = (id: string) => {
    setConfirmAction({ open: true, type: 'approve', consentId: id });
  };

  const handleDecline = (id: string) => {
    setConfirmAction({ open: true, type: 'decline', consentId: id });
  };

  const handleConfirmAction = () => {
    const action = confirmAction.type === 'approve' ? 'approved' : 'declined';
    dispatch(
      showSnackbar({
        message: `Consent ${action} successfully`,
        severity: confirmAction.type === 'approve' ? 'success' : 'info',
      })
    );
    setConfirmAction({ open: false, type: 'approve', consentId: null });
  };

  return (
    <Box>
      <PageHeader title="Consent Management" />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <StatsCard
          title="Approved"
          value={stats.approved}
          icon={<CheckCircle />}
          color="success"
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={<HourglassEmpty />}
          color="warning"
        />
        <StatsCard
          title="Declined"
          value={stats.declined}
          icon={<Cancel />}
          color="error"
        />
        <StatsCard
          title="Expired"
          value={stats.expired}
          icon={<Block />}
          color="default"
        />
      </Box>

      <FilterPanel>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Status"
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {STATUS_FILTERS.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search consents..."
        />
      </FilterPanel>

      {filteredConsents.length === 0 ? (
        <EmptyState
          icon={<Info />}
          title="No consents found"
          description="No consents match your current filters."
        />
      ) : isMobile ? (
        <Box>
          {filteredConsents.map((consent) => (
            <ConsentCard
              key={consent.id}
              consent={consent}
              onViewDetails={handleViewDetails}
              onApprove={handleApprove}
              onDecline={handleDecline}
            />
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Child</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requested</TableCell>
                <TableCell>Response</TableCell>
                <TableCell>Expiry</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredConsents.map((consent) => (
                <TableRow
                  key={consent.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleViewDetails(consent)}
                >
                  <TableCell>{mockChildren.find(c => c.id === consent.childId) ? `${mockChildren.find(c => c.id === consent.childId)!.firstName} ${mockChildren.find(c => c.id === consent.childId)!.lastName}` : consent.childId}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{consent.type}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ maxWidth: 200, display: 'block' }}
                    >
                      {consent.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(consent.status)}
                      <Chip
                        label={consent.status}
                        color={getStatusChipColor(consent.status)}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(consent.createdAt)}</TableCell>
                  <TableCell>
                    {consent.approvedAt ? formatDate(consent.approvedAt) : '-'}
                  </TableCell>
                  <TableCell>
                    {consent.expiresAt ? formatDate(consent.expiresAt) : '-'}
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    {consent.status?.toLowerCase() === 'pending' && (
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleApprove(consent.id)}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDecline(consent.id)}
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Stack>
                    )}
                    {consent.status?.toLowerCase() === 'approved' && (
                      <CheckCircle sx={{ color: 'success.main' }} />
                    )}
                    {consent.status?.toLowerCase() === 'declined' && (
                      <Cancel sx={{ color: 'error.main' }} />
                    )}
                    {consent.status?.toLowerCase() === 'expired' && (
                      <Block sx={{ color: 'grey.500' }} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConsentDetailDrawer
        open={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedConsent(null);
        }}
        consent={selectedConsent}
        onApprove={handleApprove}
        onDecline={handleDecline}
      />

      <ConfirmDialog
        open={confirmAction.open}
        title={confirmAction.type === 'approve' ? 'Approve Consent' : 'Decline Consent'}
        message={
          confirmAction.type === 'approve'
            ? 'Are you sure you want to approve this consent?'
            : 'Are you sure you want to decline this consent?'
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction({ open: false, type: 'approve', consentId: null })}
        confirmLabel={confirmAction.type === 'approve' ? 'Approve' : 'Decline'}
      />
    </Box>
  );
}
