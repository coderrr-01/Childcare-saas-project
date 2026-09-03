# Little Explorers - Childcare SaaS Frontend

A production-quality React frontend for a Childcare / Early Learning Centre Management SaaS application designed for Australia and New Zealand.

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Material UI (MUI) v9
- React Router v7
- Redux Toolkit
- React Hook Form + Zod
- Recharts

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 9+

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`.

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Demo Accounts

Use these credentials to log in (password: `Password123!` for all accounts):

| Role | Email |
|------|-------|
| Super Admin | superadmin@example.com |
| Organisation Admin | orgadmin@example.com |
| Centre Director | director@example.com |
| Educator | educator@example.com |
| Parent | parent@example.com |

## Features

### Core Modules

- **Dashboard** - KPIs, attendance overview, room occupancy, recent activity
- **Children** - Child profiles, search, filter, comprehensive profile view
- **Families** - Family management, parent/guardian details, emergency contacts
- **Enrolments** - Enrolment management with status tracking
- **Waitlist** - Waitlist management with priority and status

### Educator Tools

- **Attendance** - Touch-friendly check-in/check-out with bulk actions
- **Daily Care** - Fast-entry for meals, sleep, nappy/toileting, activities
- **Medication** - Medication scheduling and administration tracking
- **Incidents** - Incident reporting with workflow status tracking
- **Learning Stories** - Observation and learning outcome documentation

### Communication

- **Messages** - Parent-educator messaging interface
- **Notifications** - Centre-wide notification system
- **Documents** - Document management and upload
- **Consent** - Consent request and approval workflow

### Administration

- **Billing** - Invoice management and payment tracking
- **Reports** - Attendance, enrolment, incident, and learning reports
- **Settings** - Profile, centre, organisation, and user management

## Project Structure

```
src/
├── app/              # Redux store, router
├── assets/           # Images, icons, fonts
├── components/       # Reusable UI components
│   ├── common/       # StatusBadge, Avatar, PageHeader, etc.
│   ├── forms/        # Form components
│   ├── tables/       # Table components
│   ├── cards/        # Card components
│   ├── modals/       # Modal components
│   └── layout/       # Sidebar, Header, Snackbar
├── features/         # Feature modules (pages + components)
├── hooks/            # Custom React hooks
├── layouts/          # App layouts (MainLayout, AuthLayout)
├── mock/             # Mock data for local development
├── services/         # API services (ready for backend integration)
├── theme/            # MUI theme configuration
├── types/            # TypeScript type definitions
├── constants/        # App constants (roles, permissions, statuses)
└── utils/            # Utility functions
```

## Architecture Notes

### Mock Data

All data is currently served from local mock files in `src/mock/`. This allows the frontend to run completely independently without a backend.

### Backend Integration

The project is structured for easy backend integration:

1. Replace mock data imports with RTK Query API calls
2. Update `src/services/api/baseApi.ts` with your Spring Boot REST API base URL
3. Create RTK Query endpoints for each feature module
4. The Redux store and component structure will remain unchanged

### Role-Based UI

The sidebar navigation and available features change based on the logged-in user's role:
- **Super Admin / Org Admin / Centre Director**: Full access to all modules
- **Educator**: Access to children, attendance, daily care, medication, incidents, learning, messages
- **Parent**: Simplified view with their children, updates, photos, messages, billing

## Colour Palette

The application uses a nature-inspired colour palette:
- Primary: Eucalyptus green (#5B8C5A)
- Secondary: Soft teal (#4A9EAD)
- Background: Warm cream (#F8FAF7)
- Sidebar: Deep green (#2D4A3E)

## Responsive Design

The application is fully responsive:
- Desktop: Full sidebar + content layout
- Tablet: Collapsible sidebar, adapted tables
- Mobile: Drawer navigation, card-based layouts, touch-friendly controls
