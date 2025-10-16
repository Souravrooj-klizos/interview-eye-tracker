# Interview Eye Tracker

A professional Next.js 14 application for conducting interviews with real-time eye tracking and video recording capabilities.

## 🚀 Features

- **Real-time Eye Tracking**: Uses MediaPipe FaceMesh to detect when users look away from the screen
- **Video Recording**: Records interview sessions with high-quality video and audio
- **Warning System**: Shows visual warnings when users look away and logs them to the database
- **MongoDB Integration**: Stores interview metadata, warnings, and video URLs
- **Professional UI**: Clean, modern interface built with TailwindCSS
- **TypeScript**: Fully type-safe codebase
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS
- **Eye Tracking**: MediaPipe FaceMesh
- **Video Recording**: MediaRecorder API
- **Database**: MongoDB with Mongoose
- **File Storage**: Local file system (`/public/uploads`)

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- Modern web browser with camera/microphone support

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd interview-eye-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   MONGO_URI=mongodb+srv://souravrooj_db_user:oeP6tCbps8FekxoU@cluster0.wqgilyl.mongodb.net/interviewdb
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   - For local MongoDB: `mongod`
   - For MongoDB Atlas: Use your connection string

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

1. **Grant Permissions**: Allow camera and microphone access when prompted
2. **Start Interview**: Click "Start Interview" to begin recording and eye tracking
3. **Stay Focused**: Keep looking at the screen to avoid warnings
4. **End Interview**: Click "End Interview" to stop and upload the recording

## 📁 Project Structure

```
interview-eye-tracker/
├── app/
│   ├── api/                    # API routes
│   │   ├── upload/            # Video upload endpoint
│   │   ├── warning/           # Warning logging endpoint
│   │   └── interview/         # Interview session endpoints
│   ├── components/            # React components
│   │   └── InterviewRecorder.tsx
│   ├── globals.css           # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx            # Home page
├── lib/
│   ├── hooks/              # Custom React hooks
│   │   ├── useEyeTracking.ts
│   │   └── useVideoRecording.ts
│   ├── db.ts              # MongoDB connection
│   └── types.ts           # TypeScript types
├── models/
│   └── Interview.ts       # MongoDB schema
├── public/
│   └── uploads/          # Uploaded video files
└── package.json
```

## 🔍 API Endpoints

- `POST /api/interview/start` - Start a new interview session
- `POST /api/interview/end` - End an interview session
- `POST /api/warning` - Log a warning event
- `POST /api/upload` - Upload recorded video

## 🎨 Customization

### Eye Tracking Sensitivity
Modify the `GAZE_THRESHOLD` in `lib/hooks/useEyeTracking.ts`:
```typescript
const GAZE_THRESHOLD = 0.15; // Lower = more sensitive
```

### Warning Frequency
Adjust the warning throttle in `app/components/InterviewRecorder.tsx`:
```typescript
if (timeSinceLastWarning < 3000) return; // 3 seconds minimum
```

### Video Quality
Change recording settings in `lib/hooks/useVideoRecording.ts`:
```typescript
video: {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  facingMode: 'user'
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Considerations

- Videos are stored locally in `/public/uploads` (consider cloud storage for production)
- No authentication implemented (add NextAuth.js for production)
- CORS is open (configure for production domains)

## 🐛 Troubleshooting

### Camera Access Issues
- Ensure HTTPS in production (required for camera access)
- Check browser permissions
- Try different browsers

### Eye Tracking Not Working
- Ensure good lighting
- Check MediaPipe script loading
- Verify camera is working

### MongoDB Connection Issues
- Check MongoDB is running
- Verify connection string
- Check network connectivity

## 📈 Performance Tips

- Use good lighting for better eye tracking accuracy
- Ensure stable internet connection for uploads
- Close other applications using camera/microphone
- Use Chrome or Edge for best MediaPipe performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [MediaPipe](https://mediapipe.dev/) for face mesh technology
- [Next.js](https://nextjs.org/) for the amazing framework
- [TailwindCSS](https://tailwindcss.com/) for styling
- [MongoDB](https://mongodb.com/) for database

---

**Note**: This application requires camera and microphone permissions to function properly. Make sure to grant these permissions when prompted by your browser.
