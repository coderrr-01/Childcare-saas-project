import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { MfaPage } from '@/features/auth/pages/MfaPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import ChildrenListPage from '@/features/children/pages/ChildrenListPage';
import ChildProfilePage from '@/features/children/pages/ChildProfilePage';
import FamiliesListPage from '@/features/families/pages/FamiliesListPage';
import FamilyProfilePage from '@/features/families/pages/FamilyProfilePage';
import { EnrolmentsListPage } from '@/features/enrolments/pages/EnrolmentsListPage';
import { EnrolmentDetailPage } from '@/features/enrolments/pages/EnrolmentDetailPage';
import { WaitlistPage } from '@/features/waitlist/pages/WaitlistPage';
import AttendancePage from '@/features/attendance/pages/AttendancePage';
import DailyCarePage from '@/features/dailyCare/pages/DailyCarePage';
import HealthPage from '@/features/health/pages/HealthPage';
import MedicationPage from '@/features/medication/pages/MedicationPage';
import IncidentsListPage from '@/features/incidents/pages/IncidentsListPage';
import IncidentDetailPage from '@/features/incidents/pages/IncidentDetailPage';
import { LearningListPage } from '@/features/learning/pages/LearningListPage';
import { LearningDetailPage } from '@/features/learning/pages/LearningDetailPage';
import { MediaPage } from '@/features/media/pages/MediaPage';
import MessagesPage from '@/features/messages/pages/MessagesPage';
import NotificationsPage from '@/features/notifications/pages/NotificationsPage';
import DocumentsPage from '@/features/documents/pages/DocumentsPage';
import ConsentPage from '@/features/consent/pages/ConsentPage';
import BillingPage from '@/features/billing/pages/BillingPage';
import ReportsPage from '@/features/reports/pages/ReportsPage';
import SettingsPage from '@/features/settings/pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('childcare_user');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('childcare_user');
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthRoute><AuthLayout /></AuthRoute>,
    children: [
      { index: true, element: <LoginPage /> },
    ],
  },
  {
    path: '/forgot-password',
    element: <AuthRoute><AuthLayout /></AuthRoute>,
    children: [
      { index: true, element: <ForgotPasswordPage /> },
    ],
  },
  {
    path: '/reset-password',
    element: <AuthRoute><AuthLayout /></AuthRoute>,
    children: [
      { index: true, element: <ResetPasswordPage /> },
    ],
  },
  {
    path: '/mfa',
    element: <AuthRoute><AuthLayout /></AuthRoute>,
    children: [
      { index: true, element: <MfaPage /> },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'children', element: <ChildrenListPage /> },
      { path: 'children/:id', element: <ChildProfilePage /> },
      { path: 'families', element: <FamiliesListPage /> },
      { path: 'families/:id', element: <FamilyProfilePage /> },
      { path: 'enrolments', element: <EnrolmentsListPage /> },
      { path: 'enrolments/:id', element: <EnrolmentDetailPage /> },
      { path: 'waitlist', element: <WaitlistPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'daily-care', element: <DailyCarePage /> },
      { path: 'health', element: <HealthPage /> },
      { path: 'medication', element: <MedicationPage /> },
      { path: 'incidents', element: <IncidentsListPage /> },
      { path: 'incidents/:id', element: <IncidentDetailPage /> },
      { path: 'learning', element: <LearningListPage /> },
      { path: 'learning/:id', element: <LearningDetailPage /> },
      { path: 'media', element: <MediaPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'consent', element: <ConsentPage /> },
      { path: 'billing', element: <BillingPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
