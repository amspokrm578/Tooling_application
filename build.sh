#!/bin/bash
set -e

echo "\n🔧 Tooling Application Build Script\n"

# Check Node.js and npm
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js."
  exit 1
fi
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed. Please install npm."
  exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"

# Backend setup
echo "\n📦 Installing backend dependencies..."
npm install
if [ ! -f .env ]; then
  echo "PORT=3000\nNODE_ENV=development\nJWT_SECRET=your-super-secret-jwt-key-change-this-in-production" > .env
  echo "⚠️  Created backend .env file. Update JWT_SECRET for production."
fi

echo "\n📦 Installing frontend dependencies..."
cd Borrow
npm install
if ! npm list @react-native-async-storage/async-storage &> /dev/null; then
  npm install @react-native-async-storage/async-storage
fi
if [ ! -f .env ]; then
  echo "EXPO_PUBLIC_API_URL=http://localhost:3000" > .env
fi
cd ..

echo "\n✅ All dependencies installed."
echo "\nTo test backend:   npm run dev"
echo "To test frontend: cd Borrow && npm start"
echo "\nTo run both, use two terminals." 