#!/bin/bash

# 🔧 Script para configurar dominios fijos en Vercel
# Configura gym-exercise-frontend.vercel.app y gym-exercise-backend.vercel.app

echo "🌐 Configuración de Dominios Fijos en Vercel"
echo "============================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI no está instalado${NC}"
    echo -e "${YELLOW}💡 Instalar con: npm i -g vercel${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Configurando dominios fijos para ambos proyectos...${NC}"
echo ""

# Frontend Domain Setup
echo -e "${BLUE}🌐 Configurando Frontend: gym-exercise-frontend.vercel.app${NC}"
cd apps/frontend

# Link and configure frontend
echo "  ⏳ Vinculando proyecto frontend..."
vercel link --confirm

echo "  ⏳ Configurando dominio fijo para frontend..."
vercel domains add gym-exercise-frontend.vercel.app --yes || echo "  ℹ️ Dominio ya configurado"

echo ""

# Backend Domain Setup  
echo -e "${BLUE}🚀 Configurando Backend: gym-exercise-backend.vercel.app${NC}"
cd ../backend

# Link and configure backend
echo "  ⏳ Vinculando proyecto backend..."
vercel link --confirm

echo "  ⏳ Configurando dominio fijo para backend..."
vercel domains add gym-exercise-backend.vercel.app --yes || echo "  ℹ️ Dominio ya configurado"

echo ""
cd ../..

echo -e "${GREEN}✅ Configuración de dominios completada!${NC}"
echo ""
echo -e "${BLUE}📊 URLs de Producción:${NC}"
echo "=================================="
echo -e "🌐 Frontend: ${GREEN}https://gym-exercise-frontend.vercel.app${NC}"
echo -e "🚀 Backend:  ${GREEN}https://gym-exercise-backend.vercel.app${NC}"
echo -e "📡 API:      ${GREEN}https://gym-exercise-backend.vercel.app/api${NC}"
echo ""

echo -e "${YELLOW}💡 Próximos pasos:${NC}"
echo "1. Los deployments automáticos usarán estos dominios fijos"
echo "2. El frontend ya está configurado para usar la API fija"
echo "3. CORS está configurado para ambos dominios"
echo "4. Las GitHub Actions manejarán deployments futuros"
echo ""

echo -e "${BLUE}🔗 Enlaces útiles:${NC}"
echo "GitHub Actions: https://github.com/dmateosc/gym-full/actions"
echo "Vercel Dashboard: https://vercel.com/dmateoscanos-projects"
echo "Documentación: ./VERCEL_FIXED_DOMAINS_SETUP.md"
