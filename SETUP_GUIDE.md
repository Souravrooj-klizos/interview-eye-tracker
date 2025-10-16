# Quick Setup Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
npm run setup
```
This will create your `.env.local` file and ensure all directories exist.

### 3. Start the Application
```bash
npm run dev
```

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB running (local or cloud)
- [ ] Modern browser with camera/microphone support

## 🔧 MongoDB Setup Options

### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Windows: Download from mongodb.com
# macOS: brew install mongodb-community
# Linux: Follow official installation guide

# Start MongoDB
mongod
```

### Option B: MongoDB Atlas (Cloud)
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGO_URI` in `.env.local`

## 🎯 Testing the Application

1. **Open**: http://localhost:3000
2. **Test Database**: http://localhost:3000/test
3. **Grant Permissions**: Allow camera and microphone access
4. **Start Interview**: Click the "Start Interview" button
5. **Test Eye Tracking**: Look away from screen to see warnings

## 🛠️ Troubleshooting

### Camera Issues
- Ensure HTTPS in production
- Check browser permissions
- Try different browsers (Chrome recommended)

### Database Issues
- Verify MongoDB is running
- Check connection string in `.env.local`
- Look at console for error messages

### Eye Tracking Issues
- Ensure good lighting
- Check if MediaPipe scripts are loading
- Verify camera is working properly

## 📁 Key Files

- `app/page.tsx` - Main application page
- `app/components/InterviewRecorder.tsx` - Core interview component
- `lib/hooks/useEyeTracking.ts` - Eye tracking logic
- `lib/hooks/useVideoRecording.ts` - Video recording logic
- `app/api/` - All API endpoints
- `models/Interview.ts` - Database schema

## 🎨 Customization

### Change Eye Tracking Sensitivity
Edit `lib/hooks/useEyeTracking.ts`:
```typescript
const GAZE_THRESHOLD = 0.15; // Lower = more sensitive
```

### Modify Warning Frequency
Edit `app/components/InterviewRecorder.tsx`:
```typescript
if (timeSinceLastWarning < 3000) return; // 3 seconds minimum
```

### Update Video Quality
Edit `lib/hooks/useVideoRecording.ts`:
```typescript
video: {
  width: { ideal: 1280 },
  height: { ideal: 720 }
}
```

## 🚀 Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**
3. **Deploy to your preferred platform** (Vercel, AWS, etc.)
4. **Configure HTTPS** (required for camera access)

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all prerequisites are met
3. Review the troubleshooting section
4. Check the main README.md for detailed information

---

**Happy interviewing! 🎬👁️**
