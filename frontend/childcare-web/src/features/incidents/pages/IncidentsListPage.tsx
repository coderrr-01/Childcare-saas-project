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
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add, Visibility } from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { StatusBadge } from '@/components/common/StatusBadge';
import { FilterPanel } from '@/components/common/FilterPanel';
import { StatsCard } from '@/components/common/StatsCard';
import { EmptyState } from '@/components/common/EmptyState';
import { mockIncidents } from '@/mock/incidents';
import { mockChildren } from '@/mock/children';
import { INCIDENT_STATUS_COLORS, SEVERITY_COLORS } from '@/constants/statuses';
import { formatDate, formatTime } from '@/utils/formatters';

const IncidentsListPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const stats = useMemo(() => {
    const total = mockIncidents.length;
    const draft = mockIncidents.filter((i) => i.status === 'DRAFT').length;
    const reported = mockIncidents.filter((i) => i.status === 'REPORTED').length;
    const followUp = mockIncidents.filter((i) => i.status === 'FOLLOW_UP').length;
    const closed = mockIncidents.filter((i) => i.status === 'CLOSED').length;
    return { total, draft, reported, followUp, closed };
  }, []);

  const filteredIncidents = useMemo(() => {
    return mockIncidents.filter((incident) => {
      const child = mockChildren.find((c) => c.id === incident.childId);
      const childName = child
        ? `${child.firstName} ${child.lastName}`
        : '';

      const matchesSearch =
        childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all' || incident.status === selectedStatus;

      const matchesSeverity =
        selectedSeverity === 'all' || incident.severity === selectedSeverity;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [searchQuery, selectedStatus, selectedSeverity]);

  const getChildName = (childId: string) => {
    const child = mockChildren.find((c) => c.id === childId);
    return child ? `${child.firstName} ${child.lastName}` : 'Unknown';
  };

  const handleRowClick = (incidentId: string) => {
    navigate(`/incidents/${incidentId}`);
  };

  const renderIncidentCard = (incident: (typeof mockIncidents)[number]) => (
    <Card
      key={incident.id}
      sx={{
        mb: 1.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-1px)',
        },
      }}
      onClick={() => handleRowClick(incident.id)}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{ mb: 0.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                {getChildName(incident.childId)}
              </Typography>
              <StatusBadge
                label={incident.severity}
                color={SEVERITY_COLORS[incident.severity] || '#94A3B8'}
                size="small"
              />
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {formatDate(incident.reportedAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {incident.location}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {incident.description}
              </Typography>
            </Stack>
            <Box sx={{ mt: 1 }}>
              <StatusBadge
                label={incident.status.replace('_', ' ')}
                color={INCIDENT_STATUS_COLORS[incident.status] || '#94A3B8'}
                size="small"
              />
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="Incidents"
        action={{
          label: 'Report Incident',
          icon: <Add />,
          onClick: () => navigate('/incidents/new'),
        }}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <StatsCard
          title="Total Incidents"
          value={stats.total}
          color="#3B82F6"
        />
        <StatsCard
          title="Draft"
          value={stats.draft}
          color={INCIDENT_STATUS_COLORS.DRAFT}
        />
        <StatsCard
          title="Reported"
          value={stats.reported}
          color={INCIDENT_STATUS_COLORS.REPORTED}
        />
        <StatsCard
          title="Follow-up"
          value={stats.followUp}
          color={INCIDENT_STATUS_COLORS.FOLLOW_UP}
        />
        <StatsCard
          title="Closed"
          value={stats.closed}
          color={INCIDENT_STATUS_COLORS.CLOSED}
        />
      </Stack>

      <FilterPanel sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ width: '100%' }}
        >
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by child, location, or ID..."
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="REPORTED">Reported</MenuItem>
              <MenuItem value="PARENT_NOTIFIED">Parent Notified</MenuItem>
              <MenuItem value="ACKNOWLEDGED">Acknowledged</MenuItem>
              <MenuItem value="FOLLOW_UP">Follow-up</MenuItem>
              <MenuItem value="CLOSED">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="severity-filter-label">Severity</InputLabel>
            <Select
              labelId="severity-filter-label"
              value={selectedSeverity}
              label="Severity"
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <MenuItem value="all">All Severities</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </FilterPanel>

      {filteredIncidents.length === 0 ? (
        <EmptyState
          title="No incidents found"
          description="Try adjusting your search or filter criteria."
        />
      ) : isMobile ? (
        <Box>
          {filteredIncidents.map((incident) => renderIncidentCard(incident))}
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date/Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Child</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reported By</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow
                  key={incident.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                  onClick={() => handleRowClick(incident.id)}
                >
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(incident.reportedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {getChildName(incident.childId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={incident.severity}
                      color={SEVERITY_COLORS[incident.severity] || '#94A3B8'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{incident.location}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{incident.reportedBy}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={incident.status.replace('_', ' ')}
                      color={INCIDENT_STATUS_COLORS[incident.status] || '#94A3B8'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View incident">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(incident.id);
                        }}
                      >
                        <Visibility fontSize="small" />
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
          Showing {filteredIncidents.length} of {mockIncidents.length} incidents
        </Typography>
      </Box>
    </Box>
  );
};

export default IncidentsListPage;
