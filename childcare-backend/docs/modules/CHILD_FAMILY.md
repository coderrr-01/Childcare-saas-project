# Module 3: Child & Family Management

**Status:** COMPLETE
**Date:** 2026-09-12

## Overview

Module 3 implements child and family management for the Childcare SaaS platform. This module provides full CRUD operations for children, families, family members, emergency contacts, and authorised pickups, with complete tenancy isolation, RBAC enforcement, and audit logging.

## Architecture

### Entity Model

```
Organisation (1) ──< Centre (1) ──< Child
                    Centre (1) ──< Family
                    Family (1) ──< FamilyMember
                    Family (1) ──< AuthorisedPickup
                    Child (1) ──< EmergencyContact
                    Child (many) >──< Family (many) via ChildFamilyRelationship
```

### Entities

| Entity | Table | Key Fields |
|--------|-------|------------|
| `Child` | `children` | firstName, lastName, dateOfBirth, gender, enrolmentStatus, centreId |
| `Family` | `families` | familyNumber, centreId, notes, active |
| `FamilyMember` | `family_members` | familyId, firstName, lastName, relationship, email, phone, primary |
| `ChildFamilyRelationship` | `child_family_relationships` | childId, familyId, relationshipType, primaryGuardian |
| `EmergencyContact` | `emergency_contacts` | childId, name, relationship, phone, mobile, email, priority |
| `AuthorisedPickup` | `authorised_pickups` | childId, name, relationship, phone, mobile, email, photoIdType |

### Permission Codes

| Resource | Permissions |
|----------|------------|
| Children | `children:read`, `children:write`, `children:delete` |
| Families | `families:read`, `families:write` |

### RBAC Enforcement

| Role | children:read | children:write | children:delete | families:read | families:write |
|------|:---:|:---:|:---:|:---:|:---:|
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| ORG_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| CENTRE_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| EDUCATOR | ✅ | ❌ | ❌ | ✅ | ❌ |
| PARENT | ✅ | ❌ | ❌ | ✅ | ❌ |

## API Endpoints

### Children

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/children` | `children:read` | List children (paginated, searchable, filterable) |
| `GET` | `/api/v1/children/{id}` | `children:read` | Get child by ID |
| `POST` | `/api/v1/children` | `children:write` | Create child |
| `PATCH` | `/api/v1/children/{id}` | `children:write` | Update child |
| `DELETE` | `/api/v1/children/{id}` | `children:delete` | Soft delete child |
| `POST` | `/api/v1/children/{childId}/families` | `children:write` | Assign family to child |

**Query Parameters (GET /children):**
- `centreId` (Long) — Filter by centre
- `search` (String) — Search by name (case-insensitive LIKE)
- `enrolmentStatus` (String) — Filter by ENROLLED/WAITLISTED/INACTIVE/etc.
- `gender` (String) — Filter by gender
- `page`, `size` (int) — Pagination (default: page=0, size=20)

### Families

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/families` | `families:read` | List families (paginated) |
| `GET` | `/api/v1/families/{id}` | `families:read` | Get family by ID (includes members) |
| `POST` | `/api/v1/families` | `families:write` | Create family |
| `PATCH` | `/api/v1/families/{id}` | `families:write` | Update family |
| `GET` | `/api/v1/families/{familyId}/members` | `families:read` | List family members |
| `POST` | `/api/v1/families/{familyId}/members` | `families:write` | Add family member |
| `PATCH` | `/api/v1/families/{familyId}/members/{memberId}` | `families:write` | Update family member |

### Emergency Contacts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/children/{childId}/emergency-contacts` | `children:read` | List emergency contacts |
| `POST` | `/api/v1/children/{childId}/emergency-contacts` | `children:write` | Add emergency contact |
| `GET` | `/api/v1/emergency-contacts/{id}` | `children:read` | Get emergency contact by ID |
| `PATCH` | `/api/v1/emergency-contacts/{id}` | `children:write` | Update emergency contact |
| `DELETE` | `/api/v1/emergency-contacts/{id}` | `children:write` | Soft delete emergency contact |

