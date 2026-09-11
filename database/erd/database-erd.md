# Childcare SaaS - Entity Relationship Diagram

## Textual ERD

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PLATFORM LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  roles ──────────── role_permissions ──────────── permissions        │
│    │                                                           │     │
│    │                                                           │     │
│  user_roles                                                 │     │
│    │                                                         │     │
│  users ◄──────── user_sessions                               │     │
│    │              mfa_settings                                │     │
│    │              password_reset_tokens                       │     │
│    │              login_history                               │     │
│    │                                                          │     │
│  user_organisations ──── organisations                        │     │
│  user_centres              │                                  │     │
│                            ├── organisation_settings          │     │
│                            │                                  │     │
└────────────────────────────┼──────────────────────────────────┘     │
                             │                                        │
┌────────────────────────────┼──────────────────────────────────┐     │
│                    CENTRE LAYER                                │    │
│                            │                                   │    │
│                      centres ◄──────── centre_settings         │    │
│                        │                                      │    │
│                        ├── rooms                              │    │
│                        │     │                                │    │
│                        │     └── children ◄───────────────────┘    │
│                        │           │                                │
│                        │           │                                │
└────────────────────────┼───────────┼────────────────────────────┘    │
                         │           │                                 │
┌────────────────────────┼───────────┼────────────────────────────┐    │
│                 CHILD & FAMILY LAYER                            │   │
│                         │           │                           │   │
│                   families ◄─── child_family_relationships       │   │
│                     │               │                            │   │
│                     ├── family_members                           │   │
│                     │                                           │   │
│              children ◄── emergency_contacts                     │   │
│                     │◄── authorised_pickups                      │   │
│                     │◄── allergies                               │   │
│                     │◄── medical_conditions                      │   │
│                     │◄── dietary_requirements                    │   │
│                     │◄── immunisations                           │   │
│                     │◄── health_notes                            │   │
│                     │◄── child_medications ──── medications      │   │
│                     │      │                                     │   │
│                     │      └── medication_administrations        │   │
│                     │◄── medication_schedules                    │   │
│                     │                                           │   │
└─────────────────────┼───────────────────────────────────────────┘   │
                      │                                               │
┌─────────────────────┼───────────────────────────────────────────┐   │
│              OPERATIONAL LAYER                                  │  │
│                     │                                           │  │
│              enrolments ◄── enrolment_schedules                  │  │
│                     │                                           │  │
│              waitlist_entries                                    │  │
│                     │                                           │  │
│              attendance_records ◄── attendance_events            │  │
│                     │                                           │  │
│              meal_records                                        │  │
│              sleep_records                                       │  │
│              nappy_records                                       │  │
│              toileting_records                                   │  │
│              water_records                                       │  │
│              activity_records                                    │  │
│                     │                                           │  │
│              incidents ◄── incident_witnesses                    │  │
│                     │◄── incident_actions                        │  │
│                     │◄── incident_status_history                 │  │
│                     │                                           │  │
│              learning_stories ◄── learning_story_media           │  │
│                     │◄── learning_story_outcomes                 │  │
│                     │                                           │  │
│              media_files ◄── media_links                         │  │
│                     │                                           │  │
│              documents ◄── document_versions                     │  │
│                     │◄── document_links                          │  │
│                     │                                           │  │
│              consent_requests ◄── consent_responses              │  │
│                     │                                           │  │
│              consent_types                                       │  │
│                     │                                           │  │
└─────────────────────┼───────────────────────────────────────────┘  │
                      │                                              │
┌─────────────────────┼──────────────────────────────────────────┐   │
│              COMMUNICATION LAYER                               │  │
│                     │                                          │  │
│              conversations ◄── conversation_participants        │  │
│                     │                                          │  │
│              messages                                          │  │
│                     │                                          │  │
│              notifications ◄── notification_preferences         │  │
│                     │                                          │  │
└─────────────────────┼──────────────────────────────────────────┘  │
                      │                                             │
┌─────────────────────┼─────────────────────────────────────────┐   │
│              FINANCE LAYER                                    │  │
│                     │                                         │  │
│              billing_accounts                                 │  │
│                     │                                         │  │
│              invoices ◄── invoice_line_items                   │  │
│                     │                                         │  │
│              payments                                         │  │
│                     │                                         │  │
└─────────────────────┼─────────────────────────────────────────┘  │
                      │                                            │
┌─────────────────────┼────────────────────────────────────────┐   │
│              AUDIT & SECURITY LAYER                          │  │
│                     │                                        │  │
│              audit_logs                                      │  │
│                                                             │  │
└─────────────────────────────────────────────────────────────┘   │
                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Relationship Summary

| Parent | Cardinality | Child | Description |
|--------|-------------|-------|-------------|
| organisations | 1 → N | centres | Organisation has many centres |
| organisations | 1 → N | users (via user_organisations) | Organisation has many users |
| centres | 1 → N | rooms | Centre has many rooms |
| centres | 1 → N | children | Centre has many children |
| centres | 1 → N | families | Centre has many families |
| rooms | 1 → N | children | Room has many children |
| families | N → N | children | Via child_family_relationships |
| families | 1 → N | family_members | Family has many members |
| children | 1 → N | emergency_contacts | Child has many emergency contacts |
| children | 1 → N | authorised_pickups | Child has many authorised pickups |
| children | 1 → N | allergies | Child has many allergies |
| children | 1 → N | medical_conditions | Child has many conditions |
| children | 1 → N | medications | Child has many medications |
| children | 1 → N | enrolments | Child has many enrolments |
| children | 1 → N | attendance_records | Child has many attendance records |
| children | 1 → N | incidents | Child has many incidents |
| children | 1 → N | learning_stories | Child has many learning stories |
| children | 1 → N | consent_requests | Child has many consent requests |
| medications | 1 → N | medication_administrations | Medication has many administrations |
| incidents | 1 → N | incident_witnesses | Incident has many witnesses |
| incidents | 1 → N | incident_status_history | Incident has status history |
| learning_stories | 1 → N | learning_story_media | Story has many media |
| learning_stories | 1 → N | learning_story_outcomes | Story has many outcomes |
| conversations | 1 → N | messages | Conversation has many messages |
| conversations | 1 → N | conversation_participants | Conversation has many participants |
| invoices | 1 → N | invoice_line_items | Invoice has many line items |
| invoices | 1 → N | payments | Invoice has many payments |
| users | 1 → N | audit_logs | User has many audit entries |
