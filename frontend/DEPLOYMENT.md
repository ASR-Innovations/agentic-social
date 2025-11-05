# Vercel Deployment Guide - AI Social Media Platform Frontend

This guide will help you deploy the frontend of the AI Social Media Platform to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Backend API**: Have your backend deployed and accessible via HTTPS

---

## 🚀 Quick Deployment (Recommended)

### Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository: `Abhi1o/Social_ai`
4. Set **Root Directory** to: `frontend`
5. Vercel will auto-detect Next.js framework

### Step 2: Configure Environment Variables

In the Vercel dashboard, add these environment variables:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `NEXT_PUBLIC_API_URL` | Your backend API URL | `https://your-backend.herokuapp.com/api/v1` |
| `NEXT_PUBLIC_WS_URL` | Your WebSocket URL | `wss://your-backend.herokuapp.com` |

**How to add:**
1. Go to **Settings** → **Environment Variables**
2. Add each variable for **Production**, **Preview**, and **Development**
3. Click **Save**

### Step 3: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://your-project.vercel.app`

---

## 📝 Manual Deployment via CLI

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login to Vercel

```bash
vercel login
```

### Deploy from Frontend Directory

```bash
cd frontend
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account/team
- **Link to existing project?** → No (first time) or Yes (subsequent deploys)
- **Project name?** → ai-social-frontend (or your choice)
- **Directory?** → `./` (current directory)

### Set Environment Variables via CLI

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter your API URL when prompted

vercel env add NEXT_PUBLIC_WS_URL production
# Enter your WebSocket URL when prompted
```

### Deploy to Production

```bash
vercel --prod
```

---

## 🔧 Configuration Files

### vercel.json
Located at `frontend/vercel.json` - Contains:
- Build settings
- Environment variable references
- Security headers
- API proxy rewrites (optional)

### next.config.js
Optimized for production with:
- Image domain configuration
- Webpack optimizations
- Environment variable handling

### .vercelignore
Excludes unnecessary files from deployment

---

## 🌍 Custom Domain Setup

### Add Custom Domain

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add your domain: `yourdomain.com`
4. Follow DNS configuration instructions

### Update DNS Records

Add these records in your domain provider:

**For root domain (yourdomain.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 🔐 Environment Variables Required

### Production Environment Variables

```bash
# Backend API (REQUIRED)
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api/v1

# WebSocket URL (REQUIRED)
NEXT_PUBLIC_WS_URL=wss://your-backend-api.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### How to Get Backend URL

**Option 1: Deploy Backend to Railway/Render/Heroku**
- Deploy your NestJS backend first
- Use the provided URL

**Option 2: Use your existing backend**
- Ensure CORS is configured to allow your Vercel domain
- Backend must support HTTPS

---

## 🛠️ Build Configuration

### Build Command
```bash
npm run build
```

### Output Directory
```
.next
```

### Install Command
```bash
npm install
```

### Framework Preset
```
Next.js
```

---

## ⚡ Performance Optimizations

The deployment includes:

✅ **Automatic Code Splitting** - Only load what's needed
✅ **Image Optimization** - Next.js Image component with CDN
✅ **Static Generation** - Pre-render pages at build time
✅ **Edge Network** - Deploy to 70+ global locations
✅ **Compression** - Automatic Gzip/Brotli compression
✅ **Caching** - Smart caching strategies

---

## 🔒 Security Headers

Automatically applied via `vercel.json`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull Requests** → Automatic preview URLs

### Deployment Workflow

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys
# Check status at vercel.com/dashboard
```

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Ensure all dependencies are in package.json
npm install
npm run build
```

**Error: "Environment variable not defined"**
- Check Vercel dashboard → Settings → Environment Variables
- Ensure variables are set for Production

### 404 Errors

**Issue: API calls return 404**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend CORS configuration
- Ensure backend is deployed and accessible

### Slow Loading

- Enable **Image Optimization** in Vercel dashboard
- Use Next.js `<Image>` component instead of `<img>`
- Check **Analytics** tab for performance insights

---

## 📊 Monitoring & Analytics

### Built-in Vercel Analytics

1. Go to your project in Vercel
2. Click **Analytics** tab
3. View:
   - Real User Metrics (RUM)
   - Core Web Vitals
   - Page load times
   - Geographic distribution

### Custom Analytics Setup

Add Google Analytics:

1. Get GA4 measurement ID
2. Add to Vercel environment variables:
   ```bash
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
3. Update `_app.tsx` to include GA script

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Deployment Logs**: Check in Vercel project → Deployments tab
- **Documentation**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## 📞 Support

### Common Issues

1. **Build Timeout**: Increase build time in project settings
2. **Memory Limit**: Optimize bundle size or upgrade plan
3. **Rate Limiting**: Check API rate limits

### Getting Help

- Vercel Community: https://github.com/vercel/vercel/discussions
- Next.js Discord: https://discord.gg/nextjs

---

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] Backend API is deployed and accessible via HTTPS
- [ ] CORS is configured on backend to allow Vercel domain
- [ ] Environment variables are set in Vercel dashboard
- [ ] Build succeeds locally: `npm run build`
- [ ] All secrets are in environment variables (not hardcoded)
- [ ] Custom domain DNS is configured (if using custom domain)
- [ ] SSL certificate is active (automatic with Vercel)
- [ ] Test API connectivity from Vercel domain

---

## 🎉 Post-Deployment

After successful deployment:

1. **Test all features** on production URL
2. **Set up monitoring** and alerts
3. **Configure custom domain** (optional)
4. **Share your app** with users!

Your AI Social Media Platform frontend is now live! 🚀

---

**Project Repository**: https://github.com/Abhi1o/Social_ai
**Live Demo**: `https://your-project.vercel.app` (after deployment)
