#!/bin/bash

# Fix Vercel Frontend Deployment - Asset 404 Errors
# This script rebuilds and redeploys the frontend with proper configuration

set -e

echo "🔧 Fixing Vercel Frontend Deployment..."

# Navigate to frontend directory
cd "$(dirname "$0")"

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/
rm -rf node_modules/.vite/

# Install dependencies from root to ensure proper monorepo setup
echo "📦 Installing dependencies..."
cd ../../
npm install

# Build frontend
echo "🏗️  Building frontend..."
npm run frontend:build

# Verify build output
echo "✅ Verifying build output..."
if [ -d "apps/frontend/dist" ]; then
    echo "✅ Build directory exists"
    if [ -f "apps/frontend/dist/index.html" ]; then
        echo "✅ index.html exists"
    else
        echo "❌ index.html missing"
        exit 1
    fi
    
    if [ -d "apps/frontend/dist/assets" ]; then
        echo "✅ Assets directory exists"
        echo "📂 Assets found:"
        ls -la apps/frontend/dist/assets/
    else
        echo "❌ Assets directory missing"
        exit 1
    fi
else
    echo "❌ Build directory missing"
    exit 1
fi

echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel with these settings:"
echo "   - Project name: gym-exercise-frontend"
echo "   - Root directory: apps/frontend"
echo "   - Framework: Vite"
echo "   - Build command: cd ../../ && npm run frontend:build"
echo "   - Output directory: dist"
echo ""
echo "2. Environment variables:"
echo "   - VITE_API_BASE_URL=https://gym-exercise-backend.vercel.app/api"
echo ""
echo "3. Or use Vercel CLI:"
echo "   cd apps/frontend && vercel --prod"
echo ""
