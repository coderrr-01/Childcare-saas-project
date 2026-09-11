# API standards

All public HTTP endpoints use the URL base path `/api/v1`. Version 1 contracts are stable; a future incompatible contract uses `/api/v2`, never an unversioned path. Endpoints use plural nouns and standard HTTP methods, for example `GET /api/v1/children` and `POST /api/v1/children`. Command endpoints are reserved for genuine non-CRUD state changes.

## Successful responses

Every response with a body uses the same envelope. The payload is always in `data`.

```json
{
  "data": { "id": "uuid", "name": "Example" },
  "meta": { "requestId": "abc-123" }
}
```

Collections include zero-based pagination metadata.

```json
{
  "data": [{ "id": "uuid", "name": "Example" }],
  "meta": {
    "requestId": "abc-123",
    "pagination": {
      "page": 0, "size": 20, "totalElements": 100, "totalPages": 5,
      "hasNext": true, "hasPrevious": false
    }
  }
}
```

Use `ApiResponse.success(data)` for a resource and `ApiPageResponse.from(page)` for Spring Data pages. A successful deletion without a body returns `204 No Content`.

## Errors

Errors are RFC 9457 Problem Details with content type `application/problem+json`; they are never a successful envelope.

```json
{
  "type": "https://api.penguinpeak.com/problems/validation-error",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/children",
  "code": "VALIDATION_ERROR",
  "requestId": "abc-123",
  "errors": [{ "field": "firstName", "message": "First name is required" }]
}
```

Supported application codes are `VALIDATION_ERROR`, `RESOURCE_NOT_FOUND`, `BUSINESS_ERROR`, `CONFLICT`, `UNAUTHORIZED`, `FORBIDDEN`, `BAD_REQUEST`, `METHOD_NOT_ALLOWED`, `MEDIA_TYPE_NOT_SUPPORTED`, `RATE_LIMITED`, `INTERNAL_SERVER_ERROR`, and `SERVICE_UNAVAILABLE`.

Never expose stack traces, SQL/database details, class names, filesystem paths, or credentials in an error response.

## HTTP statuses

| Status | Use |
|---|---|
| 200 | Successful GET or update with a body |
| 201 | Resource created |
| 204 | Successful deletion without a body |
| 400 | Malformed input, validation, or invalid parameters |
| 401 / 403 | Missing/invalid authentication / insufficient permission |
| 404 / 409 | Missing resource / state or resource conflict |
| 422 | Genuine semantic or domain rule violation |
| 429 | Rate limited |
| 500 / 503 | Unexpected failure / temporary dependency or infrastructure failure |

## Request correlation

Clients may send `X-Request-ID`. Values matching a bounded safe identifier format are preserved; invalid or missing values are replaced with a generated UUID. The final value appears in the response header, successful response metadata, and Problem Details. It is placed in logging MDC for the request and cleaned when the request ends.

## Date and time

Use `Instant` for machine and audit timestamps, `LocalDate` for date-only values, and `LocalTime` for time-only values. Use `OffsetDateTime` only when the supplied offset is meaningful. Do not use `java.util.Date` or `java.sql.Timestamp` in domain models. JSON uses ISO-8601, for example `2026-09-09T06:30:00Z`.

## Future security and tenancy

Authentication and RBAC will populate `CurrentUser` and `TenantContext` with organisation and centre scope. Business modules must enforce those boundaries once authentication is introduced. The foundation performs no fake authentication and no database tenant filtering. `AuditContext` is an extension point for future persisted audit events.
