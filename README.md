# Enterprise Backend API

Production-ready Enterprise-grade Backend API built with NestJS, Prisma, PostgreSQL, and comprehensive observability.

## Features

### Core Functionality
- **Authentication & Authorization**
  - JWT with refresh tokens
  - Two-Factor Authentication (2FA)
  - OAuth integration (Google)
  - Password reset & email verification
  - Session management

- **RBAC/ABAC System**
  - Role-based access control
  - Attribute-based access control
  - Dynamic permission management
  - Granular resource-level permissions

- **Notifications System**
  - Email notifications (Nodemailer)
  - SMS notifications (Twilio)
  - Push notifications
  - Webhook support
  - Queue-based processing with Bull

- **File Management**
  - Local storage support
  - AWS S3 integration
  - Image processing with Sharp
  - File type validation
  - Size limits

### Security (OWASP Top 10)
- Helmet for security headers
- CSRF protection
- Rate limiting
- XSS protection
- SQL Injection prevention (Prisma ORM)
- Input validation with class-validator
- Password hashing with bcrypt
- Secure session management

### Observability
- **Logging**: Winston with structured logging
- **Metrics**: Prometheus integration
- **Error Tracking**: Sentry integration
- **Distributed Tracing**: OpenTelemetry
- **Monitoring Dashboards**: Grafana
- **Health Checks**: Terminus

### DevOps
- Docker & Docker Compose
- CI/CD with GitHub Actions
- Security scanning (Snyk, Trivy)
- Automated testing
- Code quality checks (ESLint, Prettier)

## Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16
- **ORM**: Prisma 5
- **Cache/Queue**: Redis & Bull
- **Authentication**: Passport.js, JWT
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Logging**: Winston
- **Metrics**: Prometheus
- **Tracing**: OpenTelemetry
- **Error Tracking**: Sentry

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+ (or use Docker)
- Redis (or use Docker)

## Getting Started

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd backend-enterprice-proyecto

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Make sure to change all secrets and credentials
```

### 3. Start Infrastructure with Docker

```bash
# Start PostgreSQL, Redis, Prometheus, Grafana, Jaeger
npm run docker:up

# View logs
npm run docker:logs

# Stop containers
npm run docker:down
```

**Services Available:**
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (admin/admin)
- Jaeger UI: `http://localhost:16686`
- pgAdmin: `http://localhost:5050` (admin@admin.com/admin)

### 4. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed

# Open Prisma Studio to view data
npm run prisma:studio
```

### 5. Run the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at:
- **API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health
- **Metrics**: http://localhost:3000/metrics

## Project Structure

```
src/
├── common/                 # Shared modules
│   ├── prisma/            # Database service
│   ├── logger/            # Winston logger
│   ├── sentry/            # Error tracking
│   └── metrics/           # Prometheus metrics
├── config/                # Configuration
│   └── configuration.ts   # App configuration
├── modules/               # Feature modules
│   ├── auth/             # Authentication & authorization
│   ├── users/            # User management
│   ├── roles/            # Role & permission management
│   ├── notifications/    # Notification system
│   ├── files/            # File upload & storage
│   └── health/           # Health checks
├── app.module.ts          # Root module
└── main.ts               # Application entry point

prisma/
├── schema.prisma         # Database schema
├── migrations/           # Database migrations
└── seed.ts              # Database seeding

