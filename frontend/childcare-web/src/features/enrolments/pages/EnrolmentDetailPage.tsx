import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Chip, Button, Tabs, Tab, Divider } from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { mockEnrolments } from '@/mock/enrolments';
import { mockChildren } from '@/mock/children';
import { mockFamilies } from '@/mock/families';
import { ENROLMENT_STATUS_COLORS } from '@/constants/statuses';
import { formatDate, formatCurrency } from '@/utils/formatters';

export function EnrolmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const enrolment = mockEnrolments.find(e => e.id === id);
  const child = enrolment ? mockChildren.find(c => c.id === enrolment.childId) : null;
  const family = enrolment ? mockFamilies.find(f => f.id === enrolment.familyId) : null;

  if (!enrolment || !child) {
    return (
      <Box>
        <PageHeader title="Enrolment Not Found" backTo="/enrolments" />
        <Typography variant="body1" color="text.secondary">
          The enrolment you're looking for doesn't exist.
        </Typography>
      </Box>
    );
  }

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <Box sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>{value}</Typography>
    </Box>
  );

  return (
    <Box>
      <PageHeader
        title={`${child.firstName} ${child.lastName} - Enrolment`}
        subtitle={`Enrolment #${enrolment.id}`}
        breadcrumb={[
          { label: 'Enrolments', path: '/enrolments' },
          { label: `${child.firstName} ${child.lastName}` },
        ]}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <StatusBadge label={enrolment.status.replace(/_/g, ' ')} color={ENROLMENT_STATUS_COLORS[enrolment.status]} size="medium" />
            <Button variant="outlined" startIcon={<Edit />}>Edit</Button>
          </Box>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3 }}>
              <Tab label="Details" />
              <Tab label="Schedule" />
              <Tab label="Fees" />
              <Tab label="Documents" />
            </Tabs>
          </Box>
          <Box sx={{ p: 3 }}>
            {tab === 0 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoRow label="Child" value={`${child.firstName} ${child.lastName}`} />
                  <InfoRow label="Family" value={`${family?.primaryContact.firstName} ${family?.primaryContact.lastName}`} />
                  <InfoRow label="Room" value={child.roomId} />
                  <InfoRow label="Enrolment Start" value={formatDate(enrolment.startDate)} />
                  {enrolment.endDate && <InfoRow label="Enrolment End" value={formatDate(enrolment.endDate)} />}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoRow label="Status" value={enrolment.status.replace(/_/g, ' ')} />
                  <InfoRow label="Hours Per Week" value={`${enrolment.hoursPerWeek}h`} />
                  <InfoRow label="Days Per Week" value={
                    Object.entries(enrolment.schedule)
                      .filter(([, v]) => v)
                      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
                      .join(', ')
                  } />
                  <InfoRow label="Created" value={formatDate(enrolment.createdAt)} />
                  <InfoRow label="Last Updated" value={formatDate(enrolment.updatedAt)} />
                </Grid>
              </Grid>
            )}
            {tab === 1 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Weekly Schedule</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => (
                    <Chip
                      key={day}
                      label={day.charAt(0).toUpperCase() + day.slice(1)}
                      color={enrolment.schedule[day as keyof typeof enrolment.schedule] ? 'primary' : 'default'}
                      variant={enrolment.schedule[day as keyof typeof enrolment.schedule] ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Hours Per Week: {enrolment.hoursPerWeek}h
                </Typography>
              </Box>
            )}
            {tab === 2 && (
              <Box>
                <InfoRow label="Daily Rate" value={formatCurrency(enrolment.dailyRate)} />
                <InfoRow label="Subsidy" value={`${enrolment.subsidyPercentage}%`} />
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#F0FDF4', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Estimated Weekly: {formatCurrency(enrolment.dailyRate * enrolment.hoursPerWeek / 8)}
                  </Typography>
                </Box>
              </Box>
            )}
            {tab === 3 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Enrolment documents will appear here once connected to a backend.
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
