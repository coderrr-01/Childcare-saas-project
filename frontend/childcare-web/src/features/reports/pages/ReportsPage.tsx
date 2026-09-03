import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Tabs,
  Tab,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Assessment,
  EventAvailable,
  ChildCare,
  Assignment,
  ReportProblem,
  Restaurant,
  School,
  Message,
  PictureAsPdf,
  TableChart,
  Download,
  DateRange,
  FilterList,
  BarChart,
  PieChart,
  ShowChart,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterPanel } from '@/components/common/FilterPanel';
import type { Centre, Room, ReportType } from '@/types';

const mockCentres: Centre[] = [
  { id: 'centre-1', name: 'Little Explorers Early Learning', organisationId: 'org-1', address: '42 Eucalyptus Drive, Brisbane QLD 4000', phone: '(07) 3456 7890', email: 'info@littleexplorers.edu.au', capacity: 56, rooms: [], timezone: 'Australia/Brisbane' },
];
import { mockRooms } from '@/mock/rooms';
import { formatDate } from '@/utils/formatters';

interface ReportCard {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: string;
}

interface PreviewTabProps {
  reportType: string;
}

const reportCards: ReportCard[] = [
  {
    id: 'attendance',
    type: 'attendance',
    title: 'Attendance Report',
    description: 'Track daily, weekly, and monthly attendance patterns across all rooms and age groups.',
    icon: <EventAvailable sx={{ fontSize: 40 }} />,
    color: '#1976d2',
    category: 'Operations',
  },
  {
    id: 'children',
    type: 'children',
    title: 'Children Report',
    description: 'Comprehensive overview of enrolled children including demographics and contact details.',
    icon: <ChildCare sx={{ fontSize: 40 }} />,
    color: '#7b1fa2',
    category: 'Enrolment',
  },
  {
    id: 'enrolments',
    type: 'enrolments',
    title: 'Enrolments Report',
    description: 'Analyse enrolment trends, capacity utilisation, and room allocations.',
    icon: <Assignment sx={{ fontSize: 40 }} />,
    color: '#0288d1',
    category: 'Enrolment',
  },
  {
    id: 'waitlist',
    type: 'waitlist',
    title: 'Waitlist Report',
    description: 'Monitor waitlist status, duration, and conversion rates for prospective families.',
    icon: <FilterList sx={{ fontSize: 40 }} />,
    color: '#ed6c02',
    category: 'Enrolment',
  },
  {
    id: 'incidents',
    type: 'incidents',
    title: 'Incidents Report',
    description: 'Review incident reports, incident types, and follow-up actions taken.',
    icon: <ReportProblem sx={{ fontSize: 40 }} />,
    color: '#d32f2f',
    category: 'Safety',
  },
  {
    id: 'daily-care',
    type: 'daily_care',
    title: 'Daily Care Report',
    description: 'Summarise daily care activities including meals, sleeps, and nappy changes.',
    icon: <Restaurant sx={{ fontSize: 40 }} />,
    color: '#2e7d32',
    category: 'Operations',
  },
  {
    id: 'learning',
    type: 'learning',
    title: 'Learning Report',
    description: 'Track learning outcomes, developmental milestones, and programme effectiveness.',
    icon: <School sx={{ fontSize: 40 }} />,
    color: '#7b1fa2',
    category: 'Learning',
  },
  {
    id: 'communication',
    type: 'communication',
    title: 'Communication Report',
    description: 'Analyse parent and staff communication frequency and engagement metrics.',
    icon: <Message sx={{ fontSize: 40 }} />,
    color: '#00838f',
    category: 'Communication',
  },
];

