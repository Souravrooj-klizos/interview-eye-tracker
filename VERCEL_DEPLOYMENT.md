# 🚀 Vercel Deployment Guide

Complete step-by-step guide to deploy your Interview Eye Tracker to Vercel.

## 📋 Prerequisites

- [x] GitHub account
- [x] Vercel account (free tier available)
- [x] MongoDB Atlas account (your existing connection string)
- [x] Your project code ready

## 🔧 Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository (if not done)
```bash
git init
git add .
git commit -m "Initial commit: Interview Eye Tracker"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name it `interview-eye-tracker`
4. Make it **Public** (required for free Vercel deployment)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/interview-eye-tracker.git
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Deploy to Vercel

### 2.1 Sign Up/Login to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign up" or "Login"
3. **Choose "Continue with GitHub"** for easy integration

### 2.2 Import Your Project
1. On Vercel dashboard, click **"New Project"**
2. Find your `interview-eye-tracker` repository
3. Click **"Import"**

### 2.3 Configure Project Settings
1. **Project Name**: `interview-eye-tracker` (or your preferred name)
2. **Framework Preset**: Next.js (should auto-detect)
3. **Root Directory**: `./` (leave as default)
4. **Build Command**: `npm run build` (auto-filled)
5. **Output Directory**: `.next` (auto-filled)
6. **Install Command**: `npm install` (auto-filled)

## 🔐 Step 3: Configure Environment Variables

### 3.1 Add Environment Variables in Vercel
1. In the import screen, click **"Environment Variables"**
2. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGO_URI` | `mongodb+srv://souravrooj_db_user:oeP6tCbps8FekxoU@cluster0.wqgilyl.mongodb.net/interviewdb` | Production |
| `NEXT_PUBLIC_API_URL` | `https://YOUR_VERCEL_URL.vercel.app` | Production |

**Note**: Replace `YOUR_VERCEL_URL` with your actual Vercel URL (you'll get this after deployment)

### 3.2 Alternative: Add Environment Variables After Deployment
If you skip this step during import:
1. Go to your project dashboard
2. Click **"Settings"** tab
3. Click **"Environment Variables"**
4. Add the variables above

## 🚀 Step 4: Deploy

### 4.1 Start Deployment
1. Click **"Deploy"** button
2. Wait for the build process (usually 2-3 minutes)
3. You'll see build logs in real-time

### 4.2 Fix the API URL
After first deployment:
1. Copy your Vercel URL (e.g., `https://interview-eye-tracker-xyz.vercel.app`)
2. Go to **Settings** → **Environment Variables**
3. Edit `NEXT_PUBLIC_API_URL` to your actual Vercel URL
4. **Redeploy** (go to Deployments tab → click "..." → Redeploy)

## ✅ Step 5: Verify Deployment

### 5.1 Test Basic Functionality
1. Visit your Vercel URL
2. Check if the page loads correctly
3. Test camera permissions (allow when prompted)

### 5.2 Test Database Connection
1. Visit `https://YOUR_VERCEL_URL.vercel.app/test`
2. Should show "Database Connection: Connected"
3. If not, check your MongoDB Atlas connection string

### 5.3 Test Core Features
1. Click "Start Interview"
2. Grant camera/microphone permissions
3. Look away to test eye tracking warnings
4. Click "End Interview"
5. Check if video uploads successfully

## 🔧 Step 6: Configure Domain (Optional)

### 6.1 Custom Domain
1. Go to project **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_API_URL` to your custom domain

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Build Fails
**Error**: `Module not found` or dependency issues
**Solution**:
```bash
# Locally test the build
npm run build

# If it fails locally, fix dependencies first
npm install
```

#### 2. Database Connection Fails
**Error**: MongoDB connection timeout
**Solutions**:
- Verify MongoDB Atlas connection string
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure database user has proper permissions

#### 3. Camera/Microphone Not Working
**Error**: `getUserMedia` not available
**Solutions**:
- Vercel automatically provides HTTPS (required for camera access)
- Check browser permissions
- Test on different browsers

#### 4. File Upload Issues
**Error**: Video upload fails
**Solutions**:
- Vercel has file size limits (check your plan)
- Consider using cloud storage (AWS S3, Cloudinary) for production
- Check API route timeout settings

#### 5. Environment Variables Not Working
**Error**: `process.env.VARIABLE_NAME` is undefined
**Solutions**:
- Ensure variables are added in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

## 📈 Step 7: Production Optimizations

### 7.1 Performance Improvements
```bash
# Add to package.json scripts
"analyze": "ANALYZE=true npm run build"
```

### 7.2 Monitoring
1. Enable Vercel Analytics in project settings
2. Monitor function execution times
3. Check error logs in Vercel dashboard

### 7.3 Security Enhancements
1. Add rate limiting to API routes
2. Implement proper CORS headers
3. Add input validation
4. Consider adding authentication

## 🔄 Step 8: Continuous Deployment

### 8.1 Automatic Deployments
- Every push to `main` branch triggers automatic deployment
- Preview deployments for pull requests
- Rollback capability in Vercel dashboard

### 8.2 Branch Deployments
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and push
git push origin feature/new-feature
```
Vercel will create a preview deployment automatically.

## 📊 Step 9: Monitoring and Maintenance

### 9.1 Check Deployment Status
- Vercel Dashboard → Your Project → Deployments
- View build logs and runtime logs
- Monitor function invocations

### 9.2 Database Monitoring
- MongoDB Atlas Dashboard
- Check connection counts
- Monitor query performance

## 🎉 Success Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel project created and deployed
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Camera access working (HTTPS)
- [ ] Eye tracking functional
- [ ] Video recording and upload working
- [ ] All API endpoints responding
- [ ] Custom domain configured (optional)

## 📞 Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

## 🚨 Important Notes

1. **HTTPS Required**: Camera/microphone access requires HTTPS (Vercel provides this automatically)
2. **File Storage**: Consider cloud storage for production (Vercel has file size limits)
3. **Database**: Your MongoDB Atlas connection is already configured
4. **Costs**: Vercel free tier should be sufficient for testing/small usage

**Your app will be live at**: `https://interview-eye-tracker-[random].vercel.app`

🎊 **Congratulations! Your Interview Eye Tracker is now live on Vercel!**
