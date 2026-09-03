import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack,
  TextField,
} from '@mui/material';
import {
  Upload,
  Download,
  Delete,
  Description,
  PictureAsPdf,
  Image as ImageIcon,
  InsertDriveFile,
  FolderOpen,
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterPanel } from '@/components/common/FilterPanel';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { mockDocuments } from '@/mock/documents';
import { mockChildren } from '@/mock/children';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { showSnackbar } from '@/features/auth/uiSlice';
import { formatDate, formatFileSize } from '@/utils/formatters';

const CATEGORIES = ['All', 'Enrolment', 'Medical', 'Child', 'Family', 'Centre', 'Policy'] as const;

type Category = (typeof CATEGORIES)[number];

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (data: { fileName: string; category: string; childId: string }) => void;
}

function UploadDialog({ open, onClose, onUpload }: UploadDialogProps) {
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState('');
  const [childId, setChildId] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleCategoryChange = (e: SelectChangeEvent) => setCategory(e.target.value);
  const handleChildChange = (e: SelectChangeEvent) => setChildId(e.target.value);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setFileName(file.name);
  };

  const handleUpload = () => {
    if (fileName && category) {
      onUpload({ fileName, category, childId });
      setFileName('');
      setCategory('');
      setChildId('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Document</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Box
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            sx={{
              border: '2px dashed',
              borderColor: dragOver ? 'primary.main' : 'grey.400',
              borderRadius: 1,
              p: 4,
              textAlign: 'center',
              bgcolor: dragOver ? 'primary.50' : 'grey.50',
              cursor: 'pointer',
              mb: 2,
              transition: 'all 0.2s',
            }}
            component="label"
          >
            <input type="file" hidden onChange={handleFileSelect} />
            <Upload sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {fileName || 'Click or drag file here to upload'}
            </Typography>
            {fileName && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Click to change file
              </Typography>
            )}
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="category-label">Category *</InputLabel>
            <Select
              labelId="category-label"
              value={category}
              label="Category *"
              onChange={handleCategoryChange}
            >
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="child-label">Child (optional)</InputLabel>
            <Select
              labelId="child-label"
              value={childId}
              label="Child (optional)"
              onChange={handleChildChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {mockChildren.map((child) => (
                <MenuItem key={child.id} value={child.id}>
                  {child.firstName} {child.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleUpload} disabled={!fileName || !category}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function getFileIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'pdf':
      return <PictureAsPdf sx={{ color: '#d32f2f' }} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
      return <ImageIcon sx={{ color: '#7b1fa2' }} />;
    case 'doc':
    case 'docx':
      return <Description sx={{ color: '#1565c0' }} />;
    default:
      return <InsertDriveFile sx={{ color: '#616161' }} />;
  }
}

function getCategoryColor(category: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default' {
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    Enrolment: 'primary',
    Medical: 'error',
    Child: 'info',
    Family: 'success',
    Centre: 'warning',
    Policy: 'secondary',
  };
  return colors[category] || 'default';
}

interface DocumentCardProps {
  document: typeof mockDocuments[0];
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

function DocumentCard({ document: doc, onDownload, onDelete }: DocumentCardProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ mt: 0.5 }}>{getFileIcon(doc.mimeType)}</Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              {doc.fileName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
              <Chip label={doc.type} color={getCategoryColor(doc.type)} size="small" />
              {doc.childName && (
                <Chip label={doc.childName} size="small" variant="outlined" />
              )}
            </Stack>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Uploaded by {doc.uploadedBy} on {formatDate(doc.createdAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Size: {formatFileSize(doc.fileSize)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <IconButton size="small" onClick={() => onDownload(doc.id)} color="primary">
              <Download fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(doc.id)} color="error">
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DocumentsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();

  const [categoryFilter, setCategoryFilter] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const filteredDocuments = useMemo(() => {
    return mockDocuments.filter((doc) => {
      const matchesCategory = categoryFilter === 'All' || doc.type === categoryFilter;
      const matchesSearch =
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery]);

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value as Category);
  };

  const handleDownload = (id: string) => {
    dispatch(showSnackbar({ message: 'Download started', severity: 'info' }));
  };

  const handleDeleteClick = (id: string) => {
    setSelectedDocId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    dispatch(showSnackbar({ message: 'Document deleted successfully', severity: 'success' }));
    setDeleteDialogOpen(false);
    setSelectedDocId(null);
  };

  const handleUpload = (data: { fileName: string; category: string; childId: string }) => {
    dispatch(showSnackbar({ message: 'Document uploaded successfully', severity: 'success' }));
  };

  return (
    <Box>
      <PageHeader
        title="Documents"
        action={
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={() => setUploadDialogOpen(true)}
          >
            Upload Document
          </Button>
        }
      />

      <FilterPanel>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="category-filter-label">Category</InputLabel>
          <Select
            labelId="category-filter-label"
            value={categoryFilter}
            label="Category"
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search documents..."
        />
      </FilterPanel>

      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={<FolderOpen />}
          title="No documents found"
          description="Upload your first document to get started."
          action={
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload Document
            </Button>
          }
        />
      ) : isMobile ? (
        <Box>
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDownload={handleDownload}
              onDelete={handleDeleteClick}
            />
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Child</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Size</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>{getFileIcon(doc.mimeType)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                      {doc.fileName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doc.type}
                      color={getCategoryColor(doc.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{doc.childName || '-'}</TableCell>
                  <TableCell>{doc.uploadedBy}</TableCell>
                  <TableCell>{formatDate(doc.createdAt)}</TableCell>
                  <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(doc.id)}
                      color="primary"
                    >
                      <Download fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(doc.id)}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUpload}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedDocId(null);
        }}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
}
