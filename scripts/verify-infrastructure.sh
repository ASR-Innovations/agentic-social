#!/bin/bash

# Script to verify infrastructure setup
echo "🔍 Verifying AI Social Media Platform Infrastructure..."
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  Node.js version: $NODE_VERSION"
else
    echo "  ❌ Node.js not found"
    exit 1
fi

# Check npm
echo "✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  npm version: $NPM_VERSION"
else
    echo "  ❌ npm not found"
    exit 1
fi

# Check Docker
echo "✓ Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "  $DOCKER_VERSION"
else
    echo "  ⚠️  Docker not found (optional for local development)"
fi

# Check if .env exists
echo "✓ Checking environment configuration..."
if [ -f ".env" ]; then
    echo "  .env file exists"
else
    echo "  ❌ .env file not found"
    echo "  Run: cp .env.example .env"
    exit 1
fi

# Check if node_modules exists
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  Backend dependencies installed"
else
    echo "  ⚠️  Backend dependencies not installed"
    echo "  Run: npm install"
fi

if [ -d "frontend/node_modules" ]; then
    echo "  Frontend dependencies installed"
else
    echo "  ⚠️  Frontend dependencies not installed"
    echo "  Run: cd frontend && npm install"
fi

# Check Prisma Client
echo "✓ Checking Prisma Client..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "  Prisma Client generated"
else
    echo "  ⚠️  Prisma Client not generated"
    echo "  Run: npm run prisma:generate"
fi

# Check Docker services (if Docker is available)
if command -v docker &> /dev/null; then
    echo "✓ Checking Docker services..."
    
    if docker ps | grep -q "ai-social-postgres"; then
        echo "  PostgreSQL: Running"
    else
        echo "  PostgreSQL: Not running"
        echo "  Run: docker compose up -d postgres"
    fi
    
    if docker ps | grep -q "ai-social-redis"; then
        echo "  Redis: Running"
    else
        echo "  Redis: Not running"
        echo "  Run: docker compose up -d redis"
    fi
    
    if docker ps | grep -q "ai-social-mongodb"; then
        echo "  MongoDB: Running"
    else
        echo "  MongoDB: Not running"
        echo "  Run: docker compose up -d mongodb"
    fi
fi

echo ""
echo "✅ Infrastructure verification complete!"
echo ""
echo "Next steps:"
echo "1. Start Docker services: docker compose up -d postgres redis mongodb"
echo "2. Run migrations: npm run prisma:migrate"
echo "3. Start backend: npm run start:dev"
echo "4. Start frontend: cd frontend && npm run dev"
