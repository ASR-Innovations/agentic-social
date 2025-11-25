# 🚀 START HERE - Quick Setup Guide

## ⚡ Get Running in 3 Steps

### Step 1: Add API Keys (5 minutes)

```bash
# 1. Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# 2. Edit .env and add these REQUIRED keys:
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
OPENAI_API_KEY=sk-...  # Get from https://platform.openai.com
TWITTER_CLIENT_ID=...   # Get from https://developer.twitter.com
TWITTER_CLIENT_SECRET=...

# 3. Edit frontend/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### Step 2: Verify Setup (1 minute)

```bash
npm run verify:mvp
```

This checks if everything is configured correctly.

### Step 3: Start & Test (2 minutes)

```bash
# Terminal 1 - Backend
npm run start:dev

# Terminal 2 - Frontend  
cd frontend && npm run dev

# Open browser
open http://localhost:3000
```

---

## ✅ What's Working RIGHT NOW

### AI Hub Page - FULLY FUNCTIONAL
- View all 6 AI agents
- Activate/deactivate agents
- See real-time statistics
- View activity feed
- All connected to backend!

### Test It:
1. Go to http://localhost:3000/signup
2. Create account
3. Go to /app/ai-hub
4. See your agents!
5. Try toggling an agent on/off

---

## 📚 Documentation

- **`MVP_INTEGRATION_COMPLETE.md`** - What we completed
- **`QUICK_START_GUIDE.md`** - Detailed setup
- **`SYSTEM_ARCHITECTURE_VISUALIZATION.html`** - Visual architecture (open in browser!)
- **`PLATFORM_SUMMARY.md`** - Complete feature overview
- **`BRANCH_COMPARISON_ANALYSIS.md`** - Feature comparison

---

## 🎯 What's Next

### To Complete MVP (2-3 hours):
1. **Content Page** - AI generation form
2. **Settings Page** - Twitter OAuth button
3. **Test End-to-End** - Register → OAuth → Generate → Post

See `MVP_INTEGRATION_TASKS.md` for detailed task list.

---

## 🆘 Need Help?

### Common Issues:

**"Cannot connect to database"**
→ Check DATABASE_URL in .env

**"OpenAI API key invalid"**
→ Verify OPENAI_API_KEY starts with sk-

**"Agents not showing"**
→ Check backend logs, agents initialize on startup

**"Port 3001 already in use"**
→ Kill process: `lsof -ti:3001 | xargs kill -9`

---

## 🎉 Success Criteria

You're ready when:
- ✅ `npm run verify:mvp` passes
- ✅ Backend starts without errors
- ✅ Frontend loads at localhost:3000
- ✅ Can register/login
- ✅ AI Hub shows 6 agents
- ✅ Can toggle agent status

---

**Current Status:** 🟢 AI Hub Complete | 🟡 Content & OAuth Pending

**Estimated Time to Full MVP:** 2-3 hours

**Let's go! 🚀**
