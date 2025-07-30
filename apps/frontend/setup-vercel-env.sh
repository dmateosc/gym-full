#!/bin/bash
# Script para configurar variables de entorno del frontend en Vercel

echo "🎨 Configurando variables de entorno del frontend en Vercel..."

# Variable principal: URL del backend API
echo "📝 Configurando VITE_API_BASE_URL..."
vercel env add VITE_API_BASE_URL production

# Variables opcionales para el frontend
echo "📝 Configurando variables opcionales..."
vercel env add VITE_APP_TITLE production
vercel env add VITE_APP_VERSION production

echo "✅ Variables de entorno del frontend configuradas!"
echo ""
echo "🔧 Para configurar manualmente:"
echo "1. Ve a https://vercel.com/dmateoscanos-projects/gym-full"
echo "2. Settings → Environment Variables"
echo "3. Agrega: VITE_API_BASE_URL = https://gym-exercise-backend.vercel.app/api"
echo ""
echo "🚀 Ejecuta 'vercel --prod' para redesplegar con las nuevas variables"
