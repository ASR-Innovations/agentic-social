#!/bin/bash

echo "🔍 Checking AI Social Media Platform Setup..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗ Not installed${NC}"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} $NPM_VERSION"
else
    echo -e "${RED}✗ Not installed${NC}"
    exit 1
fi

# Check PostgreSQL
echo -n "Checking PostgreSQL... "
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    echo -e "${GREEN}✓${NC} $PSQL_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Not found (optional if using remote DB)"
fi

# Check if node_modules exists
echo -n "Checking backend dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗ Not installed${NC}"
    echo "  Run: npm install"
fi

# Check if frontend node_modules exists
echo -n "Checking frontend dependencies... "
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗ Not installed${NC}"
    echo "  Run: cd frontend && npm install"
fi

# Check .env file
echo -n "Checking backend .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Found"
    
    # Check critical variables
    echo ""
    echo "Checking critical environment variables:"
    
    if grep -q "DATABASE_URL=" .env && ! grep -q "DATABASE_URL=$" .env; then
        echo -e "  DATABASE_URL: ${GREEN}✓${NC}"
    else
        echo -e "  DATABASE_URL: ${RED}✗ Missing or empty${NC}"
    fi
    
    if grep -q "JWT_SECRET=" .env && ! grep -q "JWT_SECRET=your-" .env; then
        echo -e "  JWT_SECRET: ${GREEN}✓${NC}"
    else
        echo -e "  JWT_SECRET: ${YELLOW}⚠ Using default (change this!)${NC}"
    fi
    
    if grep -q "ENCRYPTION_KEY=" .env && ! grep -q "ENCRYPTION_KEY=your-" .env; then
        echo -e "  ENCRYPTION_KEY: ${GREEN}✓${NC}"
    else
        echo -e "  ENCRYPTION_KEY: ${RED}✗ Missing or default${NC}"
    fi
    
    # Check AI providers
    HAS_AI=false
    if grep -q "OPENAI_API_KEY=sk-" .env; then
        echo -e "  OPENAI_API_KEY: ${GREEN}✓${NC}"
        HAS_AI=true
    fi
    if grep -q "ANTHROPIC_API_KEY=sk-ant-" .env; then
        echo -e "  ANTHROPIC_API_KEY: ${GREEN}✓${NC}"
        HAS_AI=true
    fi
    if [ "$HAS_AI" = false ]; then
        echo -e "  AI Provider: ${RED}✗ No AI API key found${NC}"
    fi
    
else
    echo -e "${RED}✗ Not found${NC}"
    echo "  Run: cp .env.example .env"
fi

# Check frontend .env.local
echo ""
echo -n "Checking frontend .env.local file... "
if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${YELLOW}⚠${NC} Not found (will use defaults)"
    echo "  Run: cp frontend/.env.example frontend/.env.local"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Summary:"
echo ""
echo "To complete setup, you need:"
echo "1. Copy .env.example to .env and fill in values"
echo "2. Generate JWT_SECRET: openssl rand -base64 32"
echo "3. Generate ENCRYPTION_KEY: openssl rand -hex 32"
echo "4. Add at least one AI API key (OpenAI/Anthropic)"
echo "5. Configure DATABASE_URL"
echo ""
echo "Then run:"
echo "  npm run start:dev          # Backend"
echo "  cd frontend && npm run dev # Frontend"
echo ""
