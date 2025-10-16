#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Pre-deployment Check for Vercel...\n');

const checks = [];

// Check if package.json exists and has required scripts
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.scripts && packageJson.scripts.build) {
    checks.push({ name: 'Build script', status: '✅', message: 'Found' });
  } else {
    checks.push({ name: 'Build script', status: '❌', message: 'Missing build script' });
  }
  
  if (packageJson.dependencies && packageJson.dependencies.next) {
    checks.push({ name: 'Next.js dependency', status: '✅', message: `Version ${packageJson.dependencies.next}` });
  } else {
    checks.push({ name: 'Next.js dependency', status: '❌', message: 'Next.js not found' });
  }
} else {
  checks.push({ name: 'package.json', status: '❌', message: 'Not found' });
}

// Check if vercel.json exists
const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
if (fs.existsSync(vercelJsonPath)) {
  checks.push({ name: 'vercel.json', status: '✅', message: 'Configuration file exists' });
} else {
  checks.push({ name: 'vercel.json', status: '⚠️', message: 'Optional configuration file missing' });
}

// Check if .env.local exists (should not be in git)
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  checks.push({ name: '.env.local', status: '⚠️', message: 'Exists (should not be committed to git)' });
} else {
  checks.push({ name: '.env.local', status: '✅', message: 'Not found (good for deployment)' });
}

// Check if .gitignore exists and contains .env.local
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env*.local')) {
    checks.push({ name: '.gitignore', status: '✅', message: 'Properly configured' });
  } else {
    checks.push({ name: '.gitignore', status: '⚠️', message: 'Should include .env*.local' });
  }
} else {
  checks.push({ name: '.gitignore', status: '❌', message: 'Not found' });
}

// Check if uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (fs.existsSync(uploadsDir)) {
  checks.push({ name: 'Uploads directory', status: '✅', message: 'Exists' });
} else {
  checks.push({ name: 'Uploads directory', status: '⚠️', message: 'Will be created automatically' });
}

// Display results
console.log('📋 Deployment Readiness Check:\n');
checks.forEach(check => {
  console.log(`${check.status} ${check.name}: ${check.message}`);
});

console.log('\n🚀 Next Steps:');
console.log('1. Commit and push your code to GitHub');
console.log('2. Go to vercel.com and import your repository');
console.log('3. Set environment variables in Vercel dashboard');
console.log('4. Deploy!');

console.log('\n📖 See VERCEL_DEPLOYMENT.md for detailed instructions');

// Check for potential issues
const errors = checks.filter(check => check.status === '❌');
const warnings = checks.filter(check => check.status === '⚠️');

if (errors.length > 0) {
  console.log('\n🚨 Fix these issues before deploying:');
  errors.forEach(error => console.log(`   - ${error.name}: ${error.message}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️ Consider addressing these warnings:');
  warnings.forEach(warning => console.log(`   - ${warning.name}: ${warning.message}`));
}

if (errors.length === 0) {
  console.log('\n🎉 Your project looks ready for Vercel deployment!');
}
