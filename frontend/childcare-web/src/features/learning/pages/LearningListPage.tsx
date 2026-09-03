import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Avatar,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add, School, Image as ImageIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { StatusBadge } from '@/components/common/StatusBadge';
import { FilterPanel } from '@/components/common/FilterPanel';
import { EmptyState } from '@/components/common/EmptyState';
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

export function LearningListPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const getChildName = (childId: string): string => {
    const child = mockChildren.find((c) => c.id === childId);
    return child ? `${child.firstName} ${child.lastName}` : 'Unknown';
  };

  const getEducatorName = (educatorId: string): string => {
    const user = mockUsers.find((u) => u.id === educatorId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  const filteredStories = useMemo(() => {
    return mockLearningStories.filter((story) => {
      const childName = getChildName(story.childId).toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        childName.includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || story.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: mockLearningStories.length };
    mockLearningStories.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return counts;
  }, []);

  const getGridColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="Learning Stories"
        subtitle={`${filteredStories.length} ${filteredStories.length === 1 ? 'story' : 'stories'}`}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {}}
          >
            New Story
          </Button>
        }
      />

      <FilterPanel>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ width: '100%' }}
        >
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title or child name..."
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All ({statusCounts.ALL})</MenuItem>
              <MenuItem value="DRAFT">Draft ({statusCounts.DRAFT || 0})</MenuItem>
              <MenuItem value="PUBLISHED">Published ({statusCounts.PUBLISHED || 0})</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </FilterPanel>

      {filteredStories.length === 0 ? (
        <EmptyState
          icon={<School />}
          title="No learning stories found"
          description="Try adjusting your search or filter criteria, or create a new learning story."
          actionLabel="New Story"
          onAction={() => {}}
        />
      ) : (
        <Grid container spacing={3}>
          {filteredStories.map((story) => {
            const child = mockChildren.find((c) => c.id === story.childId);
            const childName = getChildName(story.childId);
            const educatorName = getEducatorName(story.educatorId);
            const placeholderColor = generateColor(story.id);

            return (
              <Grid key={story.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'grey.50',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                      bgcolor: 'background.paper',
                    },
                  }}
                >
                  <CardActionArea
                    sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    onClick={() => navigate(`/learning/${story.id}`)}
                  >
                    <Box
                      sx={{
                        height: 140,
                        bgcolor: placeholderColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.6)' }} />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                        }}
                      >
                        <StatusBadge
                          label={story.status}
                          color={STATUS_COLORS[story.status] || '#94A3B8'}
                        />
                      </Box>
                    </Box>

                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600 }}
                        sx={{
                          mb: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {story.title}
                      </Typography>

                      <Stack spacing={0.75} sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'primary.main' }}
                          >
                            {child ? getInitials(child.firstName, child.lastName) : '?'}
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {childName}
                          </Typography>
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                          by {educatorName}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {formatDate(story.createdAt)}
                        </Typography>
                      </Stack>

                      {story.photoUrls && story.photoUrls.length > 0 && (
                        <Box sx={{ mt: 1.5 }}>
                          <Chip
                            size="small"
                            label={`${story.photoUrls.length} photo${story.photoUrls.length > 1 ? 's' : ''}`}
                            sx={{
                              bgcolor: 'action.hover',
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      )}

                      {story.tags && story.tags.length > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{ mt: 1.5 }} flexWrap="wrap" gap={0.5}>
                          {story.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{
                                bgcolor: `${getTagColor(tag)}18`,
                                color: getTagColor(tag),
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                height: 22,
                              }}
                            />
                          ))}
                          {story.tags.length > 3 && (
                            <Chip
                              label={`+${story.tags.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 22 }}
                            />
                          )}
                        </Stack>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {filteredStories.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredStories.length} of {mockLearningStories.length} stories
          </Typography>
        </Box>
      )}
    </Box>
  );
}
