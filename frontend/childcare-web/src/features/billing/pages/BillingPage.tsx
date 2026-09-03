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
  Tabs,
  Tab,
  Chip,
  Card,
  CardContent,
  Collapse,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TablePagination,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  Receipt,
  Warning,
  CheckCircle,
  ArrowDropDown,
  ArrowDropUp,
  ReceiptLong,
  TrendingUp,
  PendingActions,
  Payments,
  Download,
  FilterList,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StatsCard } from '@/components/common/StatsCard';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { mockInvoices } from '@/mock/billing';
import { mockFamilies } from '@/mock/families';
import { mockChildren } from '@/mock/children';
import { formatDate, formatCurrency } from '@/utils/formatters';
import type { Invoice, InvoiceStatus, InvoiceLineItem } from '@/types';

type TabValue = 'all' | 'pending' | 'overdue' | 'paid';

interface InvoiceDetailDialogProps {
  open: boolean;
  invoice: Invoice | null;
  onClose: () => void;
}

const statusTabConfig: Record<TabValue, { label: string; color: string }> = {
  all: { label: 'All Invoices', color: '#1976d2' },
  pending: { label: 'Pending', color: '#ed6c02' },
  overdue: { label: 'Overdue', color: '#d32f2f' },
  paid: { label: 'Paid', color: '#2e7d32' },
};

function getChildNames(childIds: string[]): string {
  return childIds
    .map((id) => {
      const child = mockChildren.find((c) => c.id === id);
      return child ? `${child.firstName} ${child.lastName}` : id;
    })
    .join(', ');
}

function getStatusColor(status: InvoiceStatus): string {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'OVERDUE':
      return 'error';
    case 'DRAFT':
      return 'default';
    case 'CANCELLED':
      return 'default';
    default:
      return 'default';
  }
}

