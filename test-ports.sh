#!/bin/bash

echo "🔍 Testing both development and production servers..."
echo

echo "📋 Port status:"
echo "Port 5173 (Dev):"
lsof -i :5173 | head -1
lsof -i :5173 | grep LISTEN || echo "  ❌ Not running"
echo

echo "Port 3000 (Docker):"
lsof -i :3000 | head -1  
lsof -i :3000 | grep LISTEN || echo "  ❌ Not running"
echo

echo "🌐 HTTP Response Tests:"
echo "Testing localhost:5173 (Development):"
curl -s -o /dev/null -w "  Status: %{http_code} | Size: %{size_download} bytes | Time: %{time_total}s\n" http://localhost:5173

echo "Testing localhost:3000 (Production):"
curl -s -o /dev/null -w "  Status: %{http_code} | Size: %{size_download} bytes | Time: %{time_total}s\n" http://localhost:3000

echo
echo "📱 Quick content check:"
echo "Production HTML title:"
curl -s http://localhost:3000 | grep -o '<title>.*</title>' || echo "  ❌ No title found"

echo "Development HTML title:"
curl -s http://localhost:5173 | grep -o '<title>.*</title>' || echo "  ❌ No title found"

echo
echo "🔧 Asset check (Production):"
echo "CSS file:"
curl -s -o /dev/null -w "  Status: %{http_code} | Size: %{size_download} bytes\n" http://localhost:3000/assets/index-CcBF4gzI.css

echo "JS file:"
curl -s -o /dev/null -w "  Status: %{http_code} | Size: %{size_download} bytes\n" http://localhost:3000/assets/index-IUndGJ1X.js

echo
echo "✅ Test completed. Both servers should be accessible:"
echo "  🔨 Development: http://localhost:5173"
echo "  🐳 Production:  http://localhost:3000"
