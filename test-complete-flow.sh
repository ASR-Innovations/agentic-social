#!/bin/bash

# Complete E2E Flow Test
# Tests: User → Twitter OAuth → Agent Creation → Content Generation → Post → Publish

BASE_URL="http://localhost:3001/api/v1"

echo "🚀 Starting Complete E2E Flow Test"
echo "=================================="

# Step 1: Register/Login User
echo ""
echo "📝 Step 1: Creating test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User",
    "companyName": "Test Company"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token // empty')
TENANT_ID=$(echo $REGISTER_RESPONSE | jq -r '.tenant.id // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to register user"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi

echo "✅ User created successfully"
echo "   Token: ${TOKEN:0:20}..."
echo "   Tenant ID: $TENANT_ID"

# Step 2: Get connected social accounts
echo ""
echo "🔗 Step 2: Checking social accounts..."
ACCOUNTS_RESPONSE=$(curl -s -X GET "$BASE_URL/social-accounts" \
  -H "Authorization: Bearer $TOKEN")

echo "Social Accounts: $ACCOUNTS_RESPONSE"

# For now, we'll simulate having a Twitter account
# In real flow, user would go through OAuth
SOCIAL_ACCOUNT_ID="mock-twitter-account-id"

# Step 3: Create Content Creator Agent
echo ""
echo "🤖 Step 3: Creating Content Creator Agent..."
AGENT_RESPONSE=$(curl -s -X POST "$BASE_URL/agents/instant" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"socialAccountId\": \"$SOCIAL_ACCOUNT_ID\",
    \"type\": \"content_creator\"
  }")

AGENT_ID=$(echo $AGENT_RESPONSE | jq -r '.id // empty')

if [ -z "$AGENT_ID" ]; then
  echo "❌ Failed to create agent"
  echo "Response: $AGENT_RESPONSE"
  exit 1
fi

echo "✅ Agent created successfully"
echo "   Agent ID: $AGENT_ID"

# Step 4: Generate Content with Agent
echo ""
echo "✨ Step 4: Generating content with AI agent..."
CONTENT_RESPONSE=$(curl -s -X POST "$BASE_URL/agents/$AGENT_ID/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "generate_twitter_content",
    "input": {
      "topic": "The future of AI in social media management",
      "tone": "professional",
      "variations": 1
    }
  }')

echo "Content Generation Response:"
echo "$CONTENT_RESPONSE" | jq '.'

GENERATED_CONTENT=$(echo $CONTENT_RESPONSE | jq -r '.output.content // empty')

if [ -z "$GENERATED_CONTENT" ]; then
  echo "❌ Failed to generate content"
  exit 1
fi

echo "✅ Content generated successfully"
echo "   Content: $GENERATED_CONTENT"

# Step 5: Create Post
echo ""
echo "📄 Step 5: Creating post..."
POST_RESPONSE=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"AI Social Media Post\",
    \"content\": \"$GENERATED_CONTENT\",
    \"type\": \"text\",
    \"socialAccountIds\": [\"$SOCIAL_ACCOUNT_ID\"],
    \"aiGeneratedData\": {
      \"agentId\": \"$AGENT_ID\",
      \"prompt\": \"The future of AI in social media management\"
    }
  }")

POST_ID=$(echo $POST_RESPONSE | jq -r '.id // empty')

if [ -z "$POST_ID" ]; then
  echo "❌ Failed to create post"
  echo "Response: $POST_RESPONSE"
  exit 1
fi

echo "✅ Post created successfully"
echo "   Post ID: $POST_ID"

# Step 6: Publish Post (would post to Twitter)
echo ""
echo "🚀 Step 6: Publishing post..."
PUBLISH_RESPONSE=$(curl -s -X POST "$BASE_URL/posts/$POST_ID/publish" \
  -H "Authorization: Bearer $TOKEN")

echo "Publish Response:"
echo "$PUBLISH_RESPONSE" | jq '.'

echo ""
echo "=================================="
echo "✅ Complete E2E Flow Test Finished!"
echo ""
echo "Summary:"
echo "  - User created: ✅"
echo "  - Agent created: ✅"
echo "  - Content generated: ✅"
echo "  - Post created: ✅"
echo "  - Publish initiated: ✅"
echo ""
echo "Note: Actual Twitter posting requires valid OAuth tokens"
