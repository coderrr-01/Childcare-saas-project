import { useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ChildCare,
  EventAvailable,
  Cancel,
  Warning,
  Medication,
  ReportProblem,
  Message,
  Gavel,
  Schedule,
  PersonAdd,
  HowToReg,
  CheckBox,
  Login,
  Pets,
  Science,
  MenuBook,
} from '@mui/icons-material';
import { StatsCard } from '@/components/common/StatsCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAppSelector } from '@/hooks/useAppSelector';
import { mockChildren } from '@/mock/children';
import { mockAttendance } from '@/mock/attendance';
import { mockIncidents } from '@/mock/incidents';
import { mockMedications } from '@/mock/medication';
import { mockConversations } from '@/mock/messages';
import { mockConsents } from '@/mock/consent';
import { mockRooms } from '@/mock/rooms';
import { formatTime, formatRelativeTime } from '@/utils/formatters';

const TODAY = '2026-09-03';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning, James';
  if (hour < 17) return 'Good afternoon, James';
  return 'Good evening, James';
}

function getGreetingSubtext(): string {
  const date = new Date();
  return date.toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const activityIcons: Record<string, React.ReactNode> = {
  checkin: <Login sx={{ fontSize: 18 }} />,
  medication: <Medication sx={{ fontSize: 18 }} />,
  incident: <ReportProblem sx={{ fontSize: 18 }} />,
  message: <Message sx={{ fontSize: 18 }} />,
  consent: <Gavel sx={{ fontSize: 18 }} />,
  enrolment: <HowToReg sx={{ fontSize: 18 }} />,
};

const activityColors: Record<string, string> = {
  checkin: '#5B8C5A',
  medication: '#D4956A',
  incident: '#E53935',
  message: '#4A9EAD',
  consent: '#A8A0C8',
  enrolment: '#5B8C5A',
};

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
  childName?: string;
}

