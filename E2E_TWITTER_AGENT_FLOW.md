# End-to-End Twitter Agent Flow - Complete Guide

## 🎯 Goal
Test the complete flow: **User Login → Connect Twitter → Create Agent → Generate Content → Post to Twitter**

## 📋 Prerequisites Checklist
- [x] Backend running on `http://localhost:3001`
- [x] Frontend running on `http://localhost:3000`
- [x] PostgreSQL database running
- [x] Twitter OAuth credentials configured in `.env`
- [x] At least one AI provider API key (DeepSeek or Gemini)

## 🔄 Complete Flow Architecture

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  1. AUTHENTICATION                                          │
│  POST /api/v1/auth/login                                    │
│  → Get JWT token                                            │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  2. CONNECT TWITTER ACCOUNT                                 │
│  GET /api/v1/social-accounts/auth-url/twitter               │
│  → Redirect to Twitter OAuth                                │
│  → User authorizes                                          │
│  POST /api/v1/social-accounts/connect                       │
│  → Store encrypted tokens                                   │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  3. CREATE CONTENT CREATOR AGENT (INSTANT MODE)             │
│  POST /api/v1/agents/instant                                │
│  Body: {                                                    │
│    socialAccountId: "uuid",                                 │
│    type: "content_creator"                                  │
│  }                                                          │
│  → Agent created with default personality                   │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  4. GENERATE TWITTER CONTENT                                │
│  Agent.execute({                                            │
│    type: "generate_twitter_content",                        │
│    input: {                                                 │
│      topic: "AI and social media",                          │
│      tone: "engaging",                                      │
│      variations: 3                                          │
│    }                                                        │
│  })                                                         │
│  → AI generates 3 tweet variations                          │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  5. CREATE POST                                             │
│  POST /api/v1/posts                                         │
│  Body: {                                                    │
│    title: "AI Tweet",                                       │
│    content: "Generated tweet content...",                   │
│    socialAccountIds: ["twitter-account-id"],                │
│    type: "text"                                             │
│  }                                                          │
│  → Post created in database                                 │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  6. PUBLISH TO TWITTER                                      │
│  POST /api/v1/posts/:id/publish                             │
│  → Queue job in Bull                                        │
│  → PostPublishProcessor handles                             │
│  → Get Twitter access token                                 │
│  → TwitterClient.post()                                     │
│  → POST to Twitter API v2                                   │
│  → Tweet published! 🎉                                      │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Step-by-Step Testing Guide

### Step 1: User Authentication
```bash
# Login or create account
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "accessToken": "eyJhbGc...",
#   "user": { "id": "...", "email": "..." }
# }

# Save the token for subsequent requests
export TOKEN="eyJhbGc..."
```

### Step 2: Connect Twitter Account
```bash
# Get Twitter OAuth URL
curl -X GET "http://localhost:3001/api/v1/social-accounts/auth-url/twitter" \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "url": "https://twitter.com/i/oauth2/authorize?...",
#   "state": "base64-encoded-state"
# }

# 1. Open the URL in browser
# 2. Authorize the app
# 3. You'll be redirected to: http://localhost:3000/oauth/callback?code=...&state=...

# The frontend will automatically call:
curl -X POST http://localhost:3001/api/v1/social-accounts/connect \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "twitter",
    "code": "oauth-code-from-callback",
    "redirectUri": "http://localhost:3000/oauth/callback"
  }'

# Response:
# {
#   "id": "social-account-uuid",
#   "platform": "twitter",
#   "displayName": "Your Twitter Name",
#   "status": "active"
# }

export SOCIAL_ACCOUNT_ID="social-account-uuid"
```

### Step 3: Create Content Creator Agent (Instant Mode)
```bash
# Create agent with instant mode (uses defaults)
curl -X POST http://localhost:3001/api/v1/agents/instant \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "socialAccountId": "'$SOCIAL_ACCOUNT_ID'",
    "type": "content_creator"
  }'

# Response:
# {
#   "id": "agent-uuid",
#   "name": "Content Creator",
#   "type": "content_creator",
#   "socialAccountId": "...",
#   "aiProvider": "deepseek",
#   "model": "deepseek-chat",
#   "active": true,
#   "personalityConfig": {
#     "tone": "engaging",
#     "style": "creative",
#     "creativity": 0.8
#   }
# }

export AGENT_ID="agent-uuid"
```

### Step 4: Generate Content with Agent

**MISSING IMPLEMENTATION**: We need to add an endpoint to execute agent tasks!

```bash
# This endpoint needs to be created:
# POST /api/v1/agents/:id/execute

curl -X POST "http://localhost:3001/api/v1/agents/$AGENT_ID/execute" \
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
  }'

# Expected Response:
# {
#   "success": true,
#   "output": {
#     "platform": "twitter",
#     "content": "🚀 AI is revolutionizing social media...",
#     "variations": [
#       "Tweet variation 1...",
#       "Tweet variation 2...",
#       "Tweet variation 3..."
#     ],
#     "hashtags": ["#AI", "#SocialMedia", "#Automation"],
#     "characterCount": 245
#   },
#   "metadata": {
#     "tokensUsed": 450,
#     "cost": 0.0023,
#     "duration": 1250,
#     "model": "deepseek-chat",
#     "provider": "deepseek"
#   }
# }
```

