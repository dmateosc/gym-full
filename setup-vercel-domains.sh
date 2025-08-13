#!/bin/bash

# 🔧 Script para configurar dominios fijos en Vercel
# Configuración del Centro Wellness Sierra de Gata

set -e

echo "🏋️ Configurando dominios para Centro Wellness Sierra de Gata..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI no está instalado${NC}"
    echo "Instalando Vercel CLI..."
    npm install -g vercel@latest
fi

echo -e "${BLUE}📋 Configuración de dominios:${NC}"
echo "  Frontend: centro-wellness-sierra-de-gata.vercel.app"
echo "  Backend:  centro-wellness-sierra-de-gata-backend.vercel.app"
echo ""

# Configurar dominio para Frontend
echo -e "${YELLOW}🎨 Configurando dominio del Frontend...${NC}"
cd apps/frontend

# Verificar que el proyecto esté vinculado
if [ ! -d ".vercel" ]; then
    echo -e "${YELLOW}🔗 Vinculando proyecto del frontend...${NC}"
    vercel link
fi

# Obtener la URL actual del deployment
echo -e "${BLUE}📡 Obteniendo URL actual del frontend...${NC}"
FRONTEND_URL=$(vercel ls --token="$VERCEL_TOKEN" | grep -E 'https://.*\.vercel\.app' | head -1 | awk '{print $2}')

if [ -n "$FRONTEND_URL" ]; then
    echo -e "${GREEN}✅ URL actual del frontend: $FRONTEND_URL${NC}"
    
    # Crear alias para el dominio fijo
    echo -e "${YELLOW}🔗 Creando alias centro-wellness-sierra-de-gata.vercel.app...${NC}"
    vercel alias set "$FRONTEND_URL" centro-wellness-sierra-de-gata.vercel.app --token="$VERCEL_TOKEN" || true
    
    echo -e "${GREEN}✅ Dominio del frontend configurado${NC}"
else
    echo -e "${RED}❌ No se pudo obtener la URL del frontend${NC}"
fi

cd ../..

# Configurar dominio para Backend
echo -e "${YELLOW}🚀 Configurando dominio del Backend...${NC}"
cd apps/backend

# Verificar que el proyecto esté vinculado
if [ ! -d ".vercel" ]; then
    echo -e "${YELLOW}🔗 Vinculando proyecto del backend...${NC}"
    vercel link
fi

# Obtener la URL actual del deployment
echo -e "${BLUE}📡 Obteniendo URL actual del backend...${NC}"
BACKEND_URL=$(vercel ls --token="$VERCEL_TOKEN" | grep -E 'https://.*\.vercel\.app' | head -1 | awk '{print $2}')

if [ -n "$BACKEND_URL" ]; then
    echo -e "${GREEN}✅ URL actual del backend: $BACKEND_URL${NC}"
    
    # Crear alias para el dominio fijo
    echo -e "${YELLOW}🔗 Creando alias centro-wellness-sierra-de-gata-backend.vercel.app...${NC}"
    vercel alias set "$BACKEND_URL" centro-wellness-sierra-de-gata-backend.vercel.app --token="$VERCEL_TOKEN" || true
    
    echo -e "${GREEN}✅ Dominio del backend configurado${NC}"
else
    echo -e "${RED}❌ No se pudo obtener la URL del backend${NC}"
fi

cd ../..

echo ""
echo -e "${GREEN}🎉 Configuración de dominios completada!${NC}"
echo ""
echo -e "${BLUE}🌐 URLs de la aplicación:${NC}"
echo "  📱 Frontend: https://centro-wellness-sierra-de-gata.vercel.app"
echo "  🔧 Backend:  https://centro-wellness-sierra-de-gata-backend.vercel.app"
echo "  📡 API:      https://centro-wellness-sierra-de-gata-backend.vercel.app/api"
echo ""
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo "1. Configurar variables de entorno en Vercel"
echo "2. Hacer push a main para activar el CI/CD"
echo "3. Verificar que los dominios funcionen correctamente"
