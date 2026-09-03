import { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Breadcrumbs,
  Link,
  Paper,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  ArrowBack,
  Edit,
  Send,
  CheckCircle,
  Description,
  AttachFile,
  Person,
  LocationOn,
  AccessTime,
  NotificationsActive,
  NotificationsOff,
  Warning,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { mockIncidents } from '@/mock/incidents';
import { mockChildren } from '@/mock/children';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { showSnackbar } from '@/features/auth/uiSlice';
import { INCIDENT_STATUS_COLORS, SEVERITY_COLORS } from '@/constants/statuses';
import { formatDate, formatTime, formatDateTime } from '@/utils/formatters';

const STATUS_WORKFLOW: { status: string; label: string }[] = [
  { status: 'DRAFT', label: 'Draft' },
  { status: 'REPORTED', label: 'Reported' },
  { status: 'PARENT_NOTIFIED', label: 'Parent Notified' },
  { status: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { status: 'FOLLOW_UP', label: 'Follow-up' },
  { status: 'CLOSED', label: 'Closed' },
];

const IncidentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const incident = useMemo(() => {
    return mockIncidents.find((i) => i.id === id);
  }, [id]);

  const child = useMemo(() => {
    if (!incident) return null;
    return mockChildren.find((c) => c.id === incident.childId);
  }, [incident]);

  if (!incident) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title="Incident Not Found" />
        <Alert severity="error" sx={{ mb: 2 }}>
          The incident you are looking for does not exist or has been removed.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/incidents')}
        >
          Back to Incidents
        </Button>
      </Box>
    );
  }

  const currentStepIndex = STATUS_WORKFLOW.findIndex(
    (s) => s.status === incident.status
  );

  const getNextStatus = (): string | null => {
    if (currentStepIndex < STATUS_WORKFLOW.length - 1) {
      return STATUS_WORKFLOW[currentStepIndex + 1].status;
    }
    return null;
  };

  const handleUpdateStatus = () => {
    const nextStatus = getNextStatus();
    if (nextStatus) {
      dispatch(
        showSnackbar({
          message: `Incident status updated to ${nextStatus.replace('_', ' ')}`,
          severity: 'success',
        })
      );
    }
  };

  const getStatusActionButton = () => {
    const nextStatus = getNextStatus();
    if (!nextStatus) return null;

    const labelMap: Record<string, string> = {
      REPORTED: 'Submit Report',
      PARENT_NOTIFIED: 'Notify Parent',
      ACKNOWLEDGED: 'Acknowledge',
      FOLLOW_UP: 'Start Follow-up',
      CLOSED: 'Close Incident',
    };

    const iconMap: Record<string, React.ReactNode> = {
      REPORTED: <Send fontSize="small" />,
      PARENT_NOTIFIED: <NotificationsActive fontSize="small" />,
      ACKNOWLEDGED: <CheckCircle fontSize="small" />,
      FOLLOW_UP: <Edit fontSize="small" />,
      CLOSED: <CheckCircle fontSize="small" />,
    };

    return (
      <Button
        variant="contained"
        color={nextStatus === 'CLOSED' ? 'success' : 'primary'}
        startIcon={iconMap[nextStatus]}
        onClick={handleUpdateStatus}
      >
        {labelMap[nextStatus] || `Move to ${nextStatus.replace('_', ' ')}`}
      </Button>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component={RouterLink}
          to="/incidents"
          color="inherit"
          sx={{ textDecoration: 'none' }}
        >
          Incidents
        </Link>
        <Typography color="text.primary">{incident.id}</Typography>
      </Breadcrumbs>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${SEVERITY_COLORS[incident.severity]}15 0%, ${INCIDENT_STATUS_COLORS[incident.status]}10 100%)`,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: SEVERITY_COLORS[incident.severity],
            }}
          >
            <Warning sx={{ fontSize: 28 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Incident {incident.id}
              </Typography>
              <StatusBadge
                label={incident.severity}
                color={SEVERITY_COLORS[incident.severity] || '#94A3B8'}
                size="medium"
              />
              <StatusBadge
                label={incident.status.replace('_', ' ')}
                color={INCIDENT_STATUS_COLORS[incident.status] || '#94A3B8'}
                size="medium"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {child ? `${child.firstName} ${child.lastName}` : 'Unknown Child'}{' '}
              &middot; {incident.location}
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {getStatusActionButton()}
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => {}}
            >
              Edit
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Incident Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Person color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Child
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {child
                        ? `${child.firstName} ${child.lastName}`
                        : 'Unknown'}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTime color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Date & Time
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDate(incident.reportedAt)}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocationOn color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {incident.location}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Person color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Reported By
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {incident.reportedBy}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Description
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {incident.description}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Actions Taken
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {incident.actionTaken}
              </Typography>
            </CardContent>
          </Card>

          {incident.followUpRequired && incident.followUpNotes && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Follow-up
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {incident.followUpNotes}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Parent Notification
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" spacing={1} alignItems="center">
                {incident.parentNotified ? (
                  <>
                    <NotificationsActive color="success" />
                    <Typography variant="body2" fontWeight={500} color="success.main">
                      Parent has been notified
                    </Typography>
                    {incident.parentNotifiedAt && (
                      <Typography variant="caption" color="text.secondary">
                        on {formatDateTime(incident.parentNotifiedAt)}
                      </Typography>
                    )}
                  </>
                ) : (
                  <>
                    <NotificationsOff color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Parent has not been notified yet
                    </Typography>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>

          {incident.attachments && incident.attachments.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Attachments
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {incident.attachments.map((attachment, index) => (
                    <ListItem key={index} divider={index < incident.attachments.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <AttachFile />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={attachment}
                        secondary="Attached file"
                      />
                      <Tooltip title="Download">
                        <IconButton size="small">
                          <Description fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {incident.attachments && incident.attachments.length === 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Attachments
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No attachments have been added to this incident.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AttachFile />}
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => {}}
                >
                  Add Attachment
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>

        <Box sx={{ width: { lg: 320 }, flexShrink: 0 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Status Workflow
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stepper
                activeStep={currentStepIndex}
                orientation="vertical"
                sx={{
                  '& .MuiStepLabel-label': {
                    typography: 'body2',
                  },
                }}
              >
                {STATUS_WORKFLOW.map((step, index) => (
                  <Step key={step.status} completed={index < currentStepIndex}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor:
                              index <= currentStepIndex
                                ? INCIDENT_STATUS_COLORS[step.status]
                                : 'grey.300',
                            color: 'white',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {index < currentStepIndex ? (
                            <CheckCircle sx={{ fontSize: 16 }} />
                          ) : (
                            index + 1
                          )}
                        </Box>
                      )}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={index === currentStepIndex ? 600 : 400}
                        color={index === currentStepIndex ? 'text.primary' : 'text.secondary'}
                      >
                        {step.label}
                      </Typography>
                    </StepLabel>
                    {index < STATUS_WORKFLOW.length - 1 && (
                      <StepContent>
                        <Box />
                      </StepContent>
                    )}
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(incident.createdAt)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(incident.updatedAt)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Incident ID
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {incident.id}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
};

export default IncidentDetailPage;