### Step 5: Create Post with Generated Content
```bash
# Use the generated content to create a post
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Social Media Tweet",
    "content": "🚀 AI is revolutionizing social media management! From content creation to analytics, automation is changing the game. The future is here. #AI #SocialMedia #Automation",
    "type": "text",
    "socialAccountIds": ["'$SOCIAL_ACCOUNT_ID'"],
    "aiGeneratedData": {
      "agentId": "'$AGENT_ID'",
      "prompt": "The future of AI in social media management",
      "variations": 3
    },
    "aiModel": "deepseek-chat"
  }'

# Response:
# {
#   "id": "post-uuid",
#   "title": "AI Social Media Tweet",
#   "content": "...",
#   "status": "draft",
#   "platforms": [
#     {
#       "id": "platform-uuid",
#       "socialAccountId": "...",
#       "status": "pending"
#     }
#   ]
# }

export POST_ID="post-uuid"
```

### Step 6: Publish to Twitter
```bash
# Publish the post immediately
curl -X POST "http://localhost:3001/api/v1/posts/$POST_ID/publish" \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "id": "post-uuid",
#   "status": "publishing",
#   "message": "Post is being published"
# }

# The backend will:
# 1. Add job to Bull queue
# 2. PostPublishProcessor picks it up
# 3. Gets Twitter access token (auto-refreshes if expired)
# 4. Calls TwitterClient.post()
# 5. Posts to Twitter API v2
# 6. Updates post status to "published"
# 7. Stores Twitter post ID and URL

# Check post status
curl -X GET "http://localhost:3001/api/v1/posts/$POST_ID" \
  -H "Authorization: Bearer $TOKEN"

# Response after publishing:
# {
#   "id": "post-uuid",
#   "status": "published",
#   "publishedAt": "2025-11-29T...",
#   "platforms": [
#     {
#       "status": "published",
#       "platformPostId": "1234567890",
#       "platformPostUrl": "https://twitter.com/user/status/1234567890",
#       "publishedAt": "2025-11-29T..."
#     }
#   ]
# }
```

## 🔧 Missing Implementations

### 1. Agent Execute Endpoint
**File**: `src/agentflow/agentflow.controller.ts`

Add this endpoint:
```typescript
@Post(':id/execute')
async executeTask(
  @Request() req,
  @Param('id') id: string,
  @Body() taskDto: ExecuteTaskDto,
) {
  return this.agentFlowService.executeAgentTask(
    req.user.tenantId,
    id,
    taskDto
  );
}
```

### 2. Agent Execution Service Method
**File**: `src/agentflow/agentflow.service.ts`

The `executeTask` method exists but returns a placeholder. Need to:
1. Instantiate the actual agent (ContentCreatorAgent)
2. Call agent.execute() with the task
3. Return the result

### 3. Agent Factory/Registry
Need a way to instantiate agents dynamically based on their configuration.

## 🎨 Frontend Flow (UI)

### Instant Mode UI Flow:
1. **Settings Page** → Connect Twitter Account
2. **AI Hub Page** → Click "Create Agent" → Select "Instant Mode"
3. Agent created automatically with defaults
4. **Content Page** → Click "Generate with AI"
5. Select agent, enter topic
6. AI generates content variations
7. Select preferred variation
8. Click "Post Now" or "Schedule"
9. Post published to Twitter!

## 🐛 Current Issues to Fix

1. **Agent Execution Not Implemented**
   - `AgentFlowService.executeTask()` is a placeholder
   - Need to instantiate ContentCreatorAgent
   - Need to wire up AI providers

2. **Agent Registry Missing**
   - No way to get agent instances from config
   - Need AgentFactory or AgentRegistry service

3. **Bull Queue Not Started**
   - Redis connection needed for queue
   - Or use in-memory queue for development

4. **Frontend Integration**
   - Content page needs agent selection
   - Need UI for "Generate with AI" button
   - Need to display variations

## ✅ What's Working

- ✅ Twitter OAuth flow
- ✅ Social account storage with encrypted tokens
- ✅ Agent configuration CRUD
- ✅ Post creation and storage
- ✅ Twitter API client implementation
- ✅ Post publishing processor structure
- ✅ AI provider abstraction (DeepSeek, Gemini)
- ✅ Content Creator Agent implementation

## 🎯 Next Steps

1. **Implement Agent Execution** (30 min)
   - Add execute endpoint
   - Wire up agent instantiation
   - Test with curl

2. **Test E2E Flow** (15 min)
   - Follow this guide step-by-step
   - Verify tweet posts to Twitter

3. **Add Frontend Integration** (1 hour)
   - Add "Generate with AI" button
   - Show content variations
   - One-click posting

4. **Polish & Error Handling** (30 min)
   - Better error messages
   - Loading states
   - Success notifications

## 📝 Testing Checklist

- [ ] User can login
- [ ] User can connect Twitter account
- [ ] User can create agent (instant mode)
- [ ] Agent can generate Twitter content
- [ ] Generated content follows character limits
- [ ] Generated content includes hashtags
- [ ] User can create post with generated content
- [ ] Post can be published to Twitter
- [ ] Tweet appears on Twitter timeline
- [ ] Post status updates correctly
- [ ] Twitter post ID and URL are stored
- [ ] Cost tracking works
- [ ] Agent usage stats update

---

**Ready to implement? Start with the Agent Execution endpoint!**
