# 🚀 Deployment Guide

Guía completa para desplegar tu Enterprise Backend API en producción.

## 🎯 Opciones de Deployment

1. Docker Standalone
2. Docker Swarm
3. Kubernetes
4. Cloud Platforms (AWS, GCP, Azure)
5. Platform as a Service (Heroku, Railway, Render)

---

## 1. Docker Standalone

### Preparación

```bash
# Build production image
docker build -t enterprise-backend-api:latest .

# Tag for registry
docker tag enterprise-backend-api:latest your-registry/enterprise-backend-api:latest

# Push to registry
docker push your-registry/enterprise-backend-api:latest
```

### Deployment

```bash
# Pull image on production server
docker pull your-registry/enterprise-backend-api:latest

# Run container
docker run -d \
  --name enterprise-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://user:pass@db-host:5432/dbname" \
  -e JWT_SECRET="your-production-secret" \
  -e JWT_REFRESH_SECRET="your-refresh-secret" \
  -e REDIS_HOST="redis-host" \
  -e SENTRY_DSN="your-sentry-dsn" \
  --restart unless-stopped \
  your-registry/enterprise-backend-api:latest
```

---

## 2. Docker Compose Production

### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  api:
    image: your-registry/enterprise-backend-api:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/enterprise_db
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      REDIS_HOST: redis
      SENTRY_DSN: ${SENTRY_DSN}
    depends_on:
      - postgres
      - redis
    networks:
      - backend

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: enterprise_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backend

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - backend

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    networks:
      - backend

networks:
  backend:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### Deployment

```bash
# Set environment variables
export DB_PASSWORD="strong-password"
export JWT_SECRET="strong-jwt-secret"
export JWT_REFRESH_SECRET="strong-refresh-secret"
export SENTRY_DSN="your-sentry-dsn"

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

## 3. Kubernetes Deployment

### k8s/namespace.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: enterprise-api
```

### k8s/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: enterprise-api
  namespace: enterprise-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: enterprise-api
  template:
    metadata:
      labels:
        app: enterprise-api
    spec:
      containers:
      - name: api
        image: your-registry/enterprise-backend-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: jwt-secret
        - name: REDIS_HOST
          value: "redis-service"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### k8s/service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: enterprise-api-service
  namespace: enterprise-api
spec:
  selector:
    app: enterprise-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### k8s/secrets.yaml

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
  namespace: enterprise-api
type: Opaque
stringData:
  database-url: "postgresql://user:pass@postgres:5432/db"
  jwt-secret: "your-jwt-secret"
  jwt-refresh-secret: "your-refresh-secret"
```

### Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl apply -f k8s/secrets.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Check status
kubectl get pods -n enterprise-api
kubectl get services -n enterprise-api
```

---

## 4. AWS Deployment (ECS)

### Prerequisites
- AWS Account
- ECR Repository
- RDS PostgreSQL Database
- ElastiCache Redis

### Build & Push to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t enterprise-backend-api .
docker tag enterprise-backend-api:latest your-account.dkr.ecr.us-east-1.amazonaws.com/enterprise-backend-api:latest

# Push
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/enterprise-backend-api:latest
```

### ECS Task Definition

```json
{
  "family": "enterprise-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "enterprise-api",
      "image": "your-account.dkr.ecr.us-east-1.amazonaws.com/enterprise-backend-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "3000" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:db-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/enterprise-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/v1/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

---

## 5. Platform as a Service (Railway, Render, Heroku)

### Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Add services:
- PostgreSQL: `railway add`
- Redis: `railway add`

4. Set environment variables in Railway dashboard

### Render

1. Create `render.yaml`:

```yaml
services:
  - type: web
    name: enterprise-api
    env: node
    buildCommand: npm install && npm run build && npx prisma generate
    startCommand: npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: enterprise-db
          property: connectionString
    healthCheckPath: /api/v1/health

databases:
  - name: enterprise-db
    databaseName: enterprise_db
    user: postgres
```

2. Push to GitHub and connect in Render dashboard

---

## 🔒 Production Checklist

### Environment Variables
- [ ] Change all secrets from defaults
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Configure DATABASE_URL with production credentials
- [ ] Set SENTRY_DSN for error tracking
- [ ] Configure AWS credentials for S3
- [ ] Set up email service credentials
- [ ] Configure Redis connection

### Database
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Enable connection pooling
- [ ] Configure backups
- [ ] Set up read replicas (optional)

### Security
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Review rate limits
- [ ] Enable CSRF protection
- [ ] Set secure cookie settings
- [ ] Configure Helmet properly
- [ ] Review and update security headers

### Monitoring
- [ ] Configure Sentry error tracking
- [ ] Set up Prometheus metrics scraping
- [ ] Configure Grafana dashboards
- [ ] Set up log aggregation (ELK, Loki)
- [ ] Configure alerts
- [ ] Set up uptime monitoring

### Performance
- [ ] Enable response compression
- [ ] Configure Redis caching
- [ ] Optimize database queries
- [ ] Set up CDN for static assets
- [ ] Configure auto-scaling

### CI/CD
- [ ] Set up GitHub Actions secrets
- [ ] Configure deployment triggers
- [ ] Enable automated tests
- [ ] Set up security scanning
- [ ] Configure blue-green deployment

---

## 🔧 Post-Deployment

### Health Checks

```bash
# Check API health
curl https://your-domain.com/api/v1/health

# Check metrics
curl https://your-domain.com/metrics
```

### Monitoring

```bash
# View logs
kubectl logs -f deployment/enterprise-api -n enterprise-api

# Check pod status
kubectl get pods -n enterprise-api

# View metrics
kubectl top pods -n enterprise-api
```

### Database Migrations

```bash
# Connect to production
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

---

## 🚨 Troubleshooting

### Application won't start
```bash
# Check logs
docker logs enterprise-api

# Verify environment variables
docker exec enterprise-api env | grep DATABASE_URL
```

### Database connection failed
```bash
# Test database connection
psql "postgresql://user:pass@host:5432/db"

# Check network connectivity
docker exec enterprise-api nc -zv postgres-host 5432
```

### High memory usage
```bash
# Check container stats
docker stats enterprise-api

# Increase memory limits in docker-compose or k8s
```

---

## 📊 Performance Optimization

### Database
- Enable connection pooling (Prisma already does this)
- Add indexes for frequently queried fields
- Use database replicas for read operations
- Implement query caching with Redis

### Caching
- Cache frequently accessed data in Redis
- Implement HTTP caching headers
- Use CDN for static assets
- Cache Prisma queries

### Scaling
- Horizontal scaling with load balancer
- Auto-scaling based on CPU/memory
- Database read replicas
- Queue-based processing for heavy tasks

---

## 🔐 Security Hardening

### SSL/TLS
```bash
# Get Let's Encrypt certificate
certbot certonly --standalone -d your-domain.com
```

### Firewall
```bash
# Only allow necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 5432/tcp  # Database should not be public
ufw enable
```

### Regular Updates
```bash
# Update dependencies
npm audit fix

# Update Docker image
docker pull postgres:16-alpine
docker pull redis:7-alpine
```

---

## 📞 Support

Para más información, consulta:
- README.md
- QUICK_START.md
- PROJECT_SUMMARY.md
- Documentación oficial de cada plataforma

¡Buena suerte con tu deployment! 🚀