docker-compose.yml        # Infrastructure services
Dockerfile               # Production Docker image
.github/workflows/       # CI/CD pipelines
```

## API Documentation

Once the application is running, access the interactive Swagger documentation at:

**http://localhost:3000/api/docs**

### Key Endpoints

#### Authentication
```
POST /api/v1/auth/register          # Register new user
POST /api/v1/auth/login             # Login with email/password
POST /api/v1/auth/refresh           # Refresh access token
POST /api/v1/auth/logout            # Logout
POST /api/v1/auth/forgot-password   # Request password reset
POST /api/v1/auth/reset-password    # Reset password
POST /api/v1/auth/verify-email      # Verify email
GET  /api/v1/auth/google            # Google OAuth login
POST /api/v1/auth/2fa/enable        # Enable 2FA
POST /api/v1/auth/2fa/verify        # Verify 2FA token
```

#### Users
```
GET    /api/v1/users                # List users (admin)
GET    /api/v1/users/:id            # Get user by ID
PATCH  /api/v1/users/:id            # Update user
DELETE /api/v1/users/:id            # Delete user
GET    /api/v1/users/me             # Get current user
PATCH  /api/v1/users/me             # Update current user
```

#### Roles & Permissions
```
GET    /api/v1/roles                # List roles
POST   /api/v1/roles                # Create role
PATCH  /api/v1/roles/:id            # Update role
DELETE /api/v1/roles/:id            # Delete role
POST   /api/v1/roles/:id/permissions  # Assign permissions
```

#### Notifications
```
POST /api/v1/notifications/email    # Send email
POST /api/v1/notifications/sms      # Send SMS
GET  /api/v1/notifications          # List notifications
```

#### Files
```
POST /api/v1/files/upload           # Upload file
GET  /api/v1/files/:id              # Get file
DELETE /api/v1/files/:id            # Delete file
```

## Development

### Running Tests

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run build
```

### Database Management

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ deletes all data)
npm run db:reset

# Push schema without migration
npm run db:push

# Open Prisma Studio
npm run prisma:studio
```

## Production Deployment

### Docker Build

```bash
# Build production image
docker build -t enterprise-backend-api .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  enterprise-backend-api
```

### Environment Variables

Critical environment variables for production:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
SENTRY_DSN=<your-sentry-dsn>
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
REDIS_HOST=<redis-host>
```

## Monitoring & Observability

### Prometheus Metrics

Access metrics at: `http://localhost:3000/metrics`

Key metrics:
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration
- `db_queries_total` - Database queries
- `auth_attempts_total` - Authentication attempts
- `notifications_sent_total` - Notifications sent

### Grafana Dashboards

1. Open Grafana: http://localhost:3001
2. Login with admin/admin
3. Add Prometheus data source (http://prometheus:9090)
4. Import dashboards or create custom ones

### Sentry Error Tracking

1. Create Sentry project
2. Add SENTRY_DSN to .env
3. Errors will be automatically tracked

### Distributed Tracing

1. Open Jaeger UI: http://localhost:16686
2. Select service: `enterprise-backend-api`
3. View traces and performance

## Security Best Practices

1. **Always change default secrets** in production
2. **Enable 2FA** for admin accounts
3. **Use HTTPS** in production
4. **Keep dependencies updated**: `npm audit`
5. **Review security scan results** in CI/CD
6. **Implement rate limiting** for public endpoints
7. **Validate all user input**
8. **Use parameterized queries** (Prisma handles this)
9. **Implement proper CORS** configuration
10. **Regular security audits**

## CI/CD Pipeline

The GitHub Actions workflow includes:

1. **Security Scanning**
   - Snyk vulnerability scanning
   - Trivy container scanning
   - Dependency check

2. **Code Quality**
   - ESLint linting
   - Prettier formatting check
   - TypeScript compilation

3. **Testing**
   - Unit tests with coverage
   - E2E tests
   - Coverage upload to Codecov

4. **Build & Deploy**
   - Docker image build
   - Push to Docker Hub
   - Automated deployment

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View PostgreSQL logs
docker logs enterprise-postgres

# Test connection
psql postgresql://postgres:postgres@localhost:5432/enterprise_db
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker ps | grep redis

# Test Redis connection
redis-cli ping
```

### Migration Issues

```bash
# Reset migrations (⚠️ deletes data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review Swagger API docs

## Roadmap

- [ ] GraphQL API support
- [ ] Microservices architecture
- [ ] Kubernetes deployment configs
- [ ] Multi-tenancy support
- [ ] Advanced caching strategies
- [ ] Real-time features with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Mobile app push notifications
- [ ] Internationalization (i18n)
- [ ] Rate limiting per user
