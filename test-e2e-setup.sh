#!/bin/bash

echo "🧪 Testing End-to-End Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend Health
echo "1️⃣  Testing Backend..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1 2>/dev/null)
if [ "$BACKEND_RESPONSE" = "404" ] || [ "$BACKEND_RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not responding (got $BACKEND_RESPONSE)${NC}"
fi

# Test 2: Frontend Health
echo "2️⃣  Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend is not responding (got $FRONTEND_RESPONSE)${NC}"
fi

# Test 3: Database Connection
echo "3️⃣  Testing Database..."
DB_TEST=$(psql -U postgres -d ai_social_platform -c "SELECT 1;" 2>&1)
if echo "$DB_TEST" | grep -q "1 row"; then
    echo -e "${GREEN}✅ Database is accessible${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi

# Test 4: Check Environment Variables
echo "4️⃣  Checking Environment Variables..."
if [ -f ".env" ]; then
    if grep -q "TWITTER_CLIENT_ID" .env && grep -q "TWITTER_CLIENT_SECRET" .env; then
        echo -e "${GREEN}✅ Twitter credentials configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Twitter credentials missing in .env${NC}"
    fi
    
    if grep -q "DEEPSEEK_API_KEY" .env || grep -q "OPENAI_API_KEY" .env; then
        echo -e "${GREEN}✅ AI provider configured${NC}"
    else
        echo -e "${YELLOW}⚠️  No AI provider configured${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

# Test 5: Check Database Tables
echo "5️⃣  Checking Database Schema..."
TABLES=$(psql -U postgres -d ai_social_platform -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>&1)
if [ "$TABLES" -gt "0" ]; then
    echo -e "${GREEN}✅ Database tables exist ($TABLES tables)${NC}"
else
    echo -e "${YELLOW}⚠️  No tables found - run migrations${NC}"
fi

echo ""
echo "================================"
echo "📊 Summary"
echo "================================"
echo ""
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Next Steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Create an account or login"
echo "3. Go to Settings → Connect Twitter"
echo "4. Create and publish a test post"
echo ""
echo "For detailed testing guide, see: E2E_TWITTER_TEST_GUIDE.md"
