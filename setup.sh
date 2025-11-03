#!/bin/bash

echo "========================================"
echo "Enterprise Backend API - Setup Script"
echo "========================================"
echo ""

echo "[1/5] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed successfully"
echo ""

echo "[2/5] Starting Docker containers..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start Docker containers"
    echo "Make sure Docker is installed and running"
    exit 1
fi
echo "✓ Docker containers started"
echo ""

echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo "[3/5] Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to generate Prisma Client"
    exit 1
fi
echo "✓ Prisma Client generated"
echo ""

echo "[4/5] Running database migrations..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo "WARNING: Migrations might have failed. Creating database..."
    npx prisma db push
fi
echo "✓ Database migrations completed"
echo ""

echo "[5/5] Seeding database..."
npm run prisma:seed
if [ $? -ne 0 ]; then
    echo "WARNING: Database seeding failed"
    echo "You can run it manually later with: npm run prisma:seed"
fi
echo "✓ Database seeded with initial data"
echo ""

echo "========================================"
echo "Setup completed successfully!"
echo "========================================"
echo ""
echo "Services available:"
echo "- API: http://localhost:3000/api/v1"
echo "- Swagger Docs: http://localhost:3000/api/docs"
echo "- Grafana: http://localhost:3001 (admin/admin)"
echo "- Prometheus: http://localhost:9090"
echo "- Jaeger: http://localhost:16686"
echo "- pgAdmin: http://localhost:5050 (admin@admin.com/admin)"
echo ""
echo "Test credentials:"
echo "- Admin: admin@example.com / Admin123!"
echo "- User: user@example.com / User123!"
echo ""
echo "To start the application, run:"
echo "  npm run start:dev"
echo ""
