import { Box, Typography, Button, IconButton, Breadcrumbs, Link } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: React.ReactNode;
  backTo?: string;
}

export function PageHeader({ title, subtitle, breadcrumb, actions, backTo }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumbs sx={{ mb: 1 }}>
          {breadcrumb.map((item, index) => (
            <Link
              key={index}
              component={item.path ? 'button' : 'span'}
              variant="body2"
              color={item.path ? 'primary' : 'text.primary'}
              underline="hover"
              onClick={item.path ? () => navigate(item.path!) : undefined}
              sx={{ cursor: item.path ? 'pointer' : 'default' }}
            >
              {item.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {backTo && (
            <IconButton onClick={() => navigate(backTo)} size="small">
              <ArrowBack />
            </IconButton>
          )}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {actions && <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>{actions}</Box>}
      </Box>
    </Box>
  );
}
