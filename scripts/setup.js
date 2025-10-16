#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Interview Eye Tracker...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  const envContent = `MONGO_URI=mongodb+srv://souravrooj_db_user:oeP6tCbps8FekxoU@cluster0.wqgilyl.mongodb.net/interviewdb
NEXT_PUBLIC_API_URL=http://localhost:3000`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local created');
} else {
  console.log('✅ .env.local already exists');
}

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
} else {
  console.log('✅ Uploads directory exists');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Make sure MongoDB is running');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:3000');
console.log('\n📖 Check README.md for detailed instructions');
