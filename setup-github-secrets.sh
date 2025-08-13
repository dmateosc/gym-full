#!/bin/bash

# 🔧 Script para configurar GitHub Secrets para deployment automático
# Este script te ayuda a obtener toda la información necesaria para configurar los secrets

echo "🚀 Configuración de GitHub Secrets para Deployment Automático"
echo "============================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "apps/frontend" ] || [ ! -d "apps/backend" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto gym-full${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Información actual de los proyectos Vercel:${NC}"
echo ""

# Frontend Project ID
if [ -f "apps/frontend/.vercel/project.json" ]; then
    FRONTEND_PROJECT_ID=$(cat apps/frontend/.vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Frontend Project ID encontrado:${NC} $FRONTEND_PROJECT_ID"
else
    echo -e "${RED}❌ Frontend Project ID no encontrado${NC}"
    echo -e "${YELLOW}   Ejecuta: cd apps/frontend && vercel link${NC}"
fi

# Backend Project ID  
if [ -f "apps/backend/.vercel/project.json" ]; then
    BACKEND_PROJECT_ID=$(cat apps/backend/.vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Backend Project ID encontrado:${NC} $BACKEND_PROJECT_ID"
else
    echo -e "${RED}❌ Backend Project ID no encontrado${NC}"
    echo -e "${YELLOW}   Ejecuta: cd apps/backend && vercel link${NC}"
fi

# Organization ID
if [ -f "apps/frontend/.vercel/project.json" ]; then
    ORG_ID=$(cat apps/frontend/.vercel/project.json | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Organization ID encontrado:${NC} $ORG_ID"
fi

echo ""
echo -e "${BLUE}🔑 Secrets que necesitas configurar en GitHub:${NC}"
echo "Ve a: Settings → Secrets and Variables → Actions"
echo ""

if [ ! -z "$ORG_ID" ]; then
    echo -e "${GREEN}VERCEL_ORG_ID${NC} = $ORG_ID"
else
    echo -e "${RED}VERCEL_ORG_ID${NC} = <necesitas hacer vercel link>"
fi

if [ ! -z "$FRONTEND_PROJECT_ID" ]; then
    echo -e "${GREEN}VERCEL_PROJECT_ID${NC} = $FRONTEND_PROJECT_ID"
else
    echo -e "${RED}VERCEL_PROJECT_ID${NC} = <necesitas hacer vercel link en frontend>"
fi

if [ ! -z "$BACKEND_PROJECT_ID" ]; then
    echo -e "${GREEN}VERCEL_PROJECT_ID_BACKEND${NC} = $BACKEND_PROJECT_ID"
else
    echo -e "${RED}VERCEL_PROJECT_ID_BACKEND${NC} = <necesitas hacer vercel link en backend>"
fi

echo -e "${YELLOW}VERCEL_TOKEN${NC} = <genera uno con: npx vercel login && vercel-token create>"

echo ""
echo -e "${BLUE}📝 Instrucciones completas:${NC}"
echo ""
echo "1. 🔐 Generar Vercel Token:"
echo "   vercel login"
echo "   npx vercel-token create"
echo ""
echo "2. 🔗 Verificar proyectos linkeados:"
echo "   cd apps/frontend && vercel link"
echo "   cd apps/backend && vercel link"
echo ""
echo "3. ⚙️  Configurar secrets en GitHub:"
echo "   - Ve a tu repo en GitHub"
echo "   - Settings → Secrets and Variables → Actions"
echo "   - Add repository secret para cada uno de los valores arriba"
echo ""
echo "4. 🚀 ¡Listo! El próximo push a main se deployará automáticamente"
echo ""

# Verificar si hay un token de Vercel configurado
if command -v vercel &> /dev/null; then
    echo -e "${BLUE}🔍 Verificando configuración de Vercel...${NC}"
    
    # Intentar obtener información del usuario (requiere login)
    if vercel whoami &> /dev/null; then
        VERCEL_USER=$(vercel whoami 2>/dev/null)
        echo -e "${GREEN}✅ Vercel CLI configurado para usuario:${NC} $VERCEL_USER"
    else
        echo -e "${YELLOW}⚠️  Vercel CLI no está logueado. Ejecuta: vercel login${NC}"
    fi
else
    echo -e "${RED}❌ Vercel CLI no está instalado. Ejecuta: npm install -g vercel${NC}"
fi

echo ""
echo -e "${GREEN}✨ Una vez configurados los secrets, el deployment será 100% automático!${NC}"
echo -e "${BLUE}📚 Más información en: DEPLOYMENT.md${NC}"
