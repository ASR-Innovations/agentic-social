# 🔑 Required Environment Variables

## ✅ Already Configured

The following have been automatically set up:

- ✓ `JWT_SECRET` - Secure token for authentication
- ✓ `ENCRYPTION_KEY` - Key for encrypting OAuth tokens
- ✓ `NEXT_PUBLIC_API_URL` - Frontend API endpoint
- ✓ `NEXT_PUBLIC_WS_URL` - WebSocket endpoint

## ⚠️ YOU NEED TO PROVIDE

### 1. Database Connection (REQUIRED)

**Variable:** `DATABASE_URL`

**Options:**

#### Option A: Local PostgreSQL
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_social_platform
```

Setup:
```bash
# Create database
createdb ai_social_platform

# Or using psql
psql -U postgres
CREATE DATABASE ai_social_platform;
```

#### Option B: Supabase (Free Tier Available)
1. Go to https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy "Connection String" (URI format)
5. Replace `[YOUR-PASSWORD]` with your actual password

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

#### Option C: Railway (Free Tier Available)
1. Go to https://railway.app
2. Create new project > Add PostgreSQL
3. Copy the `DATABASE_URL` from variables

#### Option D: Render (Free Tier Available)
1. Go to https://render.com
2. Create new PostgreSQL database
3. Copy the "Internal Database URL"

---

### 2. AI Provider API Key (REQUIRED - Choose at least ONE)

#### Option A: OpenAI (Recommended)
**Variable:** `OPENAI_API_KEY`

Get it from: https://platform.openai.com/api-keys

1. Sign up/Login to OpenAI
2. Go to API Keys section
3. Create new secret key
4. Copy the key (starts with `sk-proj-...`)

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

**Cost:** Pay as you go (~$0.002 per 1K tokens for GPT-3.5, ~$0.03 per 1K tokens for GPT-4)

#### Option B: Anthropic Claude
**Variable:** `ANTHROPIC_API_KEY`

Get it from: https://console.anthropic.com/

1. Sign up/Login to Anthropic
2. Go to API Keys
3. Create new key
4. Copy the key (starts with `sk-ant-...`)

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

**Cost:** Pay as you go (~$0.008 per 1K tokens for Claude 3 Haiku)

#### Option C: Google AI (Gemini)
**Variable:** `GOOGLE_AI_API_KEY`

Get it from: https://aistudio.google.com/app/apikey

1. Sign in with Google account
2. Click "Get API Key"
3. Create API key
4. Copy the key (starts with `AIza...`)

```bash
GOOGLE_AI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxx
```

**Cost:** Free tier available (60 requests/minute)

#### Option D: DeepSeek
**Variable:** `DEEPSEEK_API_KEY`

Get it from: https://platform.deepseek.com/

```bash
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
```

**Cost:** Very affordable (~$0.0001 per 1K tokens)

---

### 3. Twitter OAuth (OPTIONAL - For Twitter Posting)

**Variables:**
- `TWITTER_CLIENT_ID`
- `TWITTER_CLIENT_SECRET`

Get from: https://developer.twitter.com/en/portal/dashboard

**Steps:**
1. Apply for Twitter Developer Account (if you don't have one)
2. Create a new App
3. Go to "User authentication settings"
4. Enable OAuth 2.0
5. Set callback URL: `http://localhost:3001/api/v1/social-accounts/callback/twitter`
6. Copy Client ID and Client Secret

```bash
TWITTER_CLIENT_ID=your-client-id
TWITTER_CLIENT_SECRET=your-client-secret
```

**Note:** Without this, you can still use all AI features, just can't post to Twitter.

---

### 4. AWS S3 (OPTIONAL - For Media Uploads)

**Variables:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`

Get from: AWS Console > IAM > Users

**Steps:**
1. Create AWS account
2. Go to IAM > Users > Create User
3. Attach policy: `AmazonS3FullAccess`
4. Create access key
5. Create S3 bucket
6. Copy credentials

```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

**Note:** Without this, media will be stored locally (works fine for development).

---

## 📝 Quick Setup Checklist

### Minimum to Run (MVP):
- [ ] `DATABASE_URL` - PostgreSQL connection
- [ ] `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - AI provider
- [x] `JWT_SECRET` - Already set
- [x] `ENCRYPTION_KEY` - Already set

### For Full Features:
- [ ] `TWITTER_CLIENT_ID` & `TWITTER_CLIENT_SECRET` - Twitter posting
- [ ] `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` - Media uploads

---

## 🚀 After Adding Variables

1. **Run migrations:**
   ```bash
   npm run migration:run
   ```

2. **Start backend:**
   ```bash
   npm run start:dev
   ```

3. **Start frontend (new terminal):**
   ```bash
   cd frontend && npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

---

## 💡 Recommended Free Setup

For testing without spending money:

1. **Database:** Supabase (Free tier: 500MB, 2 projects)
2. **AI:** Google Gemini (Free tier: 60 req/min)
3. **Media:** Local storage (no AWS needed)
4. **Twitter:** Skip for now (optional)

This gives you a fully functional platform at $0 cost!

---

## 🆘 Need Help?

If you're stuck, check:
- `SETUP_AND_RUN.md` - Detailed setup guide
- `README.md` - Project overview
- `QUICK_START_GUIDE.md` - Quick reference

Or run:
```bash
./check-setup.sh
```
