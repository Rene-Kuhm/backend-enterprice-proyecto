# Quick Start Guide

Este es un proyecto backend enterprise completo creado con NestJS, Prisma, PostgreSQL y observabilidad completa.

## 🚀 Inicio Rápido (5 minutos)

### Paso 1: Instalar Dependencias

```bash
npm install
```

### Paso 2: Iniciar Servicios con Docker

```bash
npm run docker:up
```

Esto iniciará:
- ✅ PostgreSQL en `localhost:5432`
- ✅ Redis en `localhost:6379`
- ✅ Prometheus en `localhost:9090`
- ✅ Grafana en `localhost:3001` (admin/admin)
- ✅ Jaeger en `localhost:16686`
- ✅ pgAdmin en `localhost:5050` (admin@admin.com/admin)

### Paso 3: Configurar Base de Datos

```bash
# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Poblar base de datos con datos de prueba
npm run prisma:seed
```

**Usuarios creados:**
- 🔑 Admin: `admin@example.com` / `Admin123!`
- 👤 User: `user@example.com` / `User123!`

### Paso 4: Iniciar Aplicación

```bash
npm run start:dev
```

## 🎯 Endpoints Disponibles

### API Principal
- **API Base**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health
- **Metrics**: http://localhost:3000/metrics

### Herramientas de Observabilidad
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger UI**: http://localhost:16686
- **pgAdmin**: http://localhost:5050 (admin@admin.com/admin)

## 🧪 Probar la API

### 1. Registrar un Usuario

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "username": "testuser"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

Respuesta:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    ...
  }
}
```

### 3. Usar el Token

```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📚 Explorar Swagger

Abre http://localhost:3000/api/docs para ver toda la documentación interactiva de la API.

Puedes:
- ✅ Ver todos los endpoints disponibles
- ✅ Probar los endpoints directamente desde el navegador
- ✅ Ver los modelos de datos
- ✅ Autenticarte usando el botón "Authorize"

## 🔧 Comandos Útiles

### Desarrollo
```bash
npm run start:dev          # Modo desarrollo con hot reload
npm run start:debug        # Modo debug
npm run build              # Compilar para producción
npm run start:prod         # Ejecutar en producción
```

### Base de Datos
```bash
npm run prisma:studio      # Abrir Prisma Studio (GUI para DB)
npm run prisma:migrate     # Crear nueva migración
npm run db:reset           # Resetear base de datos
npm run prisma:seed        # Poblar con datos de prueba
```

### Docker
```bash
npm run docker:up          # Iniciar servicios
npm run docker:down        # Detener servicios
npm run docker:logs        # Ver logs
```

### Testing
```bash
npm run test               # Tests unitarios
npm run test:cov           # Tests con coverage
npm run test:e2e           # Tests E2E
```

### Code Quality
```bash
npm run lint               # Linter
npm run format             # Formatear código
```

## 📊 Monitoreo

### Prometheus Metrics
Visita http://localhost:3000/metrics para ver todas las métricas:
- Requests HTTP
- Database queries
- Authentication attempts
- Business metrics

### Grafana Dashboards
1. Abre http://localhost:3001
2. Login: admin/admin
3. Add Prometheus data source: http://prometheus:9090
4. Crea dashboards personalizados o importa existentes

### Jaeger Tracing
1. Abre http://localhost:16686
2. Selecciona service: `enterprise-backend-api`
3. Explora traces distribuidos

## 🛠 Estructura del Proyecto

```
src/
├── common/                 # Módulos compartidos
│   ├── prisma/            # Servicio de base de datos
│   ├── logger/            # Winston logger
│   ├── sentry/            # Error tracking
│   └── metrics/           # Prometheus metrics
├── config/                # Configuración
├── modules/               # Módulos de funcionalidades
│   ├── auth/             # Autenticación (JWT, OAuth, 2FA)
│   ├── users/            # Gestión de usuarios
│   ├── roles/            # Roles y permisos (RBAC)
│   ├── notifications/    # Notificaciones (Email, SMS)
│   ├── files/            # Upload de archivos
│   └── health/           # Health checks
└── main.ts               # Entry point
```

## 🔐 Seguridad

Este proyecto implementa:
- ✅ OWASP Top 10 protections
- ✅ Helmet para headers de seguridad
- ✅ Rate limiting
- ✅ CSRF protection
- ✅ XSS protection
- ✅ Input validation
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ 2FA support
- ✅ OAuth (Google)

## 🚨 Problemas Comunes

### Database connection failed
```bash
# Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# Ver logs
docker logs enterprise-postgres
```

### Port already in use
```bash
# Cambiar el puerto en .env
PORT=3001
```

### Redis connection failed
```bash
# Verificar que Redis está corriendo
docker ps | grep redis
```

## 📖 Siguiente Pasos

1. ✅ Lee el README.md completo para más detalles
2. ✅ Explora la documentación Swagger
3. ✅ Revisa los modelos en prisma/schema.prisma
4. ✅ Personaliza las configuraciones en .env
5. ✅ Implementa tus propias funcionalidades
6. ✅ Configura integraciones (S3, Twilio, etc.)
7. ✅ Configura Sentry para error tracking
8. ✅ Deploy a producción

## 🆘 Soporte

- 📚 Documentación completa: README.md
- 🔍 API Docs: http://localhost:3000/api/docs
- 🐛 Reportar issues en el repositorio

## 🎉 ¡Listo!

Tu proyecto backend enterprise está configurado y listo para usar. Comienza a construir funcionalidades increíbles.
