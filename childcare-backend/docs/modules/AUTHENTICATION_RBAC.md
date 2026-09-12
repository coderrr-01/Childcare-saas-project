# Module 2: Authentication, User Management & RBAC

## Overview

This module implements JWT-based authentication, user management, and role-based access control (RBAC) for the Childcare SaaS platform.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     HTTP Clients                        │
└──────────────────────────┬──────────────────────────────┘
                           │ Bearer Token
┌──────────────────────────▼──────────────────────────────┐
│                 Security Filter Chain                   │
│  JwtAuthenticationFilter → UsernamePasswordAuthFilter   │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    Controllers                          │
│  AuthController  UserController  RoleController         │
│  PermissionController                                   │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                     Services                            │
│  AuthService  UserService  CurrentUserService           │
│  AuditService                                               │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              Repository + JPA (Hibernate 7)             │
│  UserRepository  RoleRepository  UserSessionRepository   │
│  AuditLogRepository                                      │
└─────────────────────────────────────────────────────────┘
```

## Authentication Flow

### Login
1. Client sends `POST /api/v1/auth/login` with email + password
2. `AuthService.authenticate()` validates credentials using `BCryptPasswordEncoder`
3. `JwtService.createAccessToken()` generates JWT with claims: sub, userId, roles, permissions
4. `JwtService.createRefreshToken()` generates opaque refresh token, stored as SHA-256 hash in `user_sessions` table
5. Both tokens returned in `LoginResponse`

### Token Validation (per request)
1. `JwtAuthenticationFilter` extracts `Authorization: Bearer <token>` header
2. `JwtService.parseAccessToken()` validates signature and expiry, returns Claims
3. `CustomUserDetailsService.loadUserByUsername()` fetches current user state from DB
4. Sets `SecurityContextHolder` with `UsernamePasswordAuthenticationToken`

### Refresh
1. Client sends `POST /api/v1/auth/refresh` with refresh token
2. `AuthService.refresh()` finds matching active session by token hash
3. Invalidates old session, creates new token pair
4. Returns new access + refresh tokens

### Logout
1. Client sends `POST /api/v1/auth/logout` with Bearer token
2. `AuthService.logout()` revokes all active sessions for the user (`revokeAllSessions`)
3. Returns HTTP 204 No Content

## RBAC Model

### Roles
| Role | Description |
|------|-------------|
| SUPER_ADMIN | Platform administrator with full access |
| ORG_ADMIN | Organisation administrator |
| CENTRE_ADMIN | Centre director/administrator |
| EDUCATOR | Early childhood educator |
| PARENT | Parent or guardian |

### Permission System
Permissions follow the format `{resource}:{action}` (e.g., `children:read`, `users:write`).

| Resource | Actions |
|----------|---------|
| children | read, write, delete |
| families | read, write, delete |
| enrolments | read, write, delete |
| attendance | read, write |
| dailyCare | read, write |
| health | read, write |
| medication | read, write |
| incidents | read, write, delete |
| learning | read, write, delete |
| media | read, write, delete |
| messages | read, write |
| documents | read, write, delete |
| consent | read, write |
| billing | read, write |
| reports | read |
| settings | read, write |
| users | read, write, delete |
| centres | read, write |

### Permission Enforcement
- **Method-level:** `@PreAuthorize("hasAuthority('users:read')")` on controller methods
- **JWT claims:** Permissions embedded in access token for fast authorization
- **Database:** `role_permissions` table provides source of truth

### Role-Permission Matrix
| Role | Users | Children | Attendance | Messages | Roles | Settings |
|------|-------|----------|------------|----------|-------|----------|
| SUPER_ADMIN | R/W/D | R/W/D | R/W | R/W | R | R/W |
| ORG_ADMIN | R/W | R/W/D | R/W | R/W | R | R/W |
| CENTRE_ADMIN | R/W | R/W/D | R/W | R/W | R | R |
| EDUCATOR | R | R/W | R/W | R/W | - | - |
| PARENT | R | R | R | R/W | - | - |

## JWT Token Structure

### Access Token (HS512)
```json
{
  "sub": "user@email.com",
  "userId": 1,
  "roles": ["SUPER_ADMIN"],
  "permissions": ["users:read", "users:write", ...],
  "iat": 1726000000,
  "exp": 1726003600
}
```

### Refresh Token
- Opaque UUID stored in `user_sessions` table as SHA-256 hash
- Associated with user_id, centre_id, organisation_id
- Supports expiry and session revocation

## Security Configuration

| Setting | Value |
|---------|-------|
| CSRF | Disabled (stateless API) |
| Session Management | STATELESS |
| Password Encoder | BCryptPasswordEncoder |
| Password Policy | min=12, max=128 characters |
| JWT Algorithm | HS512 |
| Access Token Expiry | Configurable via `jwt.access-token-expiry-ms` |
| Refresh Token Expiry | Configurable via `jwt.refresh-token-expiry-ms` |

## API Endpoints

### Public (no auth required)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Authenticate and receive tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |

### Authenticated (valid token required)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/logout` | Revoke refresh token |
| GET | `/api/v1/auth/me` | Get current user profile |
| GET | `/api/v1/users` | List users (paginated) |
| POST | `/api/v1/users` | Create new user |
| GET | `/api/v1/users/{id}` | Get user by ID |
| PATCH | `/api/v1/users/{id}` | Update user |
| GET | `/api/v1/users/me` | Get own profile |
| PATCH | `/api/v1/users/me` | Update own profile |
| POST | `/api/v1/users/me/change-password` | Change password |
| GET | `/api/v1/roles` | List roles |
| GET | `/api/v1/permissions` | List permissions |

