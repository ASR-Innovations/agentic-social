#!/bin/bash

# Test Instant Agent Flow - End to End
# This script tests the complete flow from login to posting on Twitter

set -e  # Exit on error

BASE_URL="http://localhost:3001/api/v1"
FRONTEND_URL="http://localhost:3000"

echo "🚀 Testing Instant Agent Flow - E2E"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Login
echo -e "${BLUE}Step 1: User Login${NC}"
echo "POST $BASE_URL/auth/login"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Get Social Accounts
echo -e "${BLUE}Step 2: Get Connected Social Accounts${NC}"
echo "GET $BASE_URL/social-accounts"

ACCOUNTS_RESPONSE=$(curl -s -X GET "$BASE_URL/social-accounts" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $ACCOUNTS_RESPONSE" | jq '.'

SOCIAL_ACCOUNT_ID=$(echo $ACCOUNTS_RESPONSE | jq -r '.[0].id')

if [ "$SOCIAL_ACCOUNT_ID" == "null" ] || [ -z "$SOCIAL_ACCOUNT_ID" ]; then
  echo -e "${RED}❌ No social accounts found${NC}"
  echo "Please connect a Twitter account first:"
  echo "1. Go to $FRONTEND_URL/app/settings"
  echo "2. Click 'Connect Twitter'"
  echo "3. Authorize the app"
  echo "4. Run this script again"
  exit 1
fi

echo -e "${GREEN}✅ Found social account: $SOCIAL_ACCOUNT_ID${NC}"
echo ""

# Step 3: Create Agent (Instant Mode)
echo -e "${BLUE}Step 3: Create Content Creator Agent (Instant Mode)${NC}"
echo "POST $BASE_URL/agents/instant"

AGENT_RESPONSE=$(curl -s -X POST "$BASE_URL/agents/instant" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"socialAccountId\": \"$SOCIAL_ACCOUNT_ID\",
    \"type\": \"content_creator\"
  }")

echo "Response: $AGENT_RESPONSE" | jq '.'

AGENT_ID=$(echo $AGENT_RESPONSE | jq -r '.id')

if [ "$AGENT_ID" == "null" ] || [ -z "$AGENT_ID" ]; then
  echo -e "${RED}❌ Agent creation failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Agent created: $AGENT_ID${NC}"
echo ""

# Step 4: Generate Content with Agent
echo -e "${BLUE}Step 4: Generate Twitter Content${NC}"
echo "POST $BASE_URL/agents/$AGENT_ID/execute"

CONTENT_RESPONSE=$(curl -s -X POST "$BASE_URL/agents/$AGENT_ID/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "generate_twitter_content",
    "input": {
      "topic": "The future of AI in social media management",
      "tone": "engaging",
      "keywords": ["AI", "automation", "social media"],
      "variations": 3,
      "includeHashtags": true,
      "includeEmojis": true
    }
  }')

echo "Response: $CONTENT_RESPONSE" | jq '.'

GENERATED_CONTENT=$(echo $CONTENT_RESPONSE | jq -r '.output.content')

if [ "$GENERATED_CONTENT" == "null" ] || [ -z "$GENERATED_CONTENT" ]; then
  echo -e "${RED}❌ Content generation failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Content generated${NC}"
echo "Content: $GENERATED_CONTENT"
echo ""

# Step 5: Create Post
echo -e "${BLUE}Step 5: Create Post${NC}"
echo "POST $BASE_URL/posts"

POST_RESPONSE=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"AI Social Media Tweet\",
    \"content\": \"$GENERATED_CONTENT\",
    \"type\": \"text\",
    \"socialAccountIds\": [\"$SOCIAL_ACCOUNT_ID\"],
    \"aiGeneratedData\": {
      \"agentId\": \"$AGENT_ID\",
      \"prompt\": \"The future of AI in social media management\"
    },
    \"aiModel\": \"deepseek-chat\"
  }")

echo "Response: $POST_RESPONSE" | jq '.'

POST_ID=$(echo $POST_RESPONSE | jq -r '.id')

if [ "$POST_ID" == "null" ] || [ -z "$POST_ID" ]; then
  echo -e "${RED}❌ Post creation failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Post created: $POST_ID${NC}"
echo ""

# Step 6: Publish to Twitter
echo -e "${BLUE}Step 6: Publish to Twitter${NC}"
echo "POST $BASE_URL/posts/$POST_ID/publish"

PUBLISH_RESPONSE=$(curl -s -X POST "$BASE_URL/posts/$POST_ID/publish" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $PUBLISH_RESPONSE" | jq '.'

echo -e "${GREEN}✅ Post queued for publishing${NC}"
echo ""

# Wait a bit for publishing
echo "⏳ Waiting 5 seconds for publishing..."
sleep 5

# Step 7: Check Post Status
echo -e "${BLUE}Step 7: Check Post Status${NC}"
echo "GET $BASE_URL/posts/$POST_ID"

STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/posts/$POST_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $STATUS_RESPONSE" | jq '.'

POST_STATUS=$(echo $STATUS_RESPONSE | jq -r '.status')
TWITTER_URL=$(echo $STATUS_RESPONSE | jq -r '.platforms[0].platformPostUrl')

echo ""
echo "===================================="
echo -e "${GREEN}🎉 Test Complete!${NC}"
echo "===================================="
echo ""
echo "Post Status: $POST_STATUS"

if [ "$TWITTER_URL" != "null" ] && [ ! -z "$TWITTER_URL" ]; then
  echo -e "${GREEN}✅ Tweet published successfully!${NC}"
  echo "Twitter URL: $TWITTER_URL"
  echo ""
  echo "Open this URL to see your tweet:"
  echo "$TWITTER_URL"
else
  echo -e "${BLUE}ℹ️  Post is being published...${NC}"
  echo "Check status again in a few seconds:"
  echo "curl -H 'Authorization: Bearer $TOKEN' $BASE_URL/posts/$POST_ID"
fi

echo ""
echo "Summary:"
echo "- Agent ID: $AGENT_ID"
echo "- Post ID: $POST_ID"
echo "- Content: $GENERATED_CONTENT"
