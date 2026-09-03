import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardHeader, Grid, Tabs, Tab, Button, Chip, Avatar,
  List, ListItem, ListItemIcon, ListItemText, ListItemAvatar, Divider, IconButton, Paper,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Stack, useMediaQuery, useTheme,
} from '@mui/material';
import {
  ArrowBack, Edit, CalendarToday, Cake, Home, Phone, Email,
  Warning, Medication, School, PhotoLibrary, Description, Timeline,
  ChildCare, Login, Logout, Message, NoteAdd, ReportProblem, Add,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Avatar as ChildAvatar } from '@/components/common/Avatar';
import { mockChildren } from '@/mock/children';
import { mockRooms } from '@/mock/rooms';
import { calculateAge, formatDate, formatDateTime } from '@/utils/formatters';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { showSnackbar } from '@/features/auth/uiSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const mockTimeline = [
  { id: '1', time: '09:02', title: 'Checked in', icon: <Login sx={{ color: 'success.main', fontSize: 20 }} />, description: 'Arrived at centre' },
  { id: '2', time: '09:30', title: 'Breakfast', icon: <ChildCare sx={{ color: 'warning.main', fontSize: 20 }} />, description: 'Ate well - toast and fruit' },
  { id: '3', time: '10:15', title: 'Outdoor play', icon: <School sx={{ color: 'info.main', fontSize: 20 }} />, description: 'Played in the garden for 45 minutes' },
  { id: '4', time: '11:20', title: 'Learning story added', icon: <School sx={{ color: 'primary.main', fontSize: 20 }} />, description: 'New observation recorded by educator' },
  { id: '5', time: '12:05', title: 'Lunch', icon: <ChildCare sx={{ color: 'warning.main', fontSize: 20 }} />, description: 'Pasta and vegetables' },
  { id: '6', time: '13:00', title: 'Sleep started', icon: <PhotoLibrary sx={{ color: 'info.main', fontSize: 20 }} />, description: 'Fell asleep quickly' },
  { id: '7', time: '14:15', title: 'Sleep ended', icon: <PhotoLibrary sx={{ color: 'info.main', fontSize: 20 }} />, description: 'Woke happy and refreshed' },
  { id: '8', time: '15:30', title: 'Parent message', icon: <Message sx={{ color: 'primary.main', fontSize: 20 }} />, description: 'Message from parent about pickup' },
];

