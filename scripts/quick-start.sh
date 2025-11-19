#!/bin/bash

# Quick Start Script for AI Social Media Platform
# This script sets up the entire development environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   AI Social Media Platform - Quick Start Setup            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo -e "${BLUE}[1/7] Checking prerequisites...${NC}"
if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js v20.x or higher."
    exit 1
fi
print_success "Node.js is installed"

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi
print_success "npm is installed"

if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker."
    exit 1
fi
print_success "Docker is installed"

if ! command_exists docker-compose; then
    print_error "Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi
print_success "Docker Compose is installed"

# Step 2: Install dependencies
echo ""
echo -e "${BLUE}[2/7] Installing backend dependencies...${NC}"
npm install
print_success "Backend dependencies installed"

echo ""
echo -e "${BLUE}[3/7] Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..
print_success "Frontend dependencies installed"

# Step 3: Setup environment
echo ""
echo -e "${BLUE}[4/7] Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    print_success "Created .env file from .env.example"
    print_warning "Please update .env with your configuration"
else
    print_info ".env file already exists"
fi

if [ ! -f frontend/.env.local ]; then
    if [ -f frontend/.env.example ]; then
        cp frontend/.env.example frontend/.env.local
        print_success "Created frontend/.env.local file"
    fi
else
    print_info "frontend/.env.local file already exists"
fi

# Step 4: Start Docker services
echo ""
echo -e "${BLUE}[5/7] Starting Docker services (PostgreSQL, Redis, MongoDB)...${NC}"
docker-compose up -d postgres redis mongodb
print_success "Docker services started"

# Wait for services to be ready
print_info "Waiting for services to be ready..."
sleep 5

# Step 5: Setup database
echo ""
echo -e "${BLUE}[6/7] Setting up database...${NC}"
npm run prisma:generate
print_success "Prisma client generated"

npm run prisma:migrate
print_success "Database migrations completed"

# Step 6: Verify setup
echo ""
echo -e "${BLUE}[7/7] Verifying setup...${NC}"
node scripts/setup-verification.js

# Final instructions
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup Complete! 🎉                                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo -e "  ${YELLOW}1.${NC} Start the backend server:"
echo -e "     ${GREEN}npm run start:dev${NC}"
echo ""
echo -e "  ${YELLOW}2.${NC} In a new terminal, start the frontend:"
echo -e "     ${GREEN}npm run dev:frontend${NC}"
echo ""
echo -e "  ${YELLOW}3.${NC} Access the application:"
echo -e "     Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "     Backend:  ${GREEN}http://localhost:3001${NC}"
echo -e "     API Docs: ${GREEN}http://localhost:3001/api/v1${NC}"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo -e "  ${GREEN}npm run docker:logs${NC}     - View Docker logs"
echo -e "  ${GREEN}npm run prisma:studio${NC}   - Open Prisma Studio (Database GUI)"
echo -e "  ${GREEN}npm run verify${NC}          - Verify setup"
echo ""
