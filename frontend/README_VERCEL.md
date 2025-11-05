# Quick Vercel Deployment Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select: `Abhi1o/Social_ai`
4. Set Root Directory: `frontend`
5. Vercel auto-detects Next.js ✅

### Step 3: Set Environment Variables
Add in Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.com/api/v1
NEXT_PUBLIC_WS_URL=wss://your-backend.com
```

### Step 4: Deploy
Click "Deploy" button → Wait 2-3 minutes → Done! 🎉

---

## 📋 What You Need

✅ Vercel account (free)
✅ GitHub repository with code
✅ Backend API URL (with HTTPS)

---

## 🔗 After Deployment

Your app will be live at:
```
https://your-project-name.vercel.app
```

**Test it:**
1. Open the URL
2. Try signup/login
3. Check if API calls work

---

## 🐛 Troubleshooting

**Build fails?**
- Check `npm run build` works locally
- Verify all dependencies in package.json

**API not connecting?**
- Verify environment variables in Vercel
- Check backend CORS allows Vercel domain
- Ensure backend is HTTPS (not HTTP)

**404 on routes?**
- This is normal for Next.js
- Vercel handles routing automatically

---

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide with:
- Custom domains
- SSL certificates
- Performance optimization
- Monitoring setup
- Troubleshooting

---

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Project Issues: https://github.com/Abhi1o/Social_ai/issues

---

**Happy Deploying! 🚀**
