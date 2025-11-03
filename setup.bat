@echo off
echo ========================================
echo Enterprise Backend API - Setup Script
echo ========================================
echo.

echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

echo [2/5] Starting Docker containers...
call docker-compose up -d
if errorlevel 1 (
    echo ERROR: Failed to start Docker containers
    echo Make sure Docker Desktop is running
    pause
    exit /b 1
)
echo ✓ Docker containers started
echo.

echo Waiting for PostgreSQL to be ready...
timeout /t 5 /nobreak >nul

echo [3/5] Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma Client
    pause
    exit /b 1
)
echo ✓ Prisma Client generated
echo.

echo [4/5] Running database migrations...
call npx prisma migrate deploy
if errorlevel 1 (
    echo WARNING: Migrations might have failed. Creating database...
    call npx prisma db push
)
echo ✓ Database migrations completed
echo.

echo [5/5] Seeding database...
call npm run prisma:seed
if errorlevel 1 (
    echo WARNING: Database seeding failed
    echo You can run it manually later with: npm run prisma:seed
)
echo ✓ Database seeded with initial data
echo.

echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Services available:
echo - API: http://localhost:3000/api/v1
echo - Swagger Docs: http://localhost:3000/api/docs
echo - Grafana: http://localhost:3001 (admin/admin)
echo - Prometheus: http://localhost:9090
echo - Jaeger: http://localhost:16686
echo - pgAdmin: http://localhost:5050 (admin@admin.com/admin)
echo.
echo Test credentials:
echo - Admin: admin@example.com / Admin123!
echo - User: user@example.com / User123!
echo.
echo To start the application, run:
echo   npm run start:dev
echo.
pause