export default function ChildProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(0);

  const child = mockChildren.find((c) => c.id === id);
  const room = child ? mockRooms.find((r) => r.id === child.roomId) : null;

  if (!child) {
    return (
      <Box>
        <PageHeader title="Child Not Found" backTo="/children" />
        <Typography variant="body1" color="text.secondary">
          The child you're looking for doesn't exist.
        </Typography>
      </Box>
    );
  }

  const tabs = [
    'Overview', 'Personal Details', 'Attendance', 'Daily Care',
    'Health', 'Medication', 'Incidents', 'Learning', 'Photos', 'Timeline',
  ];

  return (
    <Box>
      <PageHeader
        title={`${child.firstName} ${child.lastName}`}
        subtitle={`${room?.name || 'Unknown Room'} • ${calculateAge(child.dateOfBirth)}`}
        breadcrumb={[
          { label: 'Children', path: '/children' },
          { label: `${child.firstName} ${child.lastName}` },
        ]}
        backTo="/children"
        actions={
          <Stack direction="row" spacing={1}>
            <StatusBadge label={child.enrolmentStatus} color={child.enrolmentStatus === 'ENROLLED' ? '#22C55E' : '#94A3B8'} size="medium" />
            {child.allergies.length > 0 && (
              <Chip icon={<Warning />} label="Allergies" color="warning" size="small" />
            )}
            {child.medicalConditions.length > 0 && (
              <Chip icon={<Medication />} label="Medical" color="error" size="small" />
            )}
          </Stack>
        }
      />

      {/* Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={isMobile ? 'column' : 'row'} spacing={3} sx={{ alignItems: isMobile ? 'flex-start' : 'center' }}>
            <ChildAvatar firstName={child.firstName} lastName={child.lastName} size="large" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{child.firstName} {child.lastName}</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <Cake sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                  DOB: {formatDate(child.dateOfBirth)} ({calculateAge(child.dateOfBirth)})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Room: {room?.name || 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {child.enrolmentStatus}
                </Typography>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Button variant="contained" size="small" startIcon={<Login />}>Check In</Button>
              <Button variant="outlined" size="small" startIcon={<Logout />}>Check Out</Button>
              <Button variant="outlined" size="small" startIcon={<NoteAdd />}>Daily Record</Button>
              <Button variant="outlined" size="small" startIcon={<ReportProblem />}>Incident</Button>
              <Button variant="outlined" size="small" startIcon={<Message />}>Message</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            {tabs.map((tab) => (
              <Tab key={tab} label={tab} />
            ))}
          </Tabs>

          {/* Overview Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ px: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Personal Information</Typography>
                      <List disablePadding>
                        <ListItem disablePadding sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}><Cake fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Date of Birth" secondary={formatDate(child.dateOfBirth)} />
                        </ListItem>
                        <ListItem disablePadding sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}><CalendarToday fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Age" secondary={calculateAge(child.dateOfBirth)} />
                        </ListItem>
                        <ListItem disablePadding sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}><Home fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Room" secondary={room?.name || 'Unknown'} />
                        </ListItem>
                        <ListItem disablePadding sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}><Phone fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Emergency Contact" secondary={`${child.emergencyContact} - ${child.emergencyPhone}`} />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Medical Alerts</Typography>
                      {child.allergies.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: 'warning.dark' }}>Allergies</Typography>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            {child.allergies.map((a) => (
                              <Chip key={a} label={a} color="warning" size="small" />
                            ))}
                          </Stack>
                        </Box>
                      )}
                      {child.medicalConditions.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: 'error.dark' }}>Medical Conditions</Typography>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            {child.medicalConditions.map((m) => (
                              <Chip key={m} label={m} color="error" size="small" />
                            ))}
                          </Stack>
                        </Box>
                      )}
                      {child.allergies.length === 0 && child.medicalConditions.length === 0 && (
                        <Typography variant="body2" color="text.secondary">No medical alerts on file.</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Personal Details Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ px: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoSection title="Basic Information">
                    <InfoRow label="Full Name" value={`${child.firstName} ${child.lastName}`} />
                    <InfoRow label="Date of Birth" value={formatDate(child.dateOfBirth)} />
                    <InfoRow label="Gender" value={child.gender.charAt(0).toUpperCase() + child.gender.slice(1)} />
                    <InfoRow label="Room" value={room?.name || 'Unknown'} />
                    <InfoRow label="Enrolment Status" value={child.enrolmentStatus} />
                  </InfoSection>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoSection title="Emergency Contact">
                    <InfoRow label="Name" value={child.emergencyContact} />
                    <InfoRow label="Phone" value={child.emergencyPhone} />
                  </InfoSection>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Attendance Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ px: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Recent Attendance</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Check In</TableCell>
                      <TableCell>Check Out</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { date: '2026-09-03', status: 'PRESENT', in: '08:15', out: '-' },
                      { date: '2026-09-02', status: 'PRESENT', in: '08:00', out: '16:30' },
                      { date: '2026-09-01', status: 'LATE', in: '09:15', out: '16:30' },
                      { date: '2026-08-29', status: 'ABSENT', in: '-', out: '-' },
                      { date: '2026-08-28', status: 'PRESENT', in: '08:05', out: '16:25' },
                    ].map((row) => (
                      <TableRow key={row.date}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>
                          <StatusBadge
                            label={row.status}
                            color={row.status === 'PRESENT' ? '#22C55E' : row.status === 'LATE' ? '#F59E0B' : '#EF4444'}
                          />
                        </TableCell>
                        <TableCell>{row.in}</TableCell>
                        <TableCell>{row.out}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>

          {/* Daily Care Tab */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ px: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Today's Records</Typography>
              <List>
                {[
                  { time: '09:30', type: 'Breakfast', detail: 'Toast and fruit - ate well', color: '#F59E0B' },
                  { time: '10:30', type: 'Water', detail: 'Drank 100ml water', color: '#3B82F6' },
                  { time: '12:00', type: 'Lunch', detail: 'Pasta and vegetables - ate most', color: '#F59E0B' },
                  { time: '13:00', type: 'Sleep', detail: 'Started sleep - slept well', color: '#8B5CF6' },
                  { time: '14:15', type: 'Sleep', detail: 'Woke happy', color: '#8B5CF6' },
                  { time: '14:30', type: 'Nappy', detail: 'Wet nappy changed', color: '#06B6D4' },
                ].map((record, i) => (
                  <ListItem key={i} sx={{ px: 0 }}>
                    <Box sx={{ width: 50, color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}>
                      {record.time}
                    </Box>
                    <Chip label={record.type} size="small" sx={{ mr: 2, backgroundColor: `${record.color}15`, color: record.color, minWidth: 80 }} />
                    <Typography variant="body2">{record.detail}</Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          </TabPanel>

          {/* Health Tab */}
          <TabPanel value={activeTab} index={4}>
            <Box sx={{ px: 3 }}>
              {child.allergies.length > 0 && (
                <AlertBox title="Allergies" items={child.allergies} color="warning" />
              )}
              {child.medicalConditions.length > 0 && (
                <AlertBox title="Medical Conditions" items={child.medicalConditions} color="error" />
              )}
              {child.allergies.length === 0 && child.medicalConditions.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                  No health records on file.
                </Typography>
              )}
            </Box>
          </TabPanel>

          {/* Medication Tab */}
          <TabPanel value={activeTab} index={5}>
            <Box sx={{ px: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Medication records for {child.firstName} will appear here.
              </Typography>
            </Box>
          </TabPanel>

          {/* Incidents Tab */}
          <TabPanel value={activeTab} index={6}>
            <Box sx={{ px: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Incident records for {child.firstName} will appear here.
              </Typography>
            </Box>
          </TabPanel>

          {/* Learning Tab */}
          <TabPanel value={activeTab} index={7}>
            <Box sx={{ px: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Learning stories for {child.firstName} will appear here.
              </Typography>
            </Box>
          </TabPanel>

          {/* Photos Tab */}
          <TabPanel value={activeTab} index={8}>
            <Box sx={{ px: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Photo gallery for {child.firstName} will appear here.
              </Typography>
            </Box>
          </TabPanel>

          {/* Timeline Tab */}
          <TabPanel value={activeTab} index={9}>
            <Box sx={{ px: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Today's Timeline</Typography>
              {mockTimeline.map((event, i) => (
                <Stack key={event.id} direction="row" spacing={2} sx={{ mb: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ width: 50, textAlign: 'right', color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem', pt: 0.5 }}>
                    {event.time}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {event.icon}
                    {i < mockTimeline.length - 1 && (
                      <Box sx={{ width: 2, height: 40, backgroundColor: 'divider', mt: 0.5 }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, pb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{event.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{event.description}</Typography>
                  </Box>
                </Stack>
              ))}
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>{title}</Typography>
        {children}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>{value}</Typography>
    </Box>
  );
}

function AlertBox({ title, items, color }: { title: string; items: string[]; color: 'warning' | 'error' }) {
  return (
    <Card variant="outlined" sx={{ mb: 2, borderColor: `${color}.main` }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: `${color}.dark`, mb: 1 }}>{title}</Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {items.map((item) => (
            <Chip key={item} label={item} color={color} size="small" />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
