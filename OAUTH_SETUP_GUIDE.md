# OAuth Setup Guide - Step by Step

## 🎯 Quick Start

This guide will help you set up OAuth for Twitter (and other platforms) in your AI Social Media Platform.

## 📋 Prerequisites

- Backend server running on `http://localhost:3001`
- Frontend server running on `http://localhost:3000`
- Access to social media developer portals

---

## 🐦 Twitter OAuth Setup

### Step 1: Create Twitter Developer Account

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with your Twitter account
3. Apply for a developer account (if you haven't already)
4. Wait for approval (usually instant for basic access)

### Step 2: Create a New App

1. Click "Create Project" or "Create App"
2. Fill in the required information:
   - **App name**: Your app name (e.g., "AI Social Platform")
   - **Description**: Brief description of your app
   - **Website URL**: `http://localhost:3000` (for development)

### Step 3: Configure OAuth 2.0

1. Navigate to your app settings
2. Click on "User authentication settings"
3. Click "Set up" or "Edit"
4. Configure the following:

   **App permissions:**
   - ✅ Read
   - ✅ Write
   - ✅ Direct Messages (optional)

   **Type of App:**
   - ✅ Web App

   **App info:**
   - **Callback URI / Redirect URL**: `http://localhost:3000/oauth/callback`
   - **Website URL**: `http://localhost:3000`

5. Click "Save"

### Step 4: Get Your Credentials

1. Go to "Keys and tokens" tab
2. You'll see:
   - **API Key** (Client ID)
   - **API Key Secret** (Client Secret)
3. Copy these values (you'll need them for the next step)

### Step 5: Configure Backend

1. Open your backend `.env` file
2. Add the following:

```env
# Twitter OAuth Configuration
TWITTER_CLIENT_ID=your_api_key_here
TWITTER_CLIENT_SECRET=your_api_key_secret_here
TWITTER_CALLBACK_URL=http://localhost:3000/oauth/callback

# Encryption Key (generate a new one if you don't have it)
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

3. Generate encryption key if needed:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Restart your backend server:
```bash
npm run start:dev
```

### Step 6: Test the Integration

1. Open your browser and go to `http://localhost:3000`
2. Login to your application
3. Navigate to **Onboarding** or **Settings > Platforms**
4. Click **"Connect"** next to Twitter
5. You should be redirected to Twitter's authorization page
6. Click **"Authorize app"**
7. You'll be redirected back to your app with a success message
8. Twitter should now show as "Connected"

---

## 📸 Instagram OAuth Setup

### Step 1: Create Facebook Developer Account

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Sign in with your Facebook account
3. Create a new app or use existing one

### Step 2: Add Instagram Basic Display

1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. Click "Create New App"
4. Fill in the required information

### Step 3: Configure OAuth

1. Go to "Basic Display" settings
2. Add OAuth Redirect URIs:
   - `http://localhost:3000/oauth/callback`
3. Add Deauthorize Callback URL:
   - `http://localhost:3000/oauth/deauthorize`
4. Add Data Deletion Request URL:
   - `http://localhost:3000/oauth/delete`

### Step 4: Get Credentials

1. Copy your **Instagram App ID** (Client ID)
2. Copy your **Instagram App Secret** (Client Secret)

### Step 5: Configure Backend

```env
# Instagram OAuth Configuration
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
INSTAGRAM_CALLBACK_URL=http://localhost:3000/oauth/callback
```

---

## 💼 LinkedIn OAuth Setup

### Step 1: Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create app"
3. Fill in the required information:
   - **App name**: Your app name
   - **LinkedIn Page**: Select or create a LinkedIn page
   - **App logo**: Upload a logo
   - **Legal agreement**: Accept terms

### Step 2: Configure OAuth

1. Go to "Auth" tab
2. Add Redirect URLs:
   - `http://localhost:3000/oauth/callback`
3. Request access to required scopes:
   - `r_liteprofile`
   - `r_emailaddress`
   - `w_member_social`

### Step 3: Get Credentials

1. Copy your **Client ID**
2. Copy your **Client Secret**

### Step 4: Configure Backend

```env
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:3000/oauth/callback
```

---

## 📘 Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Select "Business" type
4. Fill in app details

### Step 2: Add Facebook Login

1. Click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Select "Web" platform
4. Enter Site URL: `http://localhost:3000`

### Step 3: Configure OAuth

1. Go to "Facebook Login" > "Settings"
2. Add Valid OAuth Redirect URIs:
   - `http://localhost:3000/oauth/callback`
3. Enable "Client OAuth Login"
4. Enable "Web OAuth Login"

### Step 4: Get Credentials

1. Go to "Settings" > "Basic"
2. Copy your **App ID** (Client ID)
3. Copy your **App Secret** (Client Secret)

### Step 5: Configure Backend

```env
# Facebook OAuth Configuration
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/oauth/callback
```

---

## 🎬 YouTube OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3

### Step 2: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Add Authorized redirect URIs:
   - `http://localhost:3000/oauth/callback`

### Step 3: Get Credentials

1. Copy your **Client ID**
2. Copy your **Client Secret**

### Step 4: Configure Backend

```env
# YouTube OAuth Configuration
YOUTUBE_CLIENT_ID=your_google_client_id
YOUTUBE_CLIENT_SECRET=your_google_client_secret
YOUTUBE_CALLBACK_URL=http://localhost:3000/oauth/callback
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Callback URL mismatch" Error

**Problem:** The callback URL doesn't match what's configured in the provider.

**Solution:**
- Ensure the callback URL in your provider settings exactly matches: `http://localhost:3000/oauth/callback`
- No trailing slashes
- Use `http://` for local development (not `https://`)
- Restart backend after changing `.env`

#### 2. "Invalid Client ID" Error

**Problem:** The client ID or secret is incorrect.

**Solution:**
- Double-check you copied the correct values
- Make sure there are no extra spaces
- Regenerate credentials if needed
- Restart backend server

#### 3. "Platform not configured" Error

**Problem:** Backend doesn't have the platform credentials.

**Solution:**
- Check `.env` file has the correct variables
- Restart backend: `npm run start:dev`
- Check backend logs for errors

#### 4. OAuth Window Doesn't Open

**Problem:** Browser blocking popups or redirect not working.

**Solution:**
- Allow popups for localhost
- Check browser console for errors
- Try in incognito mode
- Clear browser cache

#### 5. "State parameter mismatch" Error

**Problem:** CSRF protection failing.

**Solution:**
- Clear localStorage
- Try the flow again
- Check backend CORS settings

---

## 🧪 Testing Checklist

### Before Testing
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] All environment variables are set
- [ ] Servers have been restarted after env changes

### During Testing
- [ ] Click "Connect" button
- [ ] Redirected to provider's authorization page
- [ ] Can see app name and permissions
- [ ] Click "Authorize" or "Allow"
- [ ] Redirected back to your app
- [ ] See success message
- [ ] Platform shows as "Connected"

### After Testing
- [ ] Check database for stored account
- [ ] Verify tokens are encrypted
- [ ] Test disconnecting account
- [ ] Test reconnecting account

---

## 📊 Environment Variables Template

Create a `.env` file in your backend root with all platforms:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Twitter OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_CALLBACK_URL=http://localhost:3000/oauth/callback

# Instagram OAuth
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_CALLBACK_URL=http://localhost:3000/oauth/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:3000/oauth/callback

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/oauth/callback

# YouTube OAuth
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_CALLBACK_URL=http://localhost:3000/oauth/callback

# TikTok OAuth (if available)
TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_CALLBACK_URL=http://localhost:3000/oauth/callback
```

---

## 🎉 Success!

Once you've completed the setup for any platform, you should be able to:

1. ✅ Connect social media accounts
2. ✅ See connected accounts in Settings
3. ✅ Post content to connected platforms
4. ✅ View analytics from connected accounts
5. ✅ Manage multiple accounts per platform

---

## 📞 Need Help?

If you encounter issues:

1. Check the backend logs for detailed error messages
2. Check the browser console for frontend errors
3. Verify all environment variables are set correctly
4. Make sure callback URLs match exactly
5. Try the flow in incognito mode to rule out cache issues

---

## 🚀 Production Deployment

When deploying to production:

1. Update callback URLs to your production domain:
   - `https://yourdomain.com/oauth/callback`
2. Update all provider settings with production URLs
3. Use HTTPS (required by most providers)
4. Store secrets securely (use environment variables, not hardcoded)
5. Enable rate limiting and security measures
6. Monitor OAuth flows for errors

---

Happy connecting! 🎊
