import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Button,
  Divider,
  Chip,
  Avatar,
} from '@mui/material';
import {
  CheckCircle,
  EventAvailable,
  Medication,
  ReportProblem,
  ChatBubbleOutlined,
  Gavel,
  Assignment,
  Settings,
  DoneAll,
  FilterList,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { mockNotifications } from '@/mock/notifications';
import type { Notification, NotificationType } from '@/types';
import { formatRelativeTime } from '@/utils/formatters';

const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; label: string }
> = {
  ATTENDANCE: {
    icon: <EventAvailable fontSize="small" />,
    color: '#2196f3',
    label: 'Attendance',
  },
  MEDICATION: {
    icon: <Medication fontSize="small" />,
    color: '#9c27b0',
    label: 'Medication',
  },
  INCIDENT: {
    icon: <ReportProblem fontSize="small" />,
    color: '#f44336',
    label: 'Incident',
  },
  MESSAGE: {
    icon: <ChatBubbleOutlined fontSize="small" />,
    color: '#4caf50',
    label: 'Message',
  },
  CONSENT: {
    icon: <CheckCircle fontSize="small" />,
    color: '#00bcd4',
    label: 'Consent',
  },
  ENROLMENT: {
    icon: <Assignment fontSize="small" />,
    color: '#ff9800',
    label: 'Enrolment',
  },
  SYSTEM: {
    icon: <Settings fontSize="small" />,
    color: '#607d8b',
    label: 'System',
  },
  LEARNING: {
    icon: <Assignment fontSize="small" />,
    color: '#00897b',
    label: 'Learning',
  },
  BILLING: {
    icon: <Assignment fontSize="small" />,
    color: '#5c6bc0',
    label: 'Billing',
  },
  DOCUMENT: {
    icon: <Assignment fontSize="small" />,
    color: '#8d6e63',
    label: 'Document',
  },
  HEALTH: {
    icon: <Assignment fontSize="small" />,
    color: '#e91e63',
    label: 'Health',
  },
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#f44336',
  HIGH: '#ff9800',
  MEDIUM: '#ffc107',
  LOW: '#4caf50',
};

const TABS = ['All', 'Unread', 'By Type'];

function groupByDate(notifications: Notification[]): Record<string, Notification[]> {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Earlier: [],
  };

  notifications.forEach((n) => {
    const d = new Date(n.createdAt);
    const dateStr = d.toDateString();

    if (dateStr === today) {
      groups['Today'].push(n);
    } else if (dateStr === yesterday.toDateString()) {
      groups['Yesterday'].push(n);
    } else if (d > weekAgo) {
      groups['This Week'].push(n);
    } else {
      groups['Earlier'].push(n);
    }
  });

  return groups;
}

function NotificationsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [readIds, setReadIds] = useState<Set<string>>(
    new Set(mockNotifications.filter((n) => !n.read).map((n) => n.id))
  );

  const unreadCount = mockNotifications.filter(
    (n) => !readIds.has(n.id)
  ).length;

  const filteredNotifications = useMemo(() => {
    let result = [...mockNotifications];

    if (activeTab === 1) {
      result = result.filter((n) => !readIds.has(n.id));
    }

    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeTab, readIds]);

  const groupedNotifications = useMemo(
    () => groupByDate(filteredNotifications),
    [filteredNotifications]
  );

  const handleMarkAsRead = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  const handleMarkAllAsRead = () => {
    setReadIds(new Set(mockNotifications.map((n) => n.id)));
  };

  const renderNotification = (notification: Notification) => {
    const config = TYPE_CONFIG[notification.type] || { icon: <Settings fontSize="small" />, color: '#757575', label: notification.type };
    const isUnread = !readIds.has(notification.id);
    const priorityColor = notification.priority ? PRIORITY_COLORS[notification.priority] : null;

    return (
      <ListItem
        key={notification.id}
        sx={{
          py: 1.5,
          bgcolor: isUnread ? 'action.hover' : 'transparent',
          borderLeft: priorityColor
            ? `3px solid ${priorityColor}`
            : '3px solid transparent',
          transition: 'background-color 0.2s',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: `${config.color}20`,
              color: config.color,
              width: 40,
              height: 40,
            }}
          >
            {config.icon}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography
                variant="body2"
                fontWeight={isUnread ? 700 : 400}
                sx={{ flex: 1 }}
              >
                {notification.title}
              </Typography>
              {isUnread && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                  }}
                />
              )}
              <Chip
                label={config.label}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: `${config.color}15`,
                  color: config.color,
                  fontWeight: 500,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            </Box>
          }
          secondary={
            <Box sx={{ mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {notification.message}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatRelativeTime(notification.createdAt)}
                </Typography>
                {notification.childId && (
                  <Typography variant="caption" color="text.secondary">
                    &middot;
                  </Typography>
                )}
              </Box>
            </Box>
          }
        />
        {isUnread && (
          <IconButton
            size="small"
            onClick={() => handleMarkAsRead(notification.id)}
            title="Mark as read"
            sx={{ alignSelf: 'flex-start', mt: 0.5 }}
          >
            <CheckCircle fontSize="small" color="action" />
          </IconButton>
        )}
      </ListItem>
    );
  };

  const renderEmpty = () => (
    <Box sx={{ py: 8 }}>
      <EmptyState
        title="No notifications"
        description={
          activeTab === 1
            ? "You're all caught up!"
            : "No notifications to display"
        }
        icon="notifications"
      />
    </Box>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={
          unreadCount > 0 ? (
            <Button
              startIcon={<DoneAll />}
              onClick={handleMarkAllAsRead}
              variant="outlined"
              size="small"
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ minHeight: 44 }}
        >
          {TABS.map((label, i) => (
            <Tab
              key={label}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {label}
                  {i === 1 && unreadCount > 0 && (
                    <Badge
                      badgeContent={unreadCount}
                      color="primary"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: 10,
                          height: 16,
                          minWidth: 16,
                        },
                      }}
                    />
                  )}
                </Box>
              }
              sx={{ minHeight: 44, textTransform: 'none', fontWeight: 500 }}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredNotifications.length === 0 ? (
          renderEmpty()
        ) : (
          <List disablePadding>
            {Object.entries(groupedNotifications).map(([dateGroup, notifications]) =>
              notifications.length > 0 ? (
                <Box key={dateGroup}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      bgcolor: 'grey.50',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600 }}
                      color="text.secondary"
                      textTransform="uppercase"
                      letterSpacing={0.5}
                    >
                      {dateGroup}
                    </Typography>
                  </Box>
                  {notifications.map(renderNotification)}
                  <Divider />
                </Box>
              ) : null
            )}
          </List>
        )}
      </Box>
    </Box>
  );
}

export default NotificationsPage;
