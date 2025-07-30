#!/bin/bash
# Script para configurar variables de entorno en Vercel de forma segura
# Este script lee del archivo .env local y configura las variables en Vercel

echo "🔐 Configurando variables de entorno en Vercel..."

# Leer variables del archivo .env y configurarlas en Vercel
vercel env add DATABASE_URL production
vercel env add DATABASE_HOST production  
vercel env add DATABASE_PORT production
vercel env add DATABASE_USERNAME production
vercel env add DATABASE_PASSWORD production
vercel env add DATABASE_NAME production
vercel env add NODE_ENV production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production

echo "✅ Variables de entorno configuradas!"
echo "🚀 Ejecuta 'vercel --prod' para redesplegar con las nuevas variables"
