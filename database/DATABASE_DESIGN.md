# Childcare SaaS - PostgreSQL Database Design

## 1. Architecture Overview

### Multi-Tenant Strategy
This is a **shared-database, shared-schema** SaaS architecture with tenant isolation enforced via `organisation_id` and `centre_id` foreign keys on every business table. Row-Level Security (RLS) policies can be applied at the application layer via Spring Boot repository filters.

### Hierarchy
```
Platform
  └── Organisation (tenant)
        └── Centre
              └── Room
                    └── Child
```

### Primary Key Strategy
**BIGINT GENERATED ALWAYS AS IDENTITY** is used throughout. Rationale:
- Better index performance than UUID in B-tree indexes
- Smaller storage (8 bytes vs 16 bytes)
- Natural ordering for temporal data
- UUIDs can be exposed as application-level IDs if needed for external APIs

### Soft Delete Strategy
- **Soft delete (`deleted_at`)**: Users, organisations, centres, children, families — entities with cascading relationships
- **Hard delete**: Never used for business records
- **Archive**: Attendance, medication administrations, incidents, invoices — historical records kept intact
- **No delete**: Audit logs, notification reads, consent history — immutable records

### Naming Conventions
- All table names: plural, snake_case (`children`, `attendance_records`)
- All column names: snake_case (`date_of_birth`, `created_at`)
- Foreign keys: `{referenced_table_singular}_id` (`child_id`, `centre_id`)
- Primary keys: always `id`
- Timestamps: `created_at`, `updated_at`, `deleted_at`
- Monetary values: `NUMERIC(12,2)` — never floating point
- Status columns: VARCHAR with CHECK constraints (not ENUMs) for flexibility

### Schema Organization
All tables reside in the `public` schema. At this scale, PostgreSQL schemas would add complexity without commensurate benefit. Tenant isolation is enforced at the application layer.

---

## 2. Domain Breakdown

### Identity & Access (7 tables)
- `users` — Platform users (all roles)
- `roles` — Role definitions (SUPER_ADMIN, ORG_ADMIN, CENTRE_ADMIN, EDUCATOR, PARENT)
- `permissions` — Granular permissions (children:read, etc.)
- `role_permissions` — Many-to-many role ↔ permission
- `user_roles` — Many-to-many user ↔ role (with scope)
- `user_organisations` — User ↔ organisation membership
| user_centres` — User ↔ centre membership
| user_sessions` — Active sessions
| mfa_settings` — MFA configuration per user
| password_reset_tokens` — Password reset tokens

### Organisation & Centre (5 tables)
- `organisations` — Top-level tenant
- `organisation_settings` — Key-value configuration
- `centres` — Childcare centres
- `centre_settings` — Key-value configuration
- `rooms` — Rooms within centres

### Child & Family (7 tables)
- `children` — Child profiles
- `families` — Family units
- `family_members` — Individual family members (parents/guardians)
- `child_family_relationships` — Many-to-many child ↔ family with relationship type
- `emergency_contacts` — Emergency contacts per child
- `authorised_pickups` — Authorised pickup persons per child
- `child_health_summary` — Quick-access health summary on child

### Enrolment & Waitlist (2 tables)
- `enrolments` — Active and historical enrolments
- `waitlist_entries` — Waitlist queue

### Attendance (2 tables)
- `attendance_records` — One record per child per day (the source of truth)
- `attendance_events` — Individual check-in/check-out events

### Daily Care (6 tables)
- `meal_records` — Meals and nutrition
- `sleep_records` — Sleep/naps
- `nappy_records` — Nappy changes
- `toileting_records` — Toileting
- `water_records` — Water intake
- `activity_records` — Activities and daily notes

### Health (5 tables)
- `allergies` — Allergies per child
- `medical_conditions` — Medical conditions per child
- `dietary_requirements` — Dietary needs per child
- `immunisations` — Immunisation records
- `health_notes` — General health notes

### Medication (3 tables)
- `medications` — Medication definitions
- `child_medications` — Active medication assignments per child
- `medication_administrations` — Administration log

