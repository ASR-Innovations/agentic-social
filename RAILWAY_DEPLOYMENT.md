# Railway Deployment Guide

This guide will help you deploy both the backend (NestJS) and frontend (Next.js) to Railway.

## Prerequisites

1. A Railway account (https://railway.app)
2. Railway CLI installed (optional but recommended)
3. Your code pushed to a GitHub repository

## Step 1: Create a New Project on Railway

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select your repository

## Step 2: Deploy the Backend

### Option A: Using Railway Dashboard

1. In your Railway project, click "New Service"
2. Select "GitHub Repo" and choose your repository
3. Railway will auto-detect the Dockerfile
4. Set the **Root Directory** to `/` (root of repo)
5. Add the following environment variables:

```
# Database (Railway provides PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:port/db

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key!

# Server
PORT=3001
NODE_ENV=production

# OAuth (Twitter)
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_CALLBACK_URL=https://your-backend.railway.app/api/v1/oauth/twitter/callback

# OAuth (LinkedIn, Facebook, etc. - add as needed)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# AI Providers (optional)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Redis (Railway provides Redis)
REDIS_URL=redis://default:pass@host:port

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend.railway.app
```

6. Click "Deploy"

### Option B: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Deploy backend
railway up
```

## Step 3: Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create the database
4. Copy the `DATABASE_URL` from the PostgreSQL service
5. Add it to your backend service's environment variables

## Step 4: Add Redis (Optional, for Bull queues)

1. In your Railway project, click "New Service"
2. Select "Database" → "Redis"
3. Copy the `REDIS_URL` from the Redis service
4. Add it to your backend service's environment variables

## Step 5: Deploy the Frontend

1. In your Railway project, click "New Service"
2. Select "GitHub Repo" and choose your repository
3. Set the **Root Directory** to `frontend`
4. Add the following environment variables:

```
# Backend API URL (use your deployed backend URL)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app

# Node environment
NODE_ENV=production
PORT=3000
```

5. Click "Deploy"

## Step 6: Configure Custom Domains (Optional)

1. Go to your service settings
2. Click "Settings" → "Networking"
3. Add a custom domain or use the Railway-provided domain

## Step 7: Update OAuth Callback URLs

After deployment, update your OAuth provider settings:

### Twitter Developer Portal
- Callback URL: `https://your-backend.railway.app/api/v1/oauth/twitter/callback`
- Website URL: `https://your-frontend.railway.app`

### LinkedIn Developer Portal
- Redirect URL: `https://your-backend.railway.app/api/v1/oauth/linkedin/callback`

## Environment Variables Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | `postgresql://...` |
| JWT_SECRET | Secret for JWT tokens (min 32 chars) | `your-secret-key` |
| ENCRYPTION_KEY | Key for encrypting OAuth tokens (32 chars) | `your-encryption-key` |
| PORT | Server port | `3001` |
| NODE_ENV | Environment | `production` |

### Backend Optional Variables

| Variable | Description |
|----------|-------------|
| REDIS_URL | Redis connection for Bull queues |
| TWITTER_CLIENT_ID | Twitter OAuth client ID |
| TWITTER_CLIENT_SECRET | Twitter OAuth client secret |
| OPENAI_API_KEY | OpenAI API key for AI features |
| ANTHROPIC_API_KEY | Anthropic API key |
| FRONTEND_URL | Frontend URL for CORS |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | `https://backend.railway.app/api/v1` |
| NEXT_PUBLIC_WS_URL | WebSocket URL | `wss://backend.railway.app` |

## Troubleshooting

### Build Fails with "nest: not found"
The Dockerfile has been updated to install all dependencies during build. Make sure you're using the latest Dockerfile.

### Database Connection Issues
- Ensure DATABASE_URL is correctly set
- Check if PostgreSQL service is running
- Verify the connection string format

### CORS Errors
- Add FRONTEND_URL to backend environment variables
- Ensure the URL includes the protocol (https://)

### OAuth Callback Errors
- Update callback URLs in OAuth provider settings
- Ensure TWITTER_CALLBACK_URL matches the provider settings

## Monitoring

Railway provides built-in monitoring:
- View logs in real-time
- Check deployment status
- Monitor resource usage

## Scaling

Railway automatically handles scaling, but you can:
- Adjust replica count in service settings
- Configure auto-scaling rules
- Set resource limits

## Cost Estimation

Railway pricing:
- Free tier: $5 credit/month
- Hobby: $5/month + usage
- Pro: $20/month + usage

Typical costs for this app:
- Backend: ~$5-10/month
- Frontend: ~$5-10/month
- PostgreSQL: ~$5/month
- Redis: ~$5/month
- **Total: ~$20-30/month**
