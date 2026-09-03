import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add,
  Close,
  PhotoLibrary,
  Videocam,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterPanel } from '@/components/common/FilterPanel';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { mockMedia } from '@/mock/media';
import { mockChildren } from '@/mock/children';
import { mockRooms } from '@/mock/rooms';
import { formatDate, formatFileSize, generateColor, getInitials } from '@/utils/formatters';

const PATTERN_COLORS = [
  '#5B8C5A', '#4A9EAD', '#D4956A', '#A8A0C8', '#87CEEB',
  '#E8B89D', '#7BA87A', '#6DB5C2', '#2E7A87', '#3D6B3C',
];

function getPatternColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PATTERN_COLORS[Math.abs(hash) % PATTERN_COLORS.length];
}

export function MediaPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [childFilter, setChildFilter] = useState<string>('ALL');
  const [roomFilter, setRoomFilter] = useState<string>('ALL');
  const [selectedMedia, setSelectedMedia] = useState<(typeof mockMedia)[number] | null>(null);

  const getChildName = (childId: string | null): string => {
    if (!childId) return 'Group';
    const child = mockChildren.find((c) => c.id === childId);
    return child ? `${child.firstName} ${child.lastName}` : 'Unknown';
  };

  const filteredMedia = useMemo(() => {
    return mockMedia.filter((item) => {
      const childName = getChildName(item.childId).toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        childName.includes(searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesChild =
        childFilter === 'ALL' ||
        (childFilter === 'group' ? !item.childId : item.childId === childFilter);

      const matchesRoom =
        roomFilter === 'ALL' || item.roomId === roomFilter;

      return matchesSearch && matchesChild && matchesRoom;
    });
  }, [searchQuery, childFilter, roomFilter]);

  const uniqueChildIds = useMemo(() => {
    const ids = new Set<string>();
    mockMedia.forEach((item) => {
      if (item.childId) ids.add(item.childId);
    });
    return Array.from(ids);
  }, []);

  const uniqueRoomIds = useMemo(() => {
    const ids = new Set<string>();
    mockMedia.forEach((item) => {
      if (item.roomId) ids.add(item.roomId);
    });
    return Array.from(ids);
  }, []);

  const getGridColumns = () => {
    if (isMobile) return 2;
    if (isTablet) return 3;
    return 4;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="Photo & Video Gallery"
        subtitle={`${filteredMedia.length} ${filteredMedia.length === 1 ? 'item' : 'items'}`}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {}}
          >
            Upload
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
            placeholder="Search by title, child, or tag..."
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="child-filter-label">Child</InputLabel>
            <Select
              labelId="child-filter-label"
              value={childFilter}
              label="Child"
              onChange={(e) => setChildFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Children</MenuItem>
              <MenuItem value="group">Group Photos</MenuItem>
              {uniqueChildIds.map((childId) => {
                const child = mockChildren.find((c) => c.id === childId);
                return (
                  <MenuItem key={childId} value={childId}>
                    {child ? `${child.firstName} ${child.lastName}` : childId}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="room-filter-label">Room</InputLabel>
            <Select
              labelId="room-filter-label"
              value={roomFilter}
              label="Room"
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Rooms</MenuItem>
              {uniqueRoomIds.map((roomId) => {
                const room = mockRooms.find((r) => r.id === roomId);
                return (
                  <MenuItem key={roomId} value={roomId}>
                    {room ? room.name : roomId}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Stack>
      </FilterPanel>

      {filteredMedia.length === 0 ? (
        <EmptyState
          icon={<PhotoLibrary />}
          title="No media found"
          description="Try adjusting your search or filter criteria, or upload new photos and videos."
          actionLabel="Upload Media"
          onAction={() => {}}
        />
      ) : (
        <Grid container spacing={2}>
          {filteredMedia.map((item) => {
            const patternColor = getPatternColor(item.id);
            const childName = getChildName(item.childId);
            const isVideo = item.type === 'VIDEO';

            return (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => setSelectedMedia(item)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        aspectRatio: '1',
                        bgcolor: patternColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `
                          repeating-linear-gradient(
                            45deg,
                            ${patternColor},
                            ${patternColor} 10px,
                            ${patternColor}dd 10px,
                            ${patternColor}dd 20px
                          )
                        `,
                      }}
                    >
                      {isVideo ? (
                        <Videocam sx={{ fontSize: 48, color: 'rgba(255,255,255,0.7)' }} />
                      ) : (
                        <PhotoLibrary sx={{ fontSize: 48, color: 'rgba(255,255,255,0.7)' }} />
                      )}
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                      }}
                    >
                      {isVideo && (
                        <Chip
                          label="VIDEO"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.65rem',
                          }}
                        />
                      )}
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                      }}
                    >
                      <Chip
                        label={isVideo ? 'VIDEO' : 'PHOTO'}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500 }}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: 0.5,
                      }}
                    >
                      {item.title || 'Untitled'}
                    </Typography>

                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {childName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        &middot;
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.createdAt)}
                      </Typography>
                    </Stack>

                    {item.tags && item.tags.length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {item.tags.slice(0, 2).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              bgcolor: 'action.hover',
                            }}
                          />
                        ))}
                        {item.tags.length > 2 && (
                          <Chip
                            label={`+${item.tags.length - 2}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                        )}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {filteredMedia.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredMedia.length} of {mockMedia.length} items
          </Typography>
        </Box>
      )}

      <Dialog
        open={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedMedia && (
          <>
            <IconButton
              onClick={() => setSelectedMedia(null)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <Close />
            </IconButton>

            <DialogContent sx={{ p: 0 }}>
              <Box
                sx={{
                  aspectRatio: selectedMedia.width && selectedMedia.height
                    ? `${selectedMedia.width}/${selectedMedia.height}`
                    : '16/9',
                  bgcolor: getPatternColor(selectedMedia.id),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `
                    repeating-linear-gradient(
                      45deg,
                      ${getPatternColor(selectedMedia.id)},
                      ${getPatternColor(selectedMedia.id)} 10px,
                      ${getPatternColor(selectedMedia.id)}dd 10px,
                      ${getPatternColor(selectedMedia.id)}dd 20px
                    )
                  `,
                }}
              >
                {selectedMedia.type === 'VIDEO' ? (
                  <Videocam sx={{ fontSize: 80, color: 'rgba(255,255,255,0.7)' }} />
                ) : (
                  <PhotoLibrary sx={{ fontSize: 80, color: 'rgba(255,255,255,0.7)' }} />
                )}
              </Box>

              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }} sx={{ mb: 1 }}>
                  {selectedMedia.title || 'Untitled'}
                </Typography>

                {selectedMedia.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedMedia.description}
                  </Typography>
                )}

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {getChildName(selectedMedia.childId)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    &middot;
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(selectedMedia.createdAt)}
                  </Typography>
                  {selectedMedia.fileSize && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        &middot;
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(selectedMedia.fileSize)}
                      </Typography>
                    </>
                  )}
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <StatusBadge label={selectedMedia.mimeType} color="#3B82F6" />
                  {selectedMedia.type === 'VIDEO' && selectedMedia.duration && (
                    <Chip
                      label={`${Math.floor(selectedMedia.duration / 60)}:${String(selectedMedia.duration % 60).padStart(2, '0')}`}
                      size="small"
                    />
                  )}
                </Stack>

                {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {selectedMedia.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                )}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
