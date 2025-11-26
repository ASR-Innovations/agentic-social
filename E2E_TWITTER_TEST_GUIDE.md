# End-to-End Twitter Integration Test Guide

## ✅ Current Status

### Backend
- ✅ Compiled successfully (0 errors)
- ✅ Running on http://localhost:3001
- ✅ Database connected (PostgreSQL)
- ✅ Twitter OAuth configured

### Frontend
- ✅ Running on http://localhost:3000
- ✅ Next.js ready

## 🔧 Fixed Issues

1. **Backend UUID Error** - Added `/agents/activity` route to prevent UUID parsing error
2. **TypeScript Compilation** - All 58 agent errors fixed
3. **Database Connection** - PostgreSQL started and connected

## 🚀 Twitter OAuth Setup

### Step 1: Verify Twitter Credentials in .env

```bash
TWITTER_CLIENT_ID=UFNBVHZheXpSUkh1ODcxSFdOQWc6MTpjaQ
TWITTER_CLIENT_SECRET=Ho4h28DpZqwedaQoWD2oIV98vhizxcxox1tK9VXnPAS0ivAi_y
TWITTER_CALLBACK_URL=http://localhost:3001/api/v1/social-accounts/callback/twitter
```

### Step 2: Test OAuth Flow

1. **Get Auth URL**
```bash
curl -X GET http://localhost:3001/api/v1/social-accounts/auth-url/twitter \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

2. **Visit the returned URL** in browser to authorize

3. **Connect Account** with the code from callback
```bash
curl -X POST http://localhost:3001/api/v1/social-accounts/connect \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "twitter",
    "code": "CODE_FROM_CALLBACK",
    "redirectUri": "http://localhost:3000/auth/twitter/callback"
  }'
```

### Step 3: Test Twitter Posting

1. **Create a Post**
```bash
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello from AI Social Media Platform! 🚀 #test",
    "platforms": ["twitter"],
    "scheduledAt": null
  }'
```

2. **Publish the Post**
```bash
curl -X POST http://localhost:3001/api/v1/posts/{POST_ID}/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Frontend Testing Steps

### 1. Login/Signup
- Navigate to http://localhost:3000
- Create account or login
- You'll get a JWT token stored in localStorage

### 2. Connect Twitter Account
- Go to Settings → Connected Accounts
- Click "Connect Twitter"
- Authorize the app
- You should see your Twitter account connected

### 3. Create and Post Content
- Go to Content page
- Click "Create Post"
- Write your content
- Select Twitter as platform
- Click "Publish Now" or "Schedule Post"

### 4. Verify on Twitter
- Check your Twitter account
- The post should appear

## 🐛 Known Issues & Fixes

### Issue 1: Frontend calling `/agents/activity` with wrong format
**Status**: ✅ FIXED
**Solution**: Added dedicated route handler in controller

### Issue 2: Content page not loading
**Status**: ✅ FIXED  
**Solution**: Fixed React component export

### Issue 3: Database connection refused
**Status**: ✅ FIXED
**Solution**: Started PostgreSQL service

## 🧪 Quick Test Commands

### Test Backend Health
```bash
curl http://localhost:3001/api/v1
```

### Test Frontend
```bash
curl http://localhost:3000
```

### Check Database
```bash
psql -U postgres -d ai_social_platform -c "SELECT COUNT(*) FROM users;"
```

### View Backend Logs
Check the running process output for any errors

### View Frontend Logs
Check browser console for any errors

## 📊 Expected Results

1. ✅ Backend responds on port 3001
2. ✅ Frontend loads on port 3000
3. ✅ Can create user account
4. ✅ Can connect Twitter via OAuth
5. ✅ Can create post
6. ✅ Can publish to Twitter
7. ✅ Post appears on Twitter

## 🔍 Debugging Tips

### If OAuth fails:
- Check Twitter Developer Portal for correct callback URL
- Verify CLIENT_ID and CLIENT_SECRET in .env
- Check backend logs for OAuth errors

### If posting fails:
- Verify Twitter account is connected and active
- Check token hasn't expired
- Verify post content meets Twitter requirements (280 chars)

### If frontend errors:
- Check browser console
- Verify API_URL in frontend/.env.local
- Check network tab for failed requests

## 📚 API Endpoints Reference

### Authentication
- POST `/api/v1/auth/signup` - Create account
- POST `/api/v1/auth/login` - Login
- POST `/api/v1/auth/refresh` - Refresh token

### Social Accounts
- GET `/api/v1/social-accounts/auth-url/:platform` - Get OAuth URL
- POST `/api/v1/social-accounts/connect` - Connect account
- GET `/api/v1/social-accounts` - List connected accounts
- DELETE `/api/v1/social-accounts/:id` - Disconnect account

### Posts
- POST `/api/v1/posts` - Create post
- GET `/api/v1/posts` - List posts
- GET `/api/v1/posts/:id` - Get post
- PATCH `/api/v1/posts/:id` - Update post
- POST `/api/v1/posts/:id/publish` - Publish post
- POST `/api/v1/posts/:id/schedule` - Schedule post

### Agents
- GET `/api/v1/agents` - List agents
- GET `/api/v1/agents/statistics` - Get statistics
- GET `/api/v1/agents/activity` - Get activity
- POST `/api/v1/agents` - Create agent
- POST `/api/v1/agents/:id/test` - Test agent

## ✨ Next Steps

1. Test the complete OAuth flow
2. Create a test post
3. Verify it appears on Twitter
4. Test scheduling functionality
5. Test AI content generation
6. Test analytics tracking

