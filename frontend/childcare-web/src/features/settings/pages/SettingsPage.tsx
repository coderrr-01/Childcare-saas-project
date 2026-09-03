import { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Badge,
} from '@mui/material';
import {
  Save,
  Edit,
  PhotoCamera,
  Add,
  Delete,
  Person,
  Business,
  Group,
  Security,
  Notifications,
  Palette,
  Settings as SettingsIcon,
  Check,
  Close,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { showSnackbar } from '@/features/auth/uiSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import type { UserProfile, Centre as CentreType, Organisation, User, Role } from '@/types';

interface NotificationSettings {
  emailDailySummary: boolean;
  emailIncidentAlerts: boolean;
  emailEnrolmentUpdates: boolean;
  emailBillingReminders: boolean;
  emailNewsletter: boolean;
  appPushNotifications: boolean;
  appMessages: boolean;
  appReminders: boolean;
  smsEmergencyAlerts: boolean;
  smsPaymentReminders: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const mockUserProfile: UserProfile = {
  id: '1',
  name: 'Sarah Mitchell',
  email: 'sarah.mitchell@littleexplorers.edu.au',
  phone: '+61 412 345 678',
  avatar: '',
  role: 'Centre Director',
};

const mockCentreDetails: CentreType = {
  id: '1',
  name: 'Little Explorers Childcare Centre',
  address: '123 Learning Lane, Sydney, NSW 2000',
  phone: '+61 2 9876 5432',
  email: 'info@littleexplorers.edu.au',
  capacity: 60,
  licenceNumber: 'ECE-2024-12345',
};

const mockOrganisationDetails: Organisation = {
  id: '1',
  name: 'Little Explorers Early Learning Group',
  abn: '12 345 678 901',
  address: '456 Education Street, Sydney, NSW 2000',
  phone: '+61 2 1234 5678',
  email: 'admin@littleexplorers.com.au',
  website: 'https://littleexplorers.edu.au',
  centres: 3,
  totalStaff: 45,
};

const mockUsers: User[] = [
  { id: '1', name: 'Sarah Mitchell', email: 'sarah@littleexplorers.edu.au', role: 'Director', status: 'active', lastActive: '2026-09-03T10:30:00' },
  { id: '2', name: 'Emma Thompson', email: 'emma@littleexplorers.edu.au', role: 'Educator', status: 'active', lastActive: '2026-09-03T09:15:00' },
  { id: '3', name: 'David Chen', email: 'david@littleexplorers.edu.au', role: 'Educator', status: 'active', lastActive: '2026-09-02T16:45:00' },
  { id: '4', name: 'Sarah Kim', email: 'sarah.kim@littleexplorers.edu.au', role: 'Educator', status: 'active', lastActive: '2026-09-03T08:00:00' },
  { id: '5', name: 'Michael Brown', email: 'michael@littleexplorers.edu.au', role: 'Cook', status: 'active', lastActive: '2026-09-03T07:30:00' },
  { id: '6', name: 'Lisa Wilson', email: 'lisa@littleexplorers.edu.au', role: 'Admin', status: 'inactive', lastActive: '2026-08-28T14:20:00' },
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Director',
    description: 'Full administrative access to all centre operations and settings.',
    userCount: 1,
    permissions: [
      'Manage centre settings',
      'Manage users and roles',
      'View all reports',
      'Manage billing',
      'Manage enrolments',
      'View and manage incidents',
      'Send communications',
      'Manage waitlist',
    ],
  },
  {
    id: '2',
    name: 'Educator',
    description: 'Access to daily operations, child records, and learning documentation.',
    userCount: 3,
    permissions: [
      'View child profiles',
      'Record daily care activities',
      'Document learning observations',
      'Log incidents',
      'View attendance',
      'Send parent communications',
      'View room schedules',
    ],
  },
  {
    id: '3',
    name: 'Cook',
    description: 'Access to meal planning and dietary requirements.',
    userCount: 1,
    permissions: [
      'View child dietary requirements',
      'Manage meal plans',
      'Record meal participation',
      'View allergies and restrictions',
    ],
  },
  {
    id: '4',
    name: 'Admin',
    description: 'Administrative access for billing, enrolments, and communications.',
    userCount: 1,
    permissions: [
      'Manage billing and invoicing',
      'Manage enrolments',
      'Manage waitlist',
      'View reports',
      'Send communications',
      'Manage parent contacts',
    ],
  },
];

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [profileForm, setProfileForm] = useState({
    name: mockUserProfile.name,
    email: mockUserProfile.email,
    phone: mockUserProfile.phone,
  });
  const [centreForm, setCentreForm] = useState({
    name: mockCentreDetails.name,
    address: mockCentreDetails.address,
    phone: mockCentreDetails.phone,
    email: mockCentreDetails.email,
    capacity: String(mockCentreDetails.capacity),
    licenceNumber: mockCentreDetails.licenceNumber,
  });
  const [organisationForm, setOrganisationForm] = useState({
    name: mockOrganisationDetails.name,
    abn: mockOrganisationDetails.abn,
    address: mockOrganisationDetails.address,
    phone: mockOrganisationDetails.phone,
    email: mockOrganisationDetails.email,
    website: mockOrganisationDetails.website,
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailDailySummary: true,
    emailIncidentAlerts: true,
    emailEnrolmentUpdates: true,
    emailBillingReminders: true,
    emailNewsletter: false,
    appPushNotifications: true,
    appMessages: true,
    appReminders: true,
    smsEmergencyAlerts: true,
    smsPaymentReminders: false,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSaveProfile = () => {
    dispatch(showSnackbar({ message: 'Profile updated successfully', severity: 'success' }));
  };

  const handleSaveCentre = () => {
    dispatch(showSnackbar({ message: 'Centre details updated successfully', severity: 'success' }));
  };

  const handleSaveOrganisation = () => {
    dispatch(showSnackbar({ message: 'Organisation details updated successfully', severity: 'success' }));
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = () => {
    dispatch(showSnackbar({ message: 'Notification preferences saved', severity: 'success' }));
  };

  const tabs = [
    { label: 'Profile', icon: <Person /> },
    { label: 'Centre', icon: <Business /> },
    { label: 'Organisation', icon: <SettingsIcon /> },
    { label: 'Users', icon: <Group /> },
    { label: 'Roles', icon: <Security /> },
    { label: 'Notifications', icon: <Notifications /> },
    { label: 'Appearance', icon: <Palette /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, centre configuration, and system preferences"
      />

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          {tabs.map((tab, index) => (
            <Tab key={tab.label} icon={tab.icon} label={tab.label} id={`settings-tab-${index}`} />
          ))}
        </Tabs>

        <Box sx={{ px: 3 }}>
          {/* Profile Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                          }}
                        >
                          <PhotoCamera fontSize="small" />
                        </IconButton>
                      }
                    >
                      <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, fontSize: 48 }}>
                        {profileForm.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </Avatar>
                    </Badge>
                    <Typography variant="h6">{profileForm.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mockUserProfile.role}
                    </Typography>
                    <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                      Change Password
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Role"
                          value={mockUserProfile.role}
                          disabled
                          size="small"
                          helperText="Contact an administrator to change your role"
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="contained" startIcon={<Save />} onClick={handleSaveProfile}>
                        Save Changes
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Centre Tab */}
          <TabPanel value={activeTab} index={1}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Centre Details
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Changes to centre details will be reflected across the system and may affect reporting.
                </Alert>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Centre Name"
                      value={centreForm.name}
                      onChange={(e) => setCentreForm({ ...centreForm, name: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Licence Number"
                      value={centreForm.licenceNumber}
                      onChange={(e) => setCentreForm({ ...centreForm, licenceNumber: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={centreForm.address}
                      onChange={(e) => setCentreForm({ ...centreForm, address: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={centreForm.phone}
                      onChange={(e) => setCentreForm({ ...centreForm, phone: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={centreForm.email}
                      onChange={(e) => setCentreForm({ ...centreForm, email: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Maximum Capacity"
                      type="number"
                      value={centreForm.capacity}
                      onChange={(e) => setCentreForm({ ...centreForm, capacity: e.target.value })}
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" startIcon={<Save />} onClick={handleSaveCentre}>
                    Save Centre Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Organisation Tab */}
          <TabPanel value={activeTab} index={2}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Organisation Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Organisation Name"
                      value={organisationForm.name}
                      onChange={(e) => setOrganisationForm({ ...organisationForm, name: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="ABN"
                      value={organisationForm.abn}
                      onChange={(e) => setOrganisationForm({ ...organisationForm, abn: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={organisationForm.address}
                      onChange={(e) => setOrganisationForm({ ...organisationForm, address: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={organisationForm.phone}
                      onChange={(e) => setOrganisationForm({ ...organisationForm, phone: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={organisationForm.email}
                      onChange={(e) => setOrganisationForm({ ...organisationForm, email: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={organisationForm.website}
                      onChange={(e) => setOrganisationForm({ ...organisationForm, website: e.target.value })}
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" startIcon={<Save />} onClick={handleSaveOrganisation}>
                    Save Organisation Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Users Tab */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">User Management</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => setAddUserOpen(true)}>
                Add User
              </Button>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Last Active</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={
                            user.role === 'Director'
                              ? 'primary'
                              : user.role === 'Educator'
                                ? 'success'
                                : user.role === 'Cook'
                                  ? 'warning'
                                  : 'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={user.status}
                          color={user.status === 'active' ? '#22C55E' : '#94A3B8'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Roles Tab */}
          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Role Management
            </Typography>
            <Grid container spacing={2}>
              {mockRoles.map((role) => (
                <Grid size={{ xs: 12, md: 6 }} key={role.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="h6">{role.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {role.description}
                          </Typography>
                        </Box>
                        <Chip label={`${role.userCount} user${role.userCount !== 1 ? 's' : ''}`} size="small" />
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Permissions
                      </Typography>
                      <List dense disablePadding>
                        {role.permissions.map((permission, index) => (
                          <ListItem key={index} disableGutters sx={{ py: 0.25 }}>
                            <Check sx={{ fontSize: 16, color: 'success.main', mr: 1 }} />
                            <ListItemText
                              primary={permission}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={activeTab} index={5}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Notification Preferences
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} sx={{ mb: 1, mt: 2 }}>
                  Email Notifications
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Stack spacing={0}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailDailySummary}
                        onChange={() => handleNotificationChange('emailDailySummary')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Daily Summary</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receive a daily summary of centre activities
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailIncidentAlerts}
                        onChange={() => handleNotificationChange('emailIncidentAlerts')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Incident Alerts</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Get notified when an incident is logged
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailEnrolmentUpdates}
                        onChange={() => handleNotificationChange('emailEnrolmentUpdates')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Enrolment Updates</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Notifications for new enrolments and changes
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailBillingReminders}
                        onChange={() => handleNotificationChange('emailBillingReminders')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Billing Reminders</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Reminders for overdue invoices and payments
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailNewsletter}
                        onChange={() => handleNotificationChange('emailNewsletter')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Newsletter</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Monthly newsletter with updates and tips
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>

                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} sx={{ mb: 1, mt: 3 }}>
                  App Notifications
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Stack spacing={0}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.appPushNotifications}
                        onChange={() => handleNotificationChange('appPushNotifications')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Push Notifications</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receive push notifications on your devices
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.appMessages}
                        onChange={() => handleNotificationChange('appMessages')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">In-App Messages</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Show message notifications within the app
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.appReminders}
                        onChange={() => handleNotificationChange('appReminders')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Reminders</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Task and activity reminders
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>

                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} sx={{ mb: 1, mt: 3 }}>
                  SMS Notifications
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Stack spacing={0}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.smsEmergencyAlerts}
                        onChange={() => handleNotificationChange('smsEmergencyAlerts')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Emergency Alerts</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Critical emergency notifications via SMS
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.smsPaymentReminders}
                        onChange={() => handleNotificationChange('smsPaymentReminders')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Payment Reminders</Typography>
                        <Typography variant="caption" color="text.secondary">
                          SMS reminders for outstanding payments
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" startIcon={<Save />} onClick={handleSaveNotifications}>
                    Save Preferences
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Appearance Tab */}
          <TabPanel value={activeTab} index={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Appearance Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }} sx={{ mb: 2 }}>
                      Theme
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: darkMode ? 2 : 1,
                        borderColor: darkMode ? 'primary.main' : 'divider',
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {darkMode ? 'Dark Mode' : 'Light Mode'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {darkMode
                            ? 'Easier on the eyes in low-light environments'
                            : 'Default light theme for everyday use'}
                        </Typography>
                      </Box>
                      <Switch
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                        color="primary"
                      />
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }} sx={{ mb: 2 }}>
                      Display Options
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Date Format</InputLabel>
                        <Select defaultValue="dd/mm/yyyy" label="Date Format">
                          <MenuItem value="dd/mm/yyyy">DD/MM/YYYY</MenuItem>
                          <MenuItem value="mm/dd/yyyy">MM/DD/YYYY</MenuItem>
                          <MenuItem value="yyyy-mm-dd">YYYY-MM-DD</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth size="small">
                        <InputLabel>Time Format</InputLabel>
                        <Select defaultValue="12h" label="Time Format">
                          <MenuItem value="12h">12 Hour (AM/PM)</MenuItem>
                          <MenuItem value="24h">24 Hour</MenuItem>
                        </Select>
                      </FormControl>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="info">
                      Theme changes will be applied immediately and saved to your profile preferences.
                    </Alert>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => {
                      dispatch(
                        showSnackbar({
                          message: 'Appearance settings saved',
                          severity: 'success',
                        })
                      );
                    }}
                  >
                    Save Appearance Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>
        </Box>
      </Paper>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onClose={() => setAddUserOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="First Name" size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Last Name" size="small" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Email Address" type="email" size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select label="Role">
                  {mockRoles.map((role) => (
                    <MenuItem key={role.id} value={role.name}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Phone" size="small" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setAddUserOpen(false);
              dispatch(showSnackbar({ message: 'User invitation sent', severity: 'success' }));
            }}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
