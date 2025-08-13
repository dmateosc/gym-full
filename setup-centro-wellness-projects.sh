#!/bin/bash

# 🏋️ Centro Wellness Sierra de Gata - Configuración de Proyectos Vercel
# Este script configura los proyectos de Vercel con los nombres correctos

set -e

echo "🏋️ Configurando proyectos de Vercel para Centro Wellness Sierra de Gata..."

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI no está instalado${NC}"
    echo -e "${BLUE}Instalando Vercel CLI...${NC}"
    npm install -g vercel@latest
fi

# Función para configurar proyecto
configure_project() {
    local app_name=$1
    local project_name=$2
    local app_path="./apps/$app_name"
    
    echo -e "${BLUE}📦 Configurando $app_name como $project_name...${NC}"
    
    cd "$app_path"
    
    # Limpiar configuración anterior
    rm -rf .vercel
    
    # Configurar nuevo proyecto
    echo -e "${YELLOW}🔧 Configurando proyecto $project_name...${NC}"
    vercel link --project="$project_name" --yes || {
        echo -e "${YELLOW}⚠️  Proyecto no existe, creándolo...${NC}"
        vercel --name="$project_name" --yes
    }
    
    cd - > /dev/null
    echo -e "${GREEN}✅ $app_name configurado correctamente${NC}"
}

echo -e "${BLUE}🚀 Iniciando configuración...${NC}"

# Configurar frontend
configure_project "frontend" "centro-wellness-sierra-de-gata"

# Configurar backend
configure_project "backend" "centro-wellness-sierra-de-gata-backend"

echo ""
echo -e "${GREEN}🎉 ¡Configuración completada!${NC}"
echo ""
echo -e "${BLUE}📝 Proyectos configurados:${NC}"
echo -e "  🎨 Frontend: centro-wellness-sierra-de-gata"
echo -e "  🚀 Backend:  centro-wellness-sierra-de-gata-backend"
echo ""
echo -e "${YELLOW}⚡ Para desplegar:${NC}"
echo -e "  Frontend: cd apps/frontend && vercel --prod"
echo -e "  Backend:  cd apps/backend && vercel --prod"
echo ""
echo -e "${BLUE}🔗 URLs de producción:${NC}"
echo -e "  🌐 App: https://centro-wellness-sierra-de-gata.vercel.app"
echo -e "  🔗 API: https://centro-wellness-sierra-de-gata-backend.vercel.app/api"