const mockPreviewData: Record<string, { headers: string[]; rows: string[][] }> = {
  attendance: {
    headers: ['Date', 'Room', 'Enrolled', 'Attended', 'Absent', 'Rate'],
    rows: [
      ['01/09/2026', 'Infants', '12', '11', '1', '91.7%'],
      ['01/09/2026', 'Toddlers', '15', '14', '1', '93.3%'],
      ['01/09/2026', 'Preschool', '20', '18', '2', '90.0%'],
      ['02/09/2026', 'Infants', '12', '10', '2', '83.3%'],
      ['02/09/2026', 'Toddlers', '15', '15', '0', '100.0%'],
    ],
  },
  children: {
    headers: ['Name', 'Age', 'Room', 'Parent', 'Status', 'Enrolled Since'],
    rows: [
      ['Liam Johnson', '2 years', 'Toddlers', 'Sarah Johnson', 'Active', '15/01/2025'],
      ['Emma Williams', '4 years', 'Preschool', 'Michael Williams', 'Active', '01/03/2024'],
      ['Oliver Brown', '1 year', 'Infants', 'Jessica Brown', 'Active', '10/06/2025'],
      ['Sophia Davis', '3 years', 'Toddlers', 'David Davis', 'Active', '20/09/2024'],
      ['Noah Wilson', '5 years', 'Preschool', 'Laura Wilson', 'Graduated', '05/02/2023'],
    ],
  },
  enrolments: {
    headers: ['Room', 'Capacity', 'Enrolled', 'Available', 'Utilisation'],
    rows: [
      ['Infants', '15', '12', '3', '80.0%'],
      ['Toddlers', '20', '18', '2', '90.0%'],
      ['Preschool', '25', '22', '3', '88.0%'],
      ['School Age', '20', '15', '5', '75.0%'],
    ],
  },
  waitlist: {
    headers: ['Child', 'Age', 'Preferred Room', 'Date Listed', 'Status', 'Priority'],
    rows: [
      ['Ava Martinez', '18 months', 'Toddlers', '01/08/2026', 'Waiting', 'High'],
      ['Ethan Anderson', '3 years', 'Preschool', '15/07/2026', 'Waiting', 'Medium'],
      ['Mia Thomas', '2 years', 'Toddlers', '10/07/2026', 'Offered', 'High'],
      ['Lucas Garcia', '4 years', 'Preschool', '20/06/2026', 'Waiting', 'Low'],
    ],
  },
  incidents: {
    headers: ['Date', 'Child', 'Type', 'Severity', 'Staff', 'Follow-up'],
    rows: [
      ['01/09/2026', 'Liam Johnson', 'Minor Injury', 'Low', 'Emma S.', 'Parent notified'],
      ['30/08/2026', 'Sophia Davis', 'Allergic Reaction', 'Medium', 'Sarah K.', 'Action plan updated'],
      ['28/08/2026', 'Oliver Brown', 'Bump/Scrape', 'Low', 'David M.', 'First aid applied'],
    ],
  },
  daily_care: {
    headers: ['Child', 'Room', 'Meals', 'Naps', 'Nappy Changes', 'Mood'],
    rows: [
      ['Liam Johnson', 'Toddlers', '3/3', '2 hrs', '4', 'Happy'],
      ['Emma Williams', 'Preschool', '3/3', '1.5 hrs', '2', 'Happy'],
      ['Oliver Brown', 'Infants', '4/4', '3 hrs', '6', 'Content'],
      ['Sophia Davis', 'Toddlers', '2/3', '2.5 hrs', '3', 'Tired'],
    ],
  },
  learning: {
    headers: ['Child', 'Area', 'Milestone', 'Status', 'Date Observed', 'Educator'],
    rows: [
      ['Liam Johnson', 'Motor Skills', 'Runs confidently', 'Achieved', '01/09/2026', 'Emma S.'],
      ['Emma Williams', 'Literacy', 'Writes first name', 'In Progress', '28/08/2026', 'Sarah K.'],
      ['Oliver Brown', 'Language', '10+ words', 'Achieved', '25/08/2026', 'David M.'],
      ['Sophia Davis', 'Social', 'Shares with peers', 'In Progress', '30/08/2026', 'Emma S.'],
    ],
  },
  communication: {
    headers: ['Date', 'Type', 'From', 'To', 'Subject', 'Status'],
    rows: [
      ['01/09/2026', 'Email', 'Emma S.', 'Sarah Johnson', 'Weekly Update', 'Sent'],
      ['01/09/2026', 'App', 'David M.', 'All Parents', 'Reminder: Concert', 'Sent'],
      ['31/08/2026', 'Email', 'Sarah K.', 'Michael Williams', 'Enquiry Response', 'Replied'],
      ['30/08/2026', 'Meeting', 'Emma S.', 'Jessica Brown', 'Progress Review', 'Scheduled'],
    ],
  },
};

