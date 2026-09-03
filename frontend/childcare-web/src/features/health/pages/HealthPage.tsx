import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Card,
  CardContent,
  IconButton,
  useMediaQuery,
  useTheme,
  Alert,
  Stack,
  Tooltip,
} from '@mui/material';
import { Warning, HealthAndSafety, Restaurant, Vaccines, BugReport } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { StatsCard } from '@/components/common/StatsCard';
import { Avatar } from '@/components/common/Avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { mockHealthRecords } from '@/mock/health';
import { mockChildren } from '@/mock/children';
import { formatDate } from '@/utils/formatters';
import type { HealthRecord } from '@/types';

const SEVERITY_COLORS: Record<string, string> = {
  LOW: '#22C55E',
  MODERATE: '#F59E0B',
  HIGH: '#F97316',
  CRITICAL: '#EF4444',
};

const TABS = ['All Children', 'Allergies', 'Medical Conditions', 'Dietary', 'Immunisations'];

const HealthPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const stats = useMemo(() => {
    const allergies = mockHealthRecords.filter((r) => r.type === 'ALLERGY').length;
    const medicalConditions = mockHealthRecords.filter((r) => r.type === 'MEDICAL_CONDITION').length;
    const dietary = mockHealthRecords.filter((r) => r.type === 'DIETARY_REQUIREMENT').length;
    const criticalAlerts = mockHealthRecords.filter(
      (r) => r.severity === 'HIGH' || r.severity === 'CRITICAL'
    ).length;
    return { allergies, medicalConditions, dietary, criticalAlerts };
  }, []);

  const filteredRecords = useMemo(() => {
    let records = mockHealthRecords;

    if (activeTab === 1) records = records.filter((r) => r.type === 'ALLERGY');
    else if (activeTab === 2) records = records.filter((r) => r.type === 'MEDICAL_CONDITION');
    else if (activeTab === 3) records = records.filter((r) => r.type === 'DIETARY_REQUIREMENT');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      records = records.filter((r) => {
        const child = mockChildren.find((c) => c.id === r.childId);
        const childName = child ? `${child.firstName} ${child.lastName}`.toLowerCase() : '';
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          childName.includes(q)
        );
      });
    }

    return records;
  }, [activeTab, searchQuery]);

  const childrenWithRecords = useMemo(() => {
    const childIds = new Set(filteredRecords.map((r) => r.childId));
    return mockChildren.filter((c) => childIds.has(c.id));
  }, [filteredRecords]);

  const getChildRecords = (childId: string): HealthRecord[] => {
    return filteredRecords.filter((r) => r.childId === childId);
  };

  const isCritical = (record: HealthRecord): boolean => {
    return record.severity === 'HIGH' || record.severity === 'CRITICAL';
  };

  const getSeverityColor = (severity?: string): string => {
    return SEVERITY_COLORS[severity || 'LOW'] || '#94A3B8';
  };

  const renderCriticalAlert = () => {
    if (stats.criticalAlerts === 0) return null;
    return (
      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {stats.criticalAlerts} Critical Health Alert{stats.criticalAlerts > 1 ? 's' : ''}
        </Typography>
        <Typography variant="body2">
          There are {stats.criticalAlerts} high/critical severity health record
          {stats.criticalAlerts > 1 ? 's' : ''} requiring immediate attention.
        </Typography>
      </Alert>
    );
  };

  const renderAllChildrenTab = () => {
    if (childrenWithRecords.length === 0) {
      return (
        <EmptyState
          title="No children found"
          description="No children match your search criteria."
        />
      );
    }

    if (isMobile) {
      return (
        <Box>
          {childrenWithRecords.map((child) => {
            const records = getChildRecords(child.id);
            const hasCritical = records.some(isCritical);
            return (
              <Card
                key={child.id}
                sx={{
                  mb: 2,
                  cursor: 'pointer',
                  borderLeft: hasCritical ? '4px solid' : '1px solid',
                  borderLeftColor: hasCritical ? 'error.main' : 'divider',
                  backgroundColor: hasCritical ? 'error.50' : 'background.paper',
                  '&:hover': { boxShadow: 3 },
                }}
                onClick={() => navigate(`/children/${child.id}`)}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={child.photoUrl}
                      firstName={child.firstName}
                      lastName={child.lastName}
                      size="medium"
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {child.firstName} {child.lastName}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} flexWrap="wrap">
                        {records.map((r) => (
                          <Chip
                            key={r.id}
                            label={r.title}
                            size="small"
                            icon={isCritical(r) ? <Warning sx={{ fontSize: 14 }} /> : undefined}
                            sx={{
                              backgroundColor: `${getSeverityColor(r.severity)}15`,
                              color: getSeverityColor(r.severity),
                              border: `1px solid ${getSeverityColor(r.severity)}30`,
                            }}
                          />
                        ))}
                      </Stack>
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
              <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Health Records</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Critical Alerts</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {childrenWithRecords.map((child) => {
              const records = getChildRecords(child.id);
              const hasCritical = records.some(isCritical);
              return (
                <TableRow
                  key={child.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: hasCritical ? 'error.50' : 'inherit',
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                  onClick={() => navigate(`/children/${child.id}`)}
                >
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{child.roomId}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {records.map((r) => (
                        <Chip
                          key={r.id}
                          label={r.title}
                          size="small"
                          icon={isCritical(r) ? <Warning sx={{ fontSize: 14 }} /> : undefined}
                          sx={{
                            backgroundColor: `${getSeverityColor(r.severity)}15`,
                            color: getSeverityColor(r.severity),
                            border: `1px solid ${getSeverityColor(r.severity)}30`,
                          }}
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {hasCritical ? (
                      <Chip
                        icon={<Warning sx={{ fontSize: 14 }} />}
                        label={`${records.filter(isCritical).length} Critical`}
                        size="small"
                        color="error"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        None
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View profile">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/children/${child.id}`);
                        }}
                      >
                        <HealthAndSafety fontSize="small" />
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

  const renderRecordsTab = () => {
    if (filteredRecords.length === 0) {
      return (
        <EmptyState
          title="No records found"
          description="No health records match your search criteria."
        />
      );
    }

    if (isMobile) {
      return (
        <Box>
          {filteredRecords.map((record) => {
            const child = mockChildren.find((c) => c.id === record.childId);
            return (
              <Card
                key={record.id}
                sx={{
                  mb: 2,
                  borderLeft: '4px solid',
                  borderLeftColor: getSeverityColor(record.severity),
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    {child && (
                      <Avatar
                        src={child.photoUrl}
                        firstName={child.firstName}
                        lastName={child.lastName}
                        size="small"
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {record.title}
                          </Typography>
                          {child && (
                            <Typography variant="caption" color="text.secondary">
                              {child.firstName} {child.lastName}
                            </Typography>
                          )}
                        </Box>
                        <StatusBadge
                          label={record.severity || 'LOW'}
                          color={getSeverityColor(record.severity)}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {record.description}
                      </Typography>
                      {record.dateIdentified && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Identified: {formatDate(record.dateIdentified)}
                        </Typography>
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
              <TableCell sx={{ fontWeight: 600 }}>Record</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date Identified</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((record) => {
              const child = mockChildren.find((c) => c.id === record.childId);
              return (
                <TableRow
                  key={record.id}
                  hover
                  sx={{
                    borderLeft: '4px solid',
                    borderLeftColor: getSeverityColor(record.severity),
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
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
                      {record.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {record.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={record.severity || 'LOW'}
                      color={getSeverityColor(record.severity)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {record.dateIdentified ? formatDate(record.dateIdentified) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                      {record.actionPlan || record.notes || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderImmunisationsTab = () => {
    return (
      <EmptyState
        icon={<Vaccines />}
        title="Immunisation Records"
        description="Immunisation records are managed through the child profile. Click on a child to view their full immunisation history."
        actionLabel="View Children"
        onAction={() => setActiveTab(0)}
      />
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="Health Management"
        subtitle="Track allergies, medical conditions, and dietary requirements"
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
          title="Allergies"
          value={stats.allergies}
          icon={<Warning />}
          color="#F59E0B"
        />
        <StatsCard
          title="Medical Conditions"
          value={stats.medicalConditions}
          icon={<HealthAndSafety />}
          color="#3B82F6"
        />
        <StatsCard
          title="Dietary Requirements"
          value={stats.dietary}
          icon={<Restaurant />}
          color="#8B5CF6"
        />
        <StatsCard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          icon={<BugReport />}
          color="#EF4444"
        />
      </Box>

      {renderCriticalAlert()}

      <Box sx={{ mb: 3 }}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by child name, record title, or description..."
          fullWidth
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

      {activeTab === 0 && renderAllChildrenTab()}
      {activeTab === 4 && renderImmunisationsTab()}
      {activeTab !== 0 && activeTab !== 4 && renderRecordsTab()}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredRecords.length} of {mockHealthRecords.length} records
        </Typography>
      </Box>
    </Box>
  );
};

export default HealthPage;
