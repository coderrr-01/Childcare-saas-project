import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowBack,
  Phone,
  Email,
  LocationOn,
  ChildCare,
  People,
  EmergencyShare,
  DirectionsRun,
  Description,
  Chat,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { mockFamilies } from '@/mock/families';
import { mockChildren } from '@/mock/children';
import type { Family, Child, EmergencyContact, Contact, Message } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;
  return <Box mt={3}>{children}</Box>;
}

const mockMessages: Message[] = [
  {
    id: '1',
    date: '2026-09-01T10:30:00Z',
    sender: 'Staff',
    subject: 'Welcome back!',
    preview: 'We are excited to have the children back for the new term.',
  },
  {
    id: '2',
    date: '2026-08-28T14:15:00Z',
    sender: 'Parent',
    subject: 'Absence notification',
    preview: 'Jamie will be absent on Monday due to a dental appointment.',
  },
  {
    id: '3',
    date: '2026-08-25T09:00:00Z',
    sender: 'Staff',
    subject: 'Reminder: Parent-Teacher Evening',
    preview: 'This is a reminder about the upcoming parent-teacher evening on Thursday.',
  },
];

const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: 'ec1',
    name: 'Sarah Johnson',
    relationship: 'Grandmother',
    phone: '07700 900111',
    isPrimary: true,
  },
  {
    id: 'ec2',
    name: 'Tom Wilson',
    relationship: 'Uncle',
    phone: '07700 900222',
    isPrimary: false,
  },
];

const mockPickupAuthorised: Contact[] = [
  { id: 'pu1', name: 'Sarah Johnson', relationship: 'Grandmother', phone: '07700 900111' },
  { id: 'pu2', name: 'Tom Wilson', relationship: 'Uncle', phone: '07700 900222' },
  { id: 'pu3', name: 'Lisa Chen', relationship: 'Family Friend', phone: '07700 900333' },
];

export default function FamilyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const family = useMemo(() => mockFamilies.find((f) => f.id === id), [id]);

  const linkedChildren = useMemo(
    () => (id ? mockChildren.filter((c) => c.familyIds.includes(id)) : []),
    [id]
  );

  if (!family) {
    return (
      <Box>
        <PageHeader title="Family Not Found">
          <IconButton onClick={() => navigate('/families')}>
            <ArrowBack />
          </IconButton>
        </PageHeader>
        <EmptyState
          title="Family not found"
          description="The family you are looking for does not exist."
        />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => navigate('/families')}>
          <ArrowBack />
        </IconButton>
        <Breadcrumbs>
          <Link
            component="button"
            variant="body1"
            underline="hover"
            onClick={() => navigate('/families')}
          >
            Families
          </Link>
           <Typography color="text.primary">{family.primaryContact.firstName} {family.primaryContact.lastName}</Typography>
        </Breadcrumbs>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
          >
            {family.primaryContact.firstName.charAt(0)}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {family.primaryContact.firstName} {family.primaryContact.lastName}
            </Typography>
            <Box display="flex" gap={2} mt={0.5} flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {`${family.address.street}, ${family.address.suburb}, ${family.address.state} ${family.address.postcode}`}                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                   {family.primaryContact.phone}
                </Typography>
              </Box>
                   {family.primaryContact.email && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {family.primaryContact.email}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Overview" />
        <Tab label="Parents/Guardians" />
        <Tab label={`Children (${linkedChildren.length})`} />
        <Tab label="Emergency Contacts" />
        <Tab label="Pickup Authorised" />
        <Tab label="Documents" />
        <Tab label="Communication" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                  Family Summary
                </Typography>
                <List disablePadding>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Primary Contact"
                      secondary={`${family.primaryContact.firstName} ${family.primaryContact.lastName}`}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Phone"
                       secondary={family.primaryContact.phone}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Address"
                      secondary={`${family.address.street}, ${family.address.suburb}, ${family.address.state} ${family.address.postcode}`}
                    />
                  </ListItem>
                       {family.primaryContact.email && (
                    <ListItem disablePadding>
                      <ListItemText
                        primary="Email"
                           secondary={family.primaryContact.email}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                  Linked Children
                </Typography>
                {linkedChildren.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No children linked to this family.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {linkedChildren.map((child: Child) => (
                      <ListItem
                        key={child.id}
                        disablePadding
                        sx={{ py: 1 }}
                        secondaryAction={
                          <Chip
                             label={child.enrolmentStatus}
                             size="small"
                             color={child.enrolmentStatus === 'ENROLLED' ? 'success' : 'default'}
                            variant="outlined"
                          />
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            {child.firstName.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${child.firstName} ${child.lastName}`}
                           secondary={child.roomId}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                  Contacts
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <People color="primary" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Primary Contact
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {family.primaryContact.firstName} {family.primaryContact.lastName} ({family.primaryContact.relationship})
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  {family.secondaryContact && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <People color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Secondary Contact
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {family.secondaryContact.firstName} {family.secondaryContact.lastName} ({family.secondaryContact.relationship})
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                  Primary Contact
                </Typography>
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary="Name"
                      secondary={`${family.primaryContact.firstName} ${family.primaryContact.lastName}`}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary="Relationship"
                      secondary={family.primaryContact.relationship}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary="Phone"
                       secondary={family.primaryContact.phone}
                    />
                  </ListItem>
                       {family.primaryContact.email && (
                    <>
                      <Divider />
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemText
                          primary="Email"
                             secondary={family.primaryContact.email}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {family.secondaryContact && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                    Secondary Contact
                  </Typography>
                  <List disablePadding>
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemText
                        primary="Name"
                        secondary={`${family.secondaryContact.firstName} ${family.secondaryContact.lastName}`}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemText
                        primary="Relationship"
                        secondary={family.secondaryContact.relationship}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemText
                        primary="Phone"
                        secondary={family.secondaryContact.phone}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {linkedChildren.length === 0 ? (
          <EmptyState
            title="No children linked"
            description="This family does not have any children registered."
          />
        ) : (
          <Grid container spacing={3}>
            {linkedChildren.map((child: Child) => (
              <Grid item xs={12} sm={6} md={4} key={child.id}>
                <Card
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                  onClick={() => navigate(`/children/${child.id}`)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <ChildCare />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {child.firstName} {child.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                           Room: {child.roomId}
                        </Typography>
                        <Chip
                           label={child.enrolmentStatus}
                           size="small"
                           color={child.enrolmentStatus === 'ENROLLED' ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
              Emergency Contacts
            </Typography>
            <List>
              {mockEmergencyContacts.map((contact: EmergencyContact, index: number) => (
                <Box key={`ec-${index}`}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        <EmergencyShare />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={contact.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {contact.relationship}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.secondary">
                            {contact.phone}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
              Authorised for Pickup
            </Typography>
            <List>
              {mockPickupAuthorised.map((contact: Contact, index: number) => (
                <Box key={contact.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <DirectionsRun />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={contact.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {contact.relationship}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.secondary">
                            {contact.phone}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
        <EmptyState
          title="Documents"
          description="No documents uploaded for this family yet."
          icon={<Description sx={{ fontSize: 48 }} />}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
              Communication History
            </Typography>
            <List>
              {mockMessages.map((message: Message, index: number) => (
                <Box key={message.id}>
                  {index > 0 && <Divider />}
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: message.senderName === 'Staff' ? 'primary.main' : 'grey.500' }}>
                        <Chat />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {message.subject}
                          </Typography>
                          <Chip
                             label={message.senderName}
                             size="small"
                             color={message.senderName === 'Staff' ? 'primary' : 'default'}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                             {new Date(message.timestamp).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                             {message.content}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}