### Incidents (4 tables)
- `incidents` — Incident reports
- `incident_witnesses` — Witnesses per incident
- `incident_actions` — Actions taken per incident
- `incident_status_history` — Workflow status changes

### Learning Stories (3 tables)
- `learning_stories` — Story records
- `learning_story_media` — Media attachments
- `learning_story_outcomes` — EYLF outcomes linked

### Media (2 tables)
- `media_files` — File metadata (S3 references)
- `media_links` — Polymorphic linking to children/centres/stories

### Messaging (4 tables)
- `conversations` — Conversation threads
- `conversation_participants` — Participants per conversation
- `messages` — Individual messages
- `message_reads` — Read receipts

### Notifications (3 tables)
- `notifications` — Notification records
| notification_preferences` — User notification settings
| notification_reads` — Read tracking

### Documents (3 tables)
- `documents` — Document metadata
- `document_versions` — Version history
- `document_links` — Polymorphic linking

### Consent (3 tables)
- `consent_types` — Types of consent
- `consent_requests` — Consent request records
- `consent_responses` — Individual responses

### Billing (4 tables)
- `billing_accounts` — Family billing accounts
- `invoices` — Invoice headers
- `invoice_line_items` — Invoice line items
- `payments` — Payment records

### Audit & Security (4 tables)
- `audit_logs` — Comprehensive audit trail
- `user_sessions` — Active sessions (also in Identity)
- `login_history` — Login audit trail
- `data_access_logs` — Data access tracking

---

## 3. Entity Relationship Map

```
organisations
    │
    ├── organisation_settings
    │
    ├── centres
    │     │
    │     ├── centre_settings
    │     │
    │     ├── rooms
    │     │     │
    │     │     └── children ◄──────── child_family_relationships ────── families
    │     │           │                                              │
    │     │           ├── emergency_contacts                         ├── family_members
    │     │           ├── authorised_pickups                         │
    │     │           ├── child_health_summary                       │
    │     │           │                                              │
    │     │           ├── allergies                                  │
    │     │           ├── medical_conditions                         │
    │     │           ├── dietary_requirements                       │
    │     │           ├── immunisations                              │
    │     │           ├── health_notes                               │
    │     │           │                                              │
    │     │           ├── child_medications ───── medications        │
    │     │           │     │                                        │
    │     │           │     └── medication_administrations           │
    │     │           │                                              │
    │     │           ├── enrolments ────────────────────────────────┘
    │     │           ├── waitlist_entries
    │     │           ├── attendance_records
    │     │           │     └── attendance_events
    │     │           │
    │     │           ├── meal_records
    │     │           ├── sleep_records
    │     │           ├── nappy_records
    │     │           ├── toileting_records
    │     │           ├── water_records
    │     │           ├── activity_records
    │     │           │
    │     │           ├── incidents
    │     │           │     ├── incident_witnesses
    │     │           │     ├── incident_actions
    │     │           │     └── incident_status_history
    │     │           │
    │     │           ├── learning_stories
    │     │           │     ├── learning_story_media
    │     │           │     └── learning_story_outcomes
    │     │           │
    │     │           ├── consent_requests
    │     │           │     └── consent_responses
    │     │           │
    │     │           └── media_links ──── media_files
    │     │
    │     └── documents ──── document_versions
    │           └── document_links
    │
    ├── users ◄── user_roles ──── roles ◄── role_permissions ──── permissions
    │     │
    │     ├── user_organisations
    │     ├── user_centres
    │     ├── user_sessions
    │     ├── mfa_settings
    │     ├── password_reset_tokens
    │     ├── login_history
    │     ├── notifications
    │     ├── notification_preferences
    │     ├── notification_reads
    │     ├── message_reads
    │     └── audit_logs
    │
    ├── organisations ── billing_accounts ── invoices ── invoice_line_items
    │                                              │
    │                                              └── payments
    │
    └── conversations ── conversation_participants
          └── messages
```