### Authorised Pickups

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/children/{childId}/authorised-pickups` | `children:read` | List authorised pickups |
| `POST` | `/api/v1/children/{childId}/authorised-pickups` | `children:write` | Add authorised pickup |
| `GET` | `/api/v1/authorised-pickups/{id}` | `children:read` | Get authorised pickup by ID |
| `PATCH` | `/api/v1/authorised-pickups/{id}` | `children:write` | Update authorised pickup |
| `DELETE` | `/api/v1/authorised-pickups/{id}` | `children:write` | Soft delete authorised pickup |

## Tenancy Rules

- **Centre-scoped resources:** Children and families are scoped to a centre. When a user has a `centreId`, they can only access resources in that centre.
- **Organisation-scoped resources:** When a user has an `organisationId` but no `centreId`, they can access all resources within that organisation.
- **Platform admin:** Users with `organisationId=null` and `centreId=null` (SUPER_ADMIN at platform level) bypass all tenancy checks.
- **Cross-org validation:** Assigning a family to a child validates that both belong to the same organisation.

## Business Rules

1. **Family number uniqueness:** Family numbers are unique per organisation.
2. **Duplicate relationship prevention:** A child cannot be linked to the same family twice.
3. **Cross-org family assignment rejected:** Families can only be assigned to children in the same organisation.
4. **Centre validation:** All create operations validate the centre exists and belongs to the user's organisation.
5. **Soft deletes:** Children, families, members, emergency contacts, and authorised pickups use soft deletes (`deletedAt`).
6. **Children search:** Supports partial name matching via `Specification` API (case-insensitive LIKE).

## Audit Logging

All create, update, delete, and relationship assignment operations are logged to the `audit_logs` table via `AuditService`:

| Operation | Entity Type | Example Description |
|-----------|------------|-------------------|
| CREATE | CHILD | "Created child Alice Smith in centre Sunshine Centre" |
| UPDATE | CHILD | "Updated child Alice Smith" |
| DELETE | CHILD | "Deleted child Alice Smith" |
| CREATE | CHILD_FAMILY_RELATIONSHIP | "Linked child 100 to family 300" |
| CREATE | FAMILY | "Created family FAM-001 in centre Sunshine Centre" |
| UPDATE | FAMILY | "Updated family FAM-001" |

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | admin@penguinpeak.com | Admin12345678! |
| ORG_ADMIN | orgadmin@example.com | password |
| EDUCATOR | educator@example.com | password |
| PARENT | parent@example.com | password |

## Key Implementation Files

```
src/main/java/com/penguinpeak/childcare/child/
├── controller/
│   ├── ChildController.java
│   ├── FamilyController.java
│   ├── EmergencyContactController.java
│   ├── EmergencyContactDirectController.java
│   ├── AuthorisedPickupController.java
│   └── AuthorisedPickupDirectController.java
├── dto/
│   ├── CreateChildRequest.java
│   ├── UpdateChildRequest.java
│   ├── ChildResponse.java
│   ├── CreateFamilyRequest.java
│   ├── UpdateFamilyRequest.java
│   ├── FamilyResponse.java
│   ├── CreateFamilyMemberRequest.java
│   ├── UpdateFamilyMemberRequest.java
│   ├── FamilyMemberResponse.java
│   ├── CreateEmergencyContactRequest.java
│   ├── UpdateEmergencyContactRequest.java
│   ├── EmergencyContactResponse.java
│   ├── CreateAuthorisedPickupRequest.java
│   ├── UpdateAuthorisedPickupRequest.java
│   └── AuthorisedPickupResponse.java
├── entity/
│   ├── Child.java
│   ├── Family.java
│   ├── FamilyMember.java
│   ├── ChildFamilyRelationship.java
│   ├── EmergencyContact.java
│   └── AuthorisedPickup.java
├── mapper/
│   ├── ChildMapper.java
│   ├── FamilyMapper.java
│   ├── FamilyMemberMapper.java
│   ├── EmergencyContactMapper.java
│   └── AuthorisedPickupMapper.java
├── repository/
│   ├── ChildRepository.java
│   ├── FamilyRepository.java
│   ├── FamilyMemberRepository.java
│   ├── ChildFamilyRelationshipRepository.java
│   ├── EmergencyContactRepository.java
│   └── AuthorisedPickupRepository.java
└── service/
    ├── ChildService.java
    ├── FamilyService.java
    ├── EmergencyContactService.java
    └── AuthorisedPickupService.java
```

## Tests

| Test Class | Type | Tests |
|-----------|------|-------|
| ChildServiceTest | Unit | 14 |
| FamilyServiceTest | Unit | 10 |
| ChildControllerTest | WebMvcTest | 6 |
| FamilyControllerTest | WebMvcTest | 7 |