export default function DashboardPage() {
  const theme = useTheme();

  const enrolledChildren = useMemo(
    () => mockChildren.filter((c) => c.enrolmentStatus === 'ENROLLED'),
    [],
  );

  const todayAttendance = useMemo(
    () => mockAttendance.filter((a) => a.date === TODAY),
    [],
  );

  const presentCount = todayAttendance.filter(
    (a) => a.status === 'PRESENT',
  ).length;
  const lateCount = todayAttendance.filter((a) => a.status === 'LATE').length;
  const absentCount = todayAttendance.filter(
    (a) => a.status === 'ABSENT',
  ).length;
  const totalExpected = enrolledChildren.length;
  const checkedInTotal = presentCount + lateCount;

  const pendingIncidents = mockIncidents.filter(
    (i) => i.status === 'REPORTED' || i.status === 'FOLLOW_UP',
  ).length;

  const medicationDue = mockMedications.filter(
    (m) =>
      m.status === 'ACTIVE' &&
      m.nextDue &&
      m.nextDue.startsWith(TODAY),
  ).length;

  const unreadMessages = mockConversations.reduce(
    (sum, c) => sum + c.unreadCount,
    0,
  );

  const pendingConsents = mockConsents.filter(
    (c) => c.status === 'PENDING',
  ).length;

  const totalAlerts = pendingIncidents + medicationDue + unreadMessages + pendingConsents;

  const roomOccupancy = useMemo(() => {
    return mockRooms.map((room) => {
      const roomChildren = enrolledChildren.filter(
        (c) => c.roomId === room.id,
      );
      const present = todayAttendance.filter(
        (a) => a.roomId === room.id && (a.status === 'PRESENT' || a.status === 'LATE'),
      ).length;
      return {
        ...room,
        enrolled: roomChildren.length,
        present,
      };
    });
  }, [enrolledChildren, todayAttendance]);

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const activities: ActivityItem[] = [];

    todayAttendance
      .filter((a) => a.status === 'PRESENT' || a.status === 'LATE')
      .forEach((a) => {
        const child = mockChildren.find((c) => c.id === a.childId);
        if (child) {
          activities.push({
            id: a.id,
            type: 'checkin',
            title: `${child.firstName} ${child.lastName} checked in`,
            subtitle: a.status === 'LATE' ? `Late arrival at ${a.checkInTime}` : `On time at ${a.checkInTime}`,
            timestamp: `${TODAY}T${a.checkInTime}`,
            childName: `${child.firstName} ${child.lastName}`,
          });
        }
      });

    mockMedications
      .filter((m) => m.status === 'ACTIVE' && m.lastAdministered?.startsWith(TODAY))
      .forEach((m) => {
        const child = mockChildren.find((c) => c.id === m.childId);
        if (child) {
          activities.push({
            id: m.id,
            type: 'medication',
            title: `${m.name} administered`,
            subtitle: `${child.firstName} ${child.lastName} - ${m.dosage}`,
            timestamp: m.lastAdministered!,
            childName: `${child.firstName} ${child.lastName}`,
          });
        }
      });

    mockIncidents
      .filter((i) => i.reportedAt.startsWith(TODAY))
      .forEach((i) => {
        const child = mockChildren.find((c) => c.id === i.childId);
        activities.push({
          id: i.id,
          type: 'incident',
          title: `Incident reported - ${i.severity}`,
          subtitle: child ? `${child.firstName} ${child.lastName}: ${i.description.substring(0, 60)}...` : i.description.substring(0, 60),
          timestamp: i.reportedAt,
          childName: child ? `${child.firstName} ${child.lastName}` : undefined,
        });
      });

    mockConversations
      .filter((c) => c.lastMessageAt.startsWith(TODAY))
      .forEach((c) => {
        activities.push({
          id: c.id,
          type: 'message',
          title: c.subject,
          subtitle: c.lastMessagePreview,
          timestamp: c.lastMessageAt,
        });
      });

    return activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [todayAttendance]);

  const attendancePercent = totalExpected > 0 ? (checkedInTotal / totalExpected) * 100 : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          {getGreeting()}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {getGreetingSubtext()} &mdash; Here's what's happening at your centre today.
        </Typography>
      </Box>

      {/* KPI Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Children Present"
            value={checkedInTotal}
            subtitle={`${presentCount} on time, ${lateCount} late`}
            icon={<ChildCare />}
            color="#5B8C5A"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Expected Today"
            value={totalExpected}
            subtitle="Total enrolled children"
            icon={<EventAvailable />}
            color="#4A9EAD"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Absent"
            value={absentCount}
            subtitle="Not checked in today"
            icon={<Cancel />}
            color="#E53935"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Alerts"
            value={totalAlerts}
            subtitle="Needs your attention"
            icon={<Warning />}
            color="#F57C00"
          />
        </Grid>
      </Grid>

      {/* Attendance Progress Bar */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Today's Attendance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {checkedInTotal} of {totalExpected} children checked in
            </Typography>
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <LinearProgress
              variant="determinate"
              value={attendancePercent}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: alpha(theme.palette.grey[300], 0.3),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  background: `linear-gradient(90deg, #5B8C5A 0%, #7BA87A 100%)`,
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#5B8C5A' }} />
              <Typography variant="body2" color="text.secondary">
                Present: <strong>{presentCount}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#F57C00' }} />
              <Typography variant="body2" color="text.secondary">
                Late: <strong>{lateCount}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#E53935' }} />
              <Typography variant="body2" color="text.secondary">
                Absent: <strong>{absentCount}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: alpha(theme.palette.grey[400], 0.4) }} />
              <Typography variant="body2" color="text.secondary">
                No record: <strong>{totalExpected - checkedInTotal - absentCount}</strong>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Rooms Section */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Rooms
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {roomOccupancy.map((room) => {
          const occupancyPercent = room.enrolled > 0 ? (room.present / room.enrolled) * 100 : 0;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={room.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {room.name}
                    </Typography>
                    <StatusBadge
                      label={room.present === room.enrolled ? 'Full' : 'Open'}
                      color={room.present >= room.enrolled ? '#F57C00' : '#5B8C5A'}
                    />
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {room.present}
                    <Typography component="span" variant="body1" color="text.secondary" sx={{ mx: 0.5 }}>
                      /
                    </Typography>
                    <Typography component="span" variant="body1" color="text.secondary">
                      {room.enrolled}
                    </Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    of {room.capacity} max capacity
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={occupancyPercent}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.grey[300], 0.3),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor: occupancyPercent >= 90 ? '#F57C00' : '#5B8C5A',
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Needs Attention + Recent Activity */}
      <Grid container spacing={3}>
        {/* Needs Attention */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Needs Attention
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              {
                label: 'Medication Due',
                count: medicationDue,
                icon: <Medication sx={{ fontSize: 20 }} />,
                color: '#D4956A',
                bg: alpha('#D4956A', 0.08),
              },
              {
                label: 'Pending Incidents',
                count: pendingIncidents,
                icon: <ReportProblem sx={{ fontSize: 20 }} />,
                color: '#E53935',
                bg: alpha('#E53935', 0.08),
              },
              {
                label: 'Unread Messages',
                count: unreadMessages,
                icon: <Message sx={{ fontSize: 20 }} />,
                color: '#4A9EAD',
                bg: alpha('#4A9EAD', 0.08),
              },
              {
                label: 'Pending Consents',
                count: pendingConsents,
                icon: <Gavel sx={{ fontSize: 20 }} />,
                color: '#A8A0C8',
                bg: alpha('#A8A0C8', 0.08),
              },
            ].map((item) => (
              <Card
                key={item.label}
                sx={{
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: theme.shadows[2],
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: item.bg,
                        color: item.color,
                      }}
                    >
                      {item.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {item.count}
                      </Typography>
                    </Box>
                    {item.count > 0 && (
                      <StatusBadge
                        label="Action needed"
                        color="#F57C00"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Recent Activity
          </Typography>
          <Card>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              {recentActivity.slice(0, 10).map((activity, index) => (
                <Box
                  key={activity.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    p: 2.5,
                    borderBottom:
                      index < Math.min(recentActivity.length, 10) - 1
                        ? `1px solid ${theme.palette.divider}`
                        : 'none',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.action.hover, 0.04),
                    },
                    transition: 'background-color 0.15s',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: alpha(
                        activityColors[activity.type] || '#5B8C5A',
                        0.12,
                      ),
                      color: activityColors[activity.type] || '#5B8C5A',
                      flexShrink: 0,
                    }}
                  >
                    {activityIcons[activity.type] || <Schedule sx={{ fontSize: 18 }} />}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
                      {activity.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {activity.subtitle}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    {formatRelativeTime(activity.timestamp)}
                  </Typography>
                </Box>
              ))}

              {recentActivity.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent activity today
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