const InvoiceDetailDialog = ({ open, invoice, onClose }: InvoiceDetailDialogProps) => {
  if (!invoice) return null;

  const family = mockFamilies.find((f) => f.id === invoice.familyId);
  const lineItems: InvoiceLineItem[] = invoice.lineItems || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReceiptLong />
        Invoice {invoice.invoiceNumber}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Invoice To
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {family ? `${family.primaryContact.firstName} ${family.primaryContact.lastName}` : 'Unknown Family'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {family ? `${family.address.street}, ${family.address.suburb}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {family?.primaryContact.email || ''}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Invoice Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Invoice #:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {invoice.invoiceNumber}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Date:
                </Typography>
                <Typography variant="body2">{formatDate(invoice.issueDate)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Due Date:
                </Typography>
                <Typography variant="body2">{formatDate(invoice.dueDate)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <StatusBadge label={invoice.status} color={getStatusColor(invoice.status)} />
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Line Items
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineItems.length > 0 ? (
                    lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No line items available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ ml: 'auto' }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal:
                </Typography>
                <Typography variant="body2">{formatCurrency(invoice.subtotal)}</Typography>
              </Box>
              {invoice.gst > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    GST:
                  </Typography>
                  <Typography variant="body2">{formatCurrency(invoice.gst)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2">Total Due:</Typography>
                <Typography variant="subtitle2" color="primary">
                  {formatCurrency(invoice.total)}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {invoice.paidDate && (
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ bgcolor: 'success.light', border: 'none' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: 'success.main' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Payment Received
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Paid on {formatDate(invoice.paidDate)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="outlined" startIcon={<Download />}>
          Download PDF
        </Button>
        {invoice.status !== 'PAID' && (
          <Button variant="contained" startIcon={<Payments />}>
            Record Payment
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredInvoices = useMemo(() => {
    let result = mockInvoices;

    if (activeTab !== 'all') {
      result = result.filter((inv) => inv.status === activeTab.toUpperCase());
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((inv) => {
        const family = mockFamilies.find((f) => f.id === inv.familyId);
        return (
          inv.invoiceNumber.toLowerCase().includes(term) ||
          family?.primaryContact?.firstName?.toLowerCase().includes(term) ||
          family?.primaryContact?.lastName?.toLowerCase().includes(term)
        );
      });
    }

    return result;
  }, [activeTab, searchTerm]);

  const paginatedInvoices = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredInvoices.slice(start, start + rowsPerPage);
  }, [filteredInvoices, page, rowsPerPage]);

  const stats = useMemo(() => {
    const totalRevenue = mockInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const outstanding = mockInvoices
      .filter((inv) => inv.status === 'PENDING')
      .reduce((sum, inv) => sum + inv.total, 0);
    const overdue = mockInvoices
      .filter((inv) => inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + inv.total, 0);

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const paidThisMonth = mockInvoices
      .filter((inv) => {
        if (inv.status !== 'PAID' || !inv.paidDate) return false;
        const paidDate = new Date(inv.paidDate);
        return paidDate.getMonth() === thisMonth && paidDate.getFullYear() === thisYear;
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    return { totalRevenue, outstanding, overdue, paidThisMonth };
  }, []);

  const handleViewDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedInvoice(null);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleExpandRow = (invoiceId: string) => {
    setExpandedRow(expandedRow === invoiceId ? null : invoiceId);
  };

  return (
    <Box>
      <PageHeader
        title="Billing & Invoices"
        subtitle="Manage invoices, track payments, and monitor outstanding balances"
        actions={
          <Button variant="contained" startIcon={<Receipt />} onClick={() => {}}>
            Create Invoice
          </Button>
        }
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<TrendingUp />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Outstanding"
            value={formatCurrency(stats.outstanding)}
            icon={<PendingActions />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Overdue"
            value={formatCurrency(stats.overdue)}
            icon={<Warning />}
            color="error"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Paid This Month"
            value={formatCurrency(stats.paidThisMonth)}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 2 }}>
            {Object.entries(statusTabConfig).map(([key, config]) => (
              <Tab
                key={key}
                value={key}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {config.label}
                    <Chip
                      size="small"
                      label={
                        key === 'all'
                          ? mockInvoices.length
                          : mockInvoices.filter((inv) => inv.status === key.toUpperCase()).length
                      }
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        bgcolor: key === activeTab ? config.color : 'grey.300',
                        color: key === activeTab ? 'white' : 'text.primary',
                      }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search invoices by number, family, or child..."
          />
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<FilterList />}>
              Filters
            </Button>
            <Button variant="outlined" startIcon={<Download />}>
              Export
            </Button>
          </Box>
        </Box>

        {paginatedInvoices.length === 0 ? (
          <EmptyState
            title="No invoices found"
            description="No invoices match your current filters. Try adjusting your search or tab selection."
            icon={<Receipt sx={{ fontSize: 48, color: 'text.disabled' }} />}
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Invoice #</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Family</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedInvoices.map((invoice) => {
                  const family = mockFamilies.find((f) => f.id === invoice.familyId);
                  const isExpanded = expandedRow === invoice.id;
                  const isOverdue = invoice.status === 'OVERDUE';
                  const daysOverdue = isOverdue
                    ? Math.floor(
                        (Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                      )
                    : 0;

                  return (
                    <>
                      <TableRow
                        key={invoice.id}
                        hover
                        sx={{
                          bgcolor: isOverdue ? 'error.light' : undefined,
                          '&:hover': {
                            bgcolor: isOverdue ? 'error.main' : undefined,
                            color: isOverdue ? 'white' : undefined,
                          },
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleExpandRow(invoice.id)}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton size="small">
                              {isExpanded ? <ArrowDropUp /> : <ArrowDropDown />}
                            </IconButton>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {invoice.invoiceNumber}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {family ? `${family.primaryContact.firstName} ${family.primaryContact.lastName}` : 'Unknown Family'}
                          </Typography>
                          {family?.childIds && family.childIds.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {getChildNames(family.childIds)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(invoice.issueDate)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">{formatDate(invoice.dueDate)}</Typography>
                            {isOverdue && (
                              <Typography variant="caption" color="error">
                                {daysOverdue} days overdue
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(invoice.total)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <StatusBadge label={invoice.status} color={getStatusColor(invoice.status)} />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(invoice);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow key={`expand-${invoice.id}`}>
                        <TableCell sx={{ py: 0 }} colSpan={7}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2, px: 3, bgcolor: 'grey.50', borderRadius: 1, mb: 1 }}>
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Invoice Summary
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {invoice.notes || 'Childcare services'}
                                  </Typography>
                                  {invoice.notes && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      <strong>Notes:</strong> {invoice.notes}
                                    </Typography>
                                  )}
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<Visibility />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewDetail(invoice);
                                      }}
                                    >
                                      Full Details
                                    </Button>
                                    {invoice.status !== 'PAID' && (
                                      <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={<Payments />}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        Record Payment
                                      </Button>
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          component="div"
          count={filteredInvoices.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      <InvoiceDetailDialog
        open={detailOpen}
        invoice={selectedInvoice}
        onClose={handleCloseDetail}
      />
    </Box>
  );
}
