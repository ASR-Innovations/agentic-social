# 🚀 AI Social Media Platform - Quick Setup Guide

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- At least one AI API key (OpenAI or Anthropic)

## 🔧 Setup Steps

### 1. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure Environment Variables

#### Backend (.env)
```bash
# Copy the example file
cp .env.example .env
```

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random secret for JWT tokens
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - At least one AI provider
- `ENCRYPTION_KEY` - 32-byte hex key for OAuth token encryption

**Optional but Recommended:**
- `TWITTER_CLIENT_ID` & `TWITTER_CLIENT_SECRET` - For Twitter integration
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` - For media uploads (S3)

#### Frontend (frontend/.env.local)
```bash
# Copy the example file
cp frontend/.env.example frontend/.env.local
```

**Required Variables:**
- `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`
- `NEXT_PUBLIC_WS_URL=http://localhost:3001`

### 3. Setup Database
```bash
# Create database (if not exists)
createdb ai_social_platform

# Run migrations
npm run migration:run
```

### 4. Start the Application

#### Option A: Run Both (Recommended)
```bash
# Terminal 1 - Backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

#### Option B: Using Docker
```bash
docker-compose up
```

## 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api/v1
- **API Health:** http://localhost:3001/health

## 🔑 Environment Variables You Need

### Critical (Must Have)
1. **DATABASE_URL** - Get from:
   - Local PostgreSQL: `postgresql://postgres:password@localhost:5432/ai_social_platform`
   - Supabase: Project Settings > Database > Connection String
   - Railway/Render: Provided in dashboard

2. **JWT_SECRET** - Generate with:
   ```bash
   openssl rand -base64 32
   ```

3. **ENCRYPTION_KEY** - Generate with:
   ```bash
   openssl rand -hex 32
   ```

4. **AI Provider** (Choose at least one):
   - **OpenAI:** https://platform.openai.com/api-keys
   - **Anthropic:** https://console.anthropic.com/
   - **Google AI:** https://aistudio.google.com/app/apikey
   - **DeepSeek:** https://platform.deepseek.com/

### Optional (For Full Features)
5. **Twitter OAuth** - Get from: https://developer.twitter.com/en/portal/dashboard
   - Create app
   - Enable OAuth 2.0
   - Add callback: `http://localhost:3001/api/v1/social-accounts/callback/twitter`

6. **AWS S3** (for media uploads) - Get from: AWS Console > IAM
   - Create IAM user with S3 access
   - Create S3 bucket
   - Get access keys

## 🧪 Verify Setup
```bash
npm run verify:mvp
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d ai_social_platform
```

### Port Already in Use
```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

### Missing Dependencies
```bash
# Clean install
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install
```

## 📝 Next Steps

1. **Create Account:** Go to http://localhost:3000/signup
2. **Connect Twitter:** Settings > Social Accounts > Connect Twitter
3. **Activate AI Agents:** AI Hub > Toggle agents on
4. **Generate Content:** Content > AI Generate

## 🎯 What's Working

✅ User authentication (signup/login)
✅ AI agent management (6 agents)
✅ Content generation with AI
✅ Post scheduling
✅ Twitter OAuth integration
✅ Media uploads (local/S3)
✅ Real-time agent activity
✅ Analytics dashboard

## 📚 Documentation

- **API Reference:** `/docs/API_REFERENCE.md`
- **Architecture:** `/docs/ARCHITECTURE.md`
- **Quick Start:** `/QUICK_START_GUIDE.md`
