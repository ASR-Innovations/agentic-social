#!/bin/bash

echo "🚀 AI Social Media Platform - Environment Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Copy .env.example to .env
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Created .env file"
else
    echo -e "${YELLOW}⚠${NC} .env file already exists, skipping..."
fi

# Copy frontend .env.example to .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend/.env.local file..."
    cp frontend/.env.example frontend/.env.local
    echo -e "${GREEN}✓${NC} Created frontend/.env.local file"
else
    echo -e "${YELLOW}⚠${NC} frontend/.env.local already exists, skipping..."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Generated secure keys:"
echo ""

# Generate JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET:"
echo "$JWT_SECRET"
echo ""

# Generate ENCRYPTION_KEY
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "ENCRYPTION_KEY:"
echo "$ENCRYPTION_KEY"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Next Steps:"
echo ""
echo "1. Edit .env file and add:"
echo "   - DATABASE_URL (your PostgreSQL connection string)"
echo "   - JWT_SECRET (copy from above)"
echo "   - ENCRYPTION_KEY (copy from above)"
echo "   - OPENAI_API_KEY or ANTHROPIC_API_KEY"
echo ""
echo "2. Optional: Add Twitter OAuth credentials for social posting"
echo ""
echo "3. Run database migrations:"
echo "   npm run migration:run"
echo ""
echo "4. Start the application:"
echo "   npm run start:dev          # Backend (Terminal 1)"
echo "   cd frontend && npm run dev # Frontend (Terminal 2)"
echo ""
echo "5. Open http://localhost:3000 in your browser"
echo ""
