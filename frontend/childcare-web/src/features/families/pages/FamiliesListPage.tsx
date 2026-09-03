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
  Chip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add, Visibility } from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { mockFamilies } from '@/mock/families';
import { mockChildren } from '@/mock/children';
import type { Family } from '@/types';

export default function FamiliesListPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');

  const families = useMemo(() => {
    if (!searchQuery.trim()) return mockFamilies;
    const q = searchQuery.toLowerCase();
    return mockFamilies.filter(
      (f) =>
        `${f.primaryContact.firstName} ${f.primaryContact.lastName}`.toLowerCase().includes(q) ||
        f.primaryContact.firstName.toLowerCase().includes(q) ||
        f.primaryContact.lastName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const getChildCount = (familyId: string) =>
    mockChildren.filter((c) => c.familyId === familyId).length;

  if (families.length === 0 && !searchQuery) {
    return (
      <Box>
        <PageHeader title="Families">
          <IconButton
            color="primary"
            onClick={() => navigate('/families/new')}
          >
            <Add />
          </IconButton>
        </PageHeader>
        <EmptyState
          title="No families found"
          description="Add your first family to get started."
        />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Families">
        <IconButton color="primary" onClick={() => navigate('/families/new')}>
          <Add />
        </IconButton>
      </PageHeader>

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search families by name or contact..."
      />

      {families.length === 0 ? (
        <EmptyState
          title="No results found"
          description={`No families match "${searchQuery}"`}
        />
      ) : isMobile ? (
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          {families.map((family: Family) => (
            <Card
              key={family.id}
              variant="outlined"
              sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
              onClick={() => navigate(`/families/${family.id}`)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {family.primaryContact.firstName} {family.primaryContact.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {family.primaryContact.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {family.address.street}, {family.address.suburb}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${getChildCount(family.id)} child${getChildCount(family.id) !== 1 ? 'ren' : ''}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Typography variant="body2" color="text.secondary">
                    {family.primaryContact.phone}
                  </Typography>
                  <IconButton size="small" color="primary">
                    <Visibility fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Family Name</TableCell>
                <TableCell>Primary Contact</TableCell>
                <TableCell align="center">Children</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {families.map((family: Family) => (
                <TableRow
                  key={family.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/families/${family.id}`)}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>{family.primaryContact.firstName} {family.primaryContact.lastName}</Typography>
                  </TableCell>
                  <TableCell>{family.primaryContact.email}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getChildCount(family.id)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {family.address.street}, {family.address.suburb}
                    </Typography>
                  </TableCell>
                  <TableCell>{family.primaryContact.phone}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/families/${family.id}`);
                      }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
