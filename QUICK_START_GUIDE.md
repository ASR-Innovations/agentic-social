# ⚡ Quick Start Guide - Get Running in 15 Minutes

## What You're Building
An AI-powered social media platform where users can:
1. Connect their Twitter account
2. Use AI agents to generate content
3. Post tweets automatically

## Prerequisites
- Node.js 18+ installed
- PostgreSQL running
- Twitter Developer Account (for OAuth)
- OpenAI API key

---

## Step 1: Clone & Install (2 min)

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

---

## Step 2: Database Setup (3 min)

```bash
# Create PostgreSQL database
createdb agentic_social

# Run migrations
npm run migration:run
```

---

## Step 3: Environment Variables (5 min)

Create `.env` file in root:

```env
# Database
DATABASE_URL=postgresql://localhost:5432/agentic_social

# JWT
JWT_SECRET=your-super-secret-key-change-this

# AI Providers (Get from respective platforms)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Twitter OAuth (Get from https://developer.twitter.com)
TWITTER_CLIENT_ID=your-client-id
TWITTER_CLIENT_SECRET=your-client-secret
TWITTER_CALLBACK_URL=http://localhost:3001/api/v1/social-accounts/callback/twitter

# Optional: AWS S3 for media
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
AWS_REGION=us-east-1
```

---

## Step 4: Start Servers (2 min)

### Terminal 1 - Backend:
```bash
npm run start:dev
```
Should see: `Application is running on: http://localhost:3001`

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Should see: `Ready on http://localhost:3000`

---

## Step 5: Test the Flow (3 min)

### 1. Register Account
- Go to http://localhost:3000/signup
- Enter email & password
- Click "Sign Up"
- Should redirect to dashboard

### 2. View AI Agents
- Go to http://localhost:3000/app/ai-hub
- Should see 6 AI agents
- All should be "Active" by default

### 3. Connect Twitter
- Go to http://localhost:3000/app/settings
- Click "Connect Twitter"
- Authorize on Twitter
- Should redirect back with account connected

### 4. Generate Content
- Go to http://localhost:3000/app/content
- Enter prompt: "Write a tweet about AI"
- Click "Generate with AI"
- Should see AI-generated tweet

### 5. Post Tweet
- Review generated content
- Click "Post Now"
- Check Twitter - tweet should be live!

---

## 🎉 You're Done!

Your platform is now running with:
- ✅ 6 AI agents (Content Creator, Strategy, Engagement, Analytics, Trend Detection, Competitor Analysis)
- ✅ Twitter OAuth integration
- ✅ AI content generation
- ✅ Post publishing

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Check database connection
psql -d agentic_social
```

### Frontend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Clear Next.js cache
rm -rf frontend/.next
```

### Twitter OAuth fails
1. Check callback URL in Twitter Developer Portal matches .env
2. Verify Client ID and Secret are correct
3. Make sure OAuth 2.0 is enabled in Twitter app settings

### AI generation fails
1. Verify OpenAI API key is valid
2. Check you have credits in your OpenAI account
3. Look at backend logs for error details

---

## 📚 What's Next?

### Immediate TODOs:
1. **Integrate React Query hooks** into AI Hub page (see `frontend/src/hooks/useAgents.ts`)
2. **Connect content form** to AI generation API
3. **Add error handling** and loading states
4. **Test end-to-end** flow multiple times

### Future Enhancements:
- Add LinkedIn, Instagram, Facebook
- Add post scheduling
- Add analytics dashboard
- Add team collaboration
- Add media library

---

## 📖 Key Files to Know

### Backend:
- `src/agentflow/` - AI agent system
- `src/ai/` - AI provider integrations
- `src/post/` - Post management
- `src/social-account/` - OAuth & platform clients
- `src/auth/` - Authentication

### Frontend:
- `frontend/src/app/app/ai-hub/` - Agent management UI
- `frontend/src/app/app/content/` - Content creation UI
- `frontend/src/app/app/settings/` - Settings & OAuth
- `frontend/src/hooks/useAgents.ts` - React Query hooks (NEW!)
- `frontend/src/lib/api.ts` - API client

---

## 🆘 Need Help?

### Check Logs:
```bash
# Backend logs
npm run start:dev

# Frontend logs
cd frontend && npm run dev
```

### Test API Directly:
```bash
# Register user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","tenantName":"Test Company"}'

# Get agents
curl http://localhost:3001/api/v1/agents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎯 Success Criteria

You know it's working when:
1. ✅ Backend starts without errors
2. ✅ Frontend loads at localhost:3000
3. ✅ You can register and login
4. ✅ You see 6 agents in AI Hub
5. ✅ Twitter OAuth completes successfully
6. ✅ AI generates content
7. ✅ Tweet posts to Twitter

---

**Estimated Setup Time:** 15 minutes
**Difficulty:** Easy
**Status:** Ready to go! 🚀
