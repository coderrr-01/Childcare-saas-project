# Postman Setup Guide - Module 2: Authentication & RBAC

## Quick Start

1. **Import the Collection**
   - Open Postman → Click **Import** → **Files** → Select `ChildcareSaaS-Module2-Auth.postman_collection.json`

2. **Import the Environment**
   - Click **Import** → **Files** → Select `ChildcareSaaS-Development-Local.postman_environment.json`

3. **Select the Environment**
   - Top-right dropdown → Select **Childcare SaaS - Development (Local)**

4. **Start the Application**
   ```bash
   cd childcare-backend
   ./mvnw spring-boot:run
   ```

## Authentication Workflow

1. **Login** → `Authentication > Login`
   - Uses `admin@penguinpeak.com` / `Admin12345678!` by default
   - Automatically saves `accessToken` and `refreshToken` to environment variables
   - All subsequent requests use the saved Bearer token

2. **Refresh Token** → `Authentication > Refresh Token`
   - Uses the saved `refreshToken` to get a new token pair
   - Automatically updates both tokens

3. **Logout** → `Authentication > Logout`
   - Revokes the refresh token (HTTP 204)

## Available Endpoints

| Folder | Request | Method | Path | Auth Required |
|--------|---------|--------|------|---------------|
| Authentication | Login | POST | `/api/v1/auth/login` | No |
| Authentication | Refresh Token | POST | `/api/v1/auth/refresh` | No |
| Authentication | Logout | POST | `/api/v1/auth/logout` | Yes |
| Authentication | Get Current User | GET | `/api/v1/auth/me` | Yes |
| Users | List Users | GET | `/api/v1/users?page=0&size=10` | Yes |
| Users | Get User by ID | GET | `/api/v1/users/{id}` | Yes |
| Users | Create User | POST | `/api/v1/users` | Yes |
| Users | Update User | PATCH | `/api/v1/users/{id}` | Yes |
| Users | Get My Profile | GET | `/api/v1/users/me` | Yes |
| Users | Update My Profile | PATCH | `/api/v1/users/me` | Yes |
| Users | Change My Password | POST | `/api/v1/users/me/change-password` | Yes |
| Roles & Permissions | List Roles | GET | `/api/v1/roles` | Yes |
| Roles & Permissions | List Permissions | GET | `/api/v1/permissions` | Yes |

## Test Accounts

| Role | Email | Password | Users:read | Users:write | Roles:read | Permissions:read |
|------|-------|----------|------------|-------------|------------|------------------|
| SUPER_ADMIN | `admin@penguinpeak.com` | `Admin12345678!` | ✓ | ✓ | ✓ | ✓ |
| ORG_ADMIN | `orgadmin@example.com` | `password` | ✓ | ✓ | ✓ | ✓ |
| CENTRE_ADMIN | `director@example.com` | `password` | ✓ | ✓ | ✓ | ✓ |
| EDUCATOR | `educator@example.com` | `password` | ✓ | ✓ | ✗ | ✗ |
| PARENT | `parent@example.com` | `password` | ✓ | ✗ | ✗ | ✗ |

## RBAC Test Scenarios

### Scenario 1: Educator Forbidden Access
1. Login as **EDUCATOR** (`educator@example.com` / `password`)
2. Copy the access token → Set as `educatorToken` environment variable
3. Run **Educator - Forbidden (users:write)** → Expects 403
4. Run **Educator - Forbidden (roles:read)** → Expects 403

### Scenario 2: Token Revocation
1. Login as SUPER_ADMIN
2. Copy the access token
3. Run **Logout** (204)
4. Try to access any protected endpoint with the old token → Expects 401
5. Use **Refresh Token** to obtain a new token pair

### Scenario 3: Password Policy
1. Login as any user
2. Run **Change My Password** with current + new (min 12 chars) password
3. Login again with the new password → Should succeed

## Error Responses

All errors follow RFC 9457 format:

```json
{
  "type": "about:blank",
  "title": "Authentication Failed",
  "status": 401,
  "detail": "Invalid email or password",
  "instance": "/api/v1/auth/login"
}
```

| Status | Meaning |
|--------|---------|
| 401 | Unauthorized - invalid/missing token |
| 403 | Forbidden - insufficient permissions |
| 404 | Not Found |
| 422 | Validation Error |

## Environment Variables

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `baseUrl` | API base URL | Manual |
| `accessToken` | JWT access token | Auto (from Login/Refresh) |
| `refreshToken` | JWT refresh token | Auto (from Login/Refresh) |
| `educatorToken` | Token for RBAC testing | Manual |