### Authority-Protected
| Endpoint | Required Authority |
|----------|-------------------|
| GET /api/v1/users | `users:read` |
| POST /api/v1/users | `users:write` |
| GET /api/v1/users/{id} | `users:read` |
| PATCH /api/v1/users/{id} | `users:write` |
| GET /api/v1/roles | `roles:read` |
| GET /api/v1/permissions | `permissions:read` |

## Error Handling

All errors use RFC 9457 (Problem Details for HTTP APIs):

```json
{
  "type": "about:blank",
  "title": "Authentication Failed",
  "status": 401,
  "detail": "Invalid email or password",
  "instance": "/api/v1/auth/login"
}
```

| Status | Handler | Description |
|--------|---------|-------------|
| 401 | AuthenticationEntryPointImpl | Missing or invalid token |
| 403 | AccessDeniedHandlerImpl | Insufficient permissions |
| 422 | GlobalExceptionHandler | Validation errors |

## Audit Trail

All authentication events are logged to `audit_logs` table:
- LOGIN, LOGOUT, TOKEN_REFRESH, LOGIN_FAILED
- Includes user_id, IP address, user agent, action type
- Uses `@Transactional(propagation = REQUIRES_NEW)` for isolation

## Database Tables (Module 2)

| Table | Purpose |
|-------|---------|
| `users` | User accounts with credentials |
| `roles` | Role definitions (5 standard roles) |
| `permissions` | Permission codes (41 permissions) |
| `role_permissions` | Role ↔ Permission mapping |
| `user_roles` | User ↔ Role mapping |
| `user_sessions` | Refresh tokens (hashed) |
| `audit_logs` | Authentication event log |

## Configuration

```properties
# JWT
jwt.access-token-expiry-ms=3600000       # 1 hour
jwt.refresh-token-expiry-ms=604800000    # 7 days
jwt.secret=your-256-bit-secret

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/childcare_dev
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
```

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | admin@penguinpeak.com | Admin12345678! |
| ORG_ADMIN | orgadmin@example.com | password |
| CENTRE_ADMIN | director@example.com | password |
| EDUCATOR | educator@example.com | password |
| PARENT | parent@example.com | password |
