# Childcare SaaS - PostgreSQL Database

## 1. PostgreSQL Installation

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer (PostgreSQL 15+ recommended)
3. Set the superuser password during installation
4. Default port: 5432

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql-15
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Docker (Development)
```bash
docker run -d \
  --name childcare-postgres \
  -e POSTGRES_DB=childcare_saas \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -v childcare_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

## 2. Creating the Database

### Option A: Using the setup script
```bash
psql -U postgres -f scripts/create_database.sql
```

### Option B: Manual creation
```sql
CREATE DATABASE childcare_saas
    WITH
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_AU.UTF-8'
    LC_CTYPE = 'en_AU.UTF-8'
    TEMPLATE = template0;
```

## 3. Creating the Application User

```sql
-- Connect to the database
\c childcare_saas

-- Create application user
CREATE USER childcare_app WITH PASSWORD 'change_me_in_production';

-- Grant permissions
GRANT USAGE ON SCHEMA public TO childcare_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO childcare_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO childcare_app;

-- For future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO childcare_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO childcare_app;
```

## 4. Running Migrations

### Using Flyway (Recommended for Spring Boot)

Flyway is configured in the Spring Boot application. Migrations run automatically on startup.

### Manual execution
```bash
# Run migrations in order
psql -U childcare_app -d childcare_saas -f migrations/V001__create_extensions.sql
psql -U childcare_app -d childcare_saas -f migrations/V002__create_identity_tables.sql
# ... continue for all migrations

# Or run all at once
for f in migrations/V*.sql; do
    psql -U childcare_app -d childcare_saas -f "$f"
done
```

### Flyway Command Line
```bash
flyway -url=jdbc:postgresql://localhost:5432/childcare_saas \
       -user=childcare_app \
       -password=change_me_in_production \
       migrate
```

## 5. Running Seed Data

```bash
# Development only!
psql -U childcare_app -d childcare_saas -f seeds/V100__seed_development_data.sql
```

## 6. Connecting Using pgAdmin

1. Download pgAdmin from https://www.pgadmin.org/
2. Open pgAdmin
3. Right-click "Servers" → "Register" → "Server"
4. General tab: Name = "Childcare SaaS"
5. Connection tab:
   - Host: localhost
   - Port: 5432
   - Database: childcare_saas
   - Username: childcare_app
   - Password: (your password)
6. Click "Save"

## 7. Connecting from Spring Boot

### application.yml
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/childcare_saas
    username: childcare_app
    password: ${DB_PASSWORD:change_me_in_production}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      max-lifetime: 1200000

  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: validate
    show-sql: false

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

### pom.xml dependency
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

## 8. Database Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Tables | plural, snake_case | `children`, `attendance_records` |
| Columns | snake_case | `date_of_birth`, `created_at` |
| Primary keys | `id` | `id BIGINT GENERATED ALWAYS AS IDENTITY` |
| Foreign keys | `{table}_id` | `child_id`, `centre_id` |
| Indexes | `idx_{table}_{columns}` | `idx_children_centre` |
| Unique constraints | `uniq_{table}_{columns}` | `uniq_children_family` |
| Check constraints | `chk_{table}_{rule}` | `chk_enrolment_status` |
| Timestamps | `created_at`, `updated_at`, `deleted_at` | TIMESTAMPTZ |
| Monetary | `NUMERIC(12,2)` | Never floating point |

## 9. Multi-Tenancy Model

### Architecture
Shared-database, shared-schema with tenant isolation via `organisation_id` and `centre_id`.

### Isolation Strategy
Every business table includes:
- `organisation_id` — Top-level tenant isolation
- `centre_id` — Centre-level isolation (derived or explicit)

### Query Isolation
Spring Boot repositories apply tenant filters automatically:
```java
@Entity
public class Child {
    @Column(name = "organisation_id", nullable = false)
    private Long organisationId;

    @Column(name = "centre_id", nullable = false)
    private Long centreId;
}
```

### Row-Level Security (Optional)
For additional protection, PostgreSQL RLS policies can be applied:
```sql
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY organisation_isolation ON children
    USING (organisation_id = current_setting('app.current_organisation_id')::bigint);
```

## 10. Backup Basics

### Automated backup (Linux cron)
```bash
# Daily backup at 2am
0 2 * * * pg_dump -U postgres childcare_saas | gzip > /backups/childcare_saas_$(date +\%Y\%m\%d).sql.gz

# Retain 30 days
find /backups -name "childcare_saas_*.sql.gz" -mtime +30 -delete
```

### Manual backup
```bash
pg_dump -U postgres -Fc childcare_saas > childcare_saas.dump
```

### Restore
```bash
pg_restore -U postgres -d childcare_saas childcare_saas.dump
```

### Docker volume backup
```bash
docker run --rm -v childcare_data:/data -v $(pwd)/backups:/backup postgres:15-alpine \
    tar czf /backup/childcare_data_$(date +%Y%m%d).tar.gz -C /data .
```

## 11. Development vs Production Configuration

| Setting | Development | Production |
|---------|-------------|------------|
| Database host | localhost | Managed RDS/Cloud SQL |
| Password | Simple | Strong, rotated |
| SSL | Optional | Required |
| Connection pool | Small (10) | Large (50+) |
| Logging | SQL visible | SQL hidden |
| Seed data | Yes | Never |
| Backups | Manual | Automated, daily |
| Migrations | Auto on startup | Separate CI/CD step |
| Read replicas | No | Yes (for reports) |

## 12. Table Count Summary

| Domain | Tables |
|--------|--------|
| Identity & Access | 10 |
| Organisation & Centre | 5 |
| Child & Family | 7 |
| Enrolment & Waitlist | 3 |
| Attendance | 2 |
| Daily Care | 6 |
| Health | 5 |
| Medication | 3 |
| Incidents | 4 |
| Learning Stories | 3 |
| Media | 2 |
| Messaging | 3 |
| Notifications | 2 |
| Documents | 3 |
| Consent | 3 |
| Billing | 4 |
| Audit & Security | 1 |
| **Total** | **66 tables** |