---

## 4. Multi-Tenancy Decision

| Table | organisation_id | centre_id | Rationale |
|-------|----------------|-----------|-----------|
| users | NO | NO | Users exist globally; scoped via user_organisations/user_centres |
| roles | NO | NO | Platform-wide reference data |
| permissions | NO | NO | Platform-wide reference data |
| organisations | NO | NO | Top-level entity |
| centres | YES | NO | Belongs to organisation |
| rooms | YES | YES | Derived from centre |
| children | YES | YES | Derived from centre via room |
| families | YES | YES | Scoped to centre context |
| enrolments | YES | YES | Explicit for query efficiency |
| attendance_records | YES | YES | Explicit for query efficiency |
| All daily care | YES | YES | Explicit for query efficiency |
| All health | YES | YES | Derived from child |
| medications | YES | YES | Derived from child |
| incidents | YES | YES | Explicit for query efficiency |
| learning_stories | YES | YES | Explicit for query efficiency |
| media_files | YES | YES | Explicit for query efficiency |
| conversations | NO | YES | Centre-scoped conversations |
| messages | NO | NO | Derived from conversation |
| documents | YES | YES | Explicit for query efficiency |
| consent_requests | YES | YES | Derived from child |
| invoices | YES | YES | Explicit for query efficiency |
| audit_logs | YES | YES | Explicit for query efficiency |

---

## 5. Status Values (from TypeScript types)

| Domain | Statuses |
|--------|----------|
| Child | ENROLLED, WAITLISTED, WITHDRAWN, TRANSFERRED |
| Enrolment | DRAFT, PENDING_APPROVAL, ACTIVE, COMPLETED, CANCELLED |
| Waitlist | ACTIVE, OFFERED, ENROLLED, EXPIRED, CANCELLED |
| Attendance | EXPECTED, PRESENT, ABSENT, LATE, LEFT_EARLY |
| Health Severity | LOW, MODERATE, HIGH, SEVERE, CRITICAL |
| Medication Status | ACTIVE, SCHEDULED, DUE, ADMINISTERED, MISSED, SKIPPED, COMPLETED |
| Incident Status | DRAFT, REPORTED, PARENT_NOTIFIED, ACKNOWLEDGED, FOLLOW_UP, CLOSED |
| Incident Severity | MINOR, MODERATE, MAJOR, SEVERE, CRITICAL |
| Learning Story | DRAFT, PUBLISHED |
| Consent | PENDING, APPROVED, DECLINED, EXPIRED |
| Invoice | DRAFT, PENDING, PAID, OVERDUE, CANCELLED |
| Notification | ATTENDANCE, MEDICATION, INCIDENT, MESSAGE, CONSENT, ENROLMENT, SYSTEM |

---

## 6. Index Strategy

Key indexes based on query patterns observed in the UI:

- **Dashboard queries**: centre_id + date combinations
- **Children list**: centre_id, room_id, status, date_of_birth
- **Attendance**: child_id + date (unique), centre_id + date
- **Daily care**: child_id + date + type
- **Messages**: conversation_id + created_at
- **Notifications**: user_id + read_at + created_at
- **Billing**: family_id + status, centre_id + status
- **Audit**: organisation_id + created_at, entity_type + entity_id

---

## 7. Security Considerations

- Passwords stored as bcrypt hashes (never plaintext)
- MFA support via TOTP
- Session management with expiry
- Audit logging on all data modifications
- Sensitive health data accessible only to authorised roles
- Parent portal isolated to own children's data only
- Login history tracking
- Data access logging for compliance

---

## 8. Extensibility

The schema is designed for Phase 1 but is extensible for:
- Phase 2: CCS integration (add billing_rules, subsidy_tables)
- Phase 2: Rostering (add staff_schedules, shift_assignments)
- Phase 2: NQS compliance (add compliance_checklists, assessments)
- Phase 3: Advanced analytics (add fact_tables, dimension_tables)
- Phase 3: Mobile apps (same API layer, no schema changes needed)
