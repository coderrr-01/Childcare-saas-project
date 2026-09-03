import { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  Grid,
  Avatar,
  Stack,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack,
  Image as ImageIcon,
  Person,
  CalendarToday,
  Edit,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { mockLearningStories } from '@/mock/learning';
import { mockChildren } from '@/mock/children';
import { mockUsers } from '@/mock/users';
import { formatDate, generateColor, getInitials } from '@/utils/formatters';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#94A3B8',
  PUBLISHED: '#22C55E',
};

const TAG_COLORS = [
  '#5B8C5A', '#4A9EAD', '#D4956A', '#A8A0C8', '#87CEEB',
  '#E8B89D', '#7BA87A', '#6DB5C2', '#2E7A87', '#3D6B3C',
];

function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

const SECTION_COLORS = {
  observation: '#4A9EAD',
  learningOutcome: '#5B8C5A',
  reflection: '#A8A0C8',
  nextSteps: '#D4956A',
};

export function LearningDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const story = useMemo(() => {
    return mockLearningStories.find((s) => s.id === id);
  }, [id]);

  const child = useMemo(() => {
    if (!story) return null;
    return mockChildren.find((c) => c.id === story.childId);
  }, [story]);

  const educator = useMemo(() => {
    if (!story) return null;
    return mockUsers.find((u) => u.id === story.educatorId);
  }, [story]);

  if (!story) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Learning Story Not Found" />
        <Alert severity="error" sx={{ mb: 2 }}>
          The learning story you are looking for does not exist or has been removed.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/learning')}
        >
          Back to Learning Stories
        </Button>
      </Box>
    );
  }

  const placeholderColor = generateColor(story.id);

  const storySections = [
    {
      title: 'Observation',
      content: story.observations,
      color: SECTION_COLORS.observation,
    },
    {
      title: 'Learning Outcomes',
      content: Array.isArray(story.learningOutcomes)
        ? story.learningOutcomes.join('\n')
        : story.learningOutcomes,
      color: SECTION_COLORS.learningOutcome,
    },
    {
      title: 'Story',
      content: story.story,
      color: '#6B7280',
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component={RouterLink}
          to="/learning"
          color="inherit"
          sx={{ textDecoration: 'none' }}
        >
          Learning Stories
        </Link>
        <Typography color="text.primary">{story.title}</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3 }}>
        <PageHeader
          title={story.title}
          backTo="/learning"
          actions={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                variant={story.status === 'PUBLISHED' ? 'outlined' : 'contained'}
                color={story.status === 'PUBLISHED' ? 'warning' : 'success'}
                startIcon={story.status === 'PUBLISHED' ? <VisibilityOff /> : <Visibility />}
              >
                {story.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
              </Button>
              <Button variant="outlined" startIcon={<Edit />}>
                Edit
              </Button>
            </Stack>
          }
        />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: child ? 'primary.main' : 'grey.400',
                  fontSize: 18,
                }}
              >
                {child ? getInitials(child.firstName, child.lastName) : '?'}
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {child ? `${child.firstName} ${child.lastName}` : 'Unknown Child'}
                  </Typography>
                  <StatusBadge
                    label={story.status}
                    color={STATUS_COLORS[story.status] || '#94A3B8'}
                  />
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {educator ? `${educator.firstName} ${educator.lastName}` : 'Unknown Educator'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(story.createdAt)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {storySections.map((section) => (
            <Card key={section.title} sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 4,
                      height: 24,
                      borderRadius: 2,
                      bgcolor: section.color,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {section.title}
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.8,
                    color: 'text.primary',
                  }}
                >
                  {section.content}
                </Typography>
              </CardContent>
            </Card>
          ))}

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 4,
                    height: 24,
                    borderRadius: 2,
                    bgcolor: '#3B82F6',
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Photos
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {story.photoUrls && story.photoUrls.length > 0 ? (
                <Grid container spacing={2}>
                  {story.photoUrls.map((photo, index) => (
                    <Grid key={index} size={{ xs: 6, sm: 4 }}>
                      <Box
                        sx={{
                          aspectRatio: '4/3',
                          borderRadius: 2,
                          bgcolor: generateColor(photo),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        <ImageIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.6)' }} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box
                  sx={{
                    py: 6,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                  }}
                >
                  <ImageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No photos attached to this story
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Tags
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {story.tags && story.tags.length > 0 ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {story.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: `${getTagColor(tag)}18`,
                        color: getTagColor(tag),
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No tags assigned
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Story ID
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {story.id}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(story.createdAt)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(story.updatedAt)}
                  </Typography>
                </Stack>
                {story.publishedAt && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Published
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(story.publishedAt)}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
