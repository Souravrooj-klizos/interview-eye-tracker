# 🚀 Quick Vercel Deployment - 5 Minutes

## Step 1: Push to GitHub (2 minutes)

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Ready for Vercel deployment"

# Create GitHub repo and push
# 1. Go to github.com → New repository → "interview-eye-tracker"
# 2. Copy the commands GitHub provides, or use:
git remote add origin https://github.com/YOUR_USERNAME/interview-eye-tracker.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy on Vercel (3 minutes)

### 2.1 Import Project
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"New Project"**
3. Find `interview-eye-tracker` → Click **"Import"**

### 2.2 Configure Environment Variables
In the import screen, add these environment variables:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | `mongodb+srv://souravrooj_db_user:oeP6tCbps8FekxoU@cluster0.wqgilyl.mongodb.net/interviewdb` |
| `NEXT_PUBLIC_API_URL` | `https://YOUR_PROJECT_NAME.vercel.app` |

**Note**: Replace `YOUR_PROJECT_NAME` with your actual Vercel project name

### 2.3 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Get your live URL!

## Step 3: Update API URL

After deployment:
1. Copy your Vercel URL (e.g., `https://interview-eye-tracker-abc123.vercel.app`)
2. Go to **Settings** → **Environment Variables**
3. Edit `NEXT_PUBLIC_API_URL` with your actual URL
4. **Redeploy** (Deployments tab → "..." → Redeploy)

## ✅ Test Your Deployment

Visit your Vercel URL and test:
- [ ] Page loads correctly
- [ ] Camera access works (grant permissions)
- [ ] Eye tracking shows warnings when you look away
- [ ] Video recording and upload works
- [ ] Database connection works (visit `/test` page)

## 🎉 You're Live!

Your Interview Eye Tracker is now live on the internet with:
- ✅ HTTPS (required for camera access)
- ✅ MongoDB Atlas database
- ✅ Real-time eye tracking
- ✅ Video recording and upload
- ✅ Professional UI

**Share your live app**: `https://YOUR_PROJECT_NAME.vercel.app`

---

**Need help?** Check `VERCEL_DEPLOYMENT.md` for detailed troubleshooting.
