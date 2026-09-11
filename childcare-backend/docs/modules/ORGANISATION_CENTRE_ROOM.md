# Organisation, centre, and room module

This module owns the initial tenant hierarchy: an organisation has centres and a centre has rooms. It follows the feature package layout `organisation/{controller,service,repository,entity,dto,mapper,exception}`. Controllers only adapt HTTP; services own transactions and relationship checks.

## Endpoints

| Method | Path | Result |
|---|---|---|
| POST | `/api/v1/organisations` | Create an organisation (201) |
| GET | `/api/v1/organisations` | Paginated active organisations |
| GET / PATCH | `/api/v1/organisations/{id}` | Read or partially update an organisation |
| POST | `/api/v1/organisations/{organisationId}/centres` | Create a centre (201) |
| GET | `/api/v1/organisations/{organisationId}/centres` | Paginated centres for an organisation |
| GET / PATCH | `/api/v1/centres/{id}` | Read or partially update a centre |
| POST | `/api/v1/centres/{centreId}/rooms` | Create a room (201) |
| GET | `/api/v1/centres/{centreId}/rooms` | Paginated rooms for a centre |
| GET / PATCH | `/api/v1/rooms/{id}` | Read or partially update a room |

All bodies use the shared successful-response envelope and all failures use RFC 9457 Problem Details. List endpoints accept Spring Data `page`, `size`, and `sort` parameters. PATCH updates only supplied non-null fields; clearing an optional field is intentionally not yet part of this API contract.

## Requests

```json
POST /api/v1/organisations
{ "name": "Example Childcare Group", "addressCountry": "AU", "timezone": "Australia/Sydney" }
```

```json
POST /api/v1/organisations/1/centres
{ "name": "CBD Centre", "capacity": 80, "openingTime": "07:00:00", "closingTime": "18:00:00", "operatingDays": [1,2,3,4,5] }
```

```json
POST /api/v1/centres/2/rooms
{ "name": "Toddlers", "capacity": 16, "minAgeMonths": 18, "maxAgeMonths": 36 }
```

Organisation names are required and limited to 200 characters; centre names to 200; room names to 100. Centre and room capacity must be non-negative. Emails, when supplied, must be valid. Operating days are integers from 1 through 7.

## Rules and tenancy

- Centres require an existing, non-deleted organisation.
- Rooms require an existing, non-deleted centre and receive their organisation from that centre.
- Opening time must precede closing time when both are supplied.
- A room's minimum age cannot exceed its maximum age when both are supplied.
- Organisation and centre reads exclude rows with `deleted_at`; no delete endpoint is exposed.
- Centre `status` maps exactly to the database values `ACTIVE`, `INACTIVE`, and `PENDING`; organisations and rooms expose their existing active flags.

The database has no name-uniqueness constraints, so this module deliberately does not claim duplicate-name conflict behaviour. Tenant enforcement is not faked: future RBAC can apply `TenantContext` at organisation and centre boundaries. `lead_educator_id` is deliberately not managed here because educator identity belongs to a future module.

## Example response and error

```json
{ "data": { "id": 1, "name": "Example Childcare Group", "active": true }, "meta": { "requestId": "abc-123" } }
```

```json
{ "type": "https://api.penguinpeak.com/problems/resource-not-found", "title": "Resource not found", "status": 404, "code": "RESOURCE_NOT_FOUND", "requestId": "abc-123" }
```