const ReportPreview = ({ reportType }: PreviewTabProps) => {
  const previewData = mockPreviewData[reportType];

  if (!previewData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <BarChart sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Preview not available for this report type.
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Generate the report to see full results.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        This is a sample preview. Click "Generate Report" to create the full report with real data.
      </Alert>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              {previewData.headers.map((header) => (
                <TableCell key={header} sx={{ fontWeight: 600 }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.rows.map((row, index) => (
              <TableRow key={index} hover>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <ShowChart sx={{ color: 'text.disabled' }} />
        <Typography variant="body2" color="text.secondary">
          Chart visualisation available in the full report
        </Typography>
      </Box>
    </Box>
  );
};

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCentre, setSelectedCentre] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<string>('pdf');
  const [previewTab, setPreviewTab] = useState<number>(0);

  const handleReportSelect = (reportId: string) => {
    setSelectedReport(reportId === selectedReport ? null : reportId);
    setPreviewTab(0);
  };

  const handleGenerateReport = () => {
    if (!selectedReport) return;
    // In a real app, this would trigger report generation
  };

  const selectedReportCard = reportCards.find((r) => r.id === selectedReport);

  return (
    <Box>
      <PageHeader
        title="Reports"
        subtitle="Generate comprehensive reports for your childcare centre"
        action={{
          label: selectedReport ? 'Generate Report' : undefined,
          onClick: handleGenerateReport,
          icon: <Assessment />,
          disabled: !selectedReport,
        }}
      />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} sx={{ mb: 2 }}>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Date From"
              type="date"
              size="small"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              InputProps={{
                startAdornment: <DateRange sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Date To"
              type="date"
              size="small"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              InputProps={{
                startAdornment: <DateRange sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Centre</InputLabel>
              <Select
                value={selectedCentre}
                label="Centre"
                onChange={(e) => setSelectedCentre(e.target.value)}
              >
                <MenuItem value="all">All Centres</MenuItem>
                {mockCentres.map((centre: Centre) => (
                  <MenuItem key={centre.id} value={centre.id}>
                    {centre.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Room</InputLabel>
              <Select
                value={selectedRoom}
                label="Room"
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                <MenuItem value="all">All Rooms</MenuItem>
                {mockRooms.map((room: Room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setDateFrom('');
              setDateTo('');
              setSelectedCentre('all');
              setSelectedRoom('all');
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: selectedReport ? 5 : 12, lg: selectedReport ? 5 : 12 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Available Reports
          </Typography>
          <Grid container spacing={2}>
            {reportCards.map((report) => (
              <Grid size={{ xs: 12, sm: 6 }} key={report.id}>
                <Card
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: selectedReport === report.id ? 2 : 1,
                    borderColor: selectedReport === report.id ? report.color : 'divider',
                    '&:hover': {
                      borderColor: report.color,
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => handleReportSelect(report.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: `${report.color}15`,
                          color: report.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {report.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {report.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {report.description}
                        </Typography>
                        <Chip
                          label={report.category}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {selectedReport && (
          <Grid size={{ xs: 12, md: 7, lg: 7 }}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {selectedReportCard?.icon && (
                    <Box sx={{ color: selectedReportCard.color }}>
                      {selectedReportCard.icon}
                    </Box>
                  )}
                  <Box>
                    <Typography variant="h6">{selectedReportCard?.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Preview
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Export as PDF">
                    <IconButton
                      color={exportFormat === 'pdf' ? 'primary' : 'default'}
                      onClick={() => setExportFormat('pdf')}
                    >
                      <PictureAsPdf />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export as CSV">
                    <IconButton
                      color={exportFormat === 'csv' ? 'primary' : 'default'}
                      onClick={() => setExportFormat('csv')}
                    >
                      <TableChart />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export as Excel">
                    <IconButton
                      color={exportFormat === 'excel' ? 'primary' : 'default'}
                      onClick={() => setExportFormat('excel')}
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <ReportPreview reportType={selectedReport} />

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" onClick={() => setSelectedReport(null)}>
                  Close Preview
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleGenerateReport}
                >
                  Generate Full Report
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
