#!/bin/bash

# 🔍 Script de Verificación Post-Deployment
# Verifica que tanto frontend como backend estén funcionando correctamente

echo "🚀 Verificación de Deployment - Gym Exercise App"
echo "================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs de producción
BACKEND_URL="https://gym-exercise-backend.vercel.app"
FRONTEND_URL="https://gym-exercise-frontend.vercel.app"
API_URL="${BACKEND_URL}/api"

echo -e "${BLUE}🔍 Verificando Backend...${NC}"
echo "URL: $BACKEND_URL"

# Test 1: Health Check del Backend
echo -n "  ⏳ Health check... "
if curl -f -s "$API_URL/exercises" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo -e "${YELLOW}  Reintentando en 10 segundos...${NC}"
    sleep 10
    if curl -f -s "$API_URL/exercises" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ OK (segundo intento)${NC}"
    else
        echo -e "  ${RED}❌ FAILED (segundo intento)${NC}"
    fi
fi

# Test 2: API Endpoints
echo -n "  ⏳ API /exercises... "
EXERCISES_COUNT=$(curl -s "$API_URL/exercises" | jq '. | length' 2>/dev/null || echo "0")
if [ "$EXERCISES_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ OK ($EXERCISES_COUNT ejercicios)${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo -n "  ⏳ API /exercises/categories... "
if curl -f -s "$API_URL/exercises/categories" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo -n "  ⏳ API /routines/daily/today... "
if curl -f -s "$API_URL/routines/daily/today" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️ 404 (normal si no hay rutina)${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Verificando Frontend...${NC}"
echo "URL: $FRONTEND_URL"

# Test 3: Frontend accessibility
echo -n "  ⏳ Accesibilidad... "
if curl -f -s "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo ""
echo -e "${BLUE}🔗 Verificando CORS...${NC}"

# Test 4: CORS verification
echo -n "  ⏳ CORS desde frontend... "
CORS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS "$API_URL/exercises")

if [ "$CORS_RESPONSE" = "204" ] || [ "$CORS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED (HTTP $CORS_RESPONSE)${NC}"
fi

echo ""
echo -e "${BLUE}📊 Resumen de Estado:${NC}"
echo "=================================="
echo -e "Backend:  ${BACKEND_URL}"
echo -e "Frontend: ${FRONTEND_URL}"
echo -e "API:      ${API_URL}"
echo ""
echo -e "${YELLOW}💡 Para ver logs detallados:${NC}"
echo "GitHub Actions: https://github.com/dmateosc/gym-full/actions"
echo "Vercel Backend: https://vercel.com/dmateoscanos-projects/backend"
echo "Vercel Frontend: https://vercel.com/dmateoscanos-projects/frontend"
echo ""

# Test 5: Local development check
if [ -f "package.json" ]; then
    echo -e "${BLUE}🛠️ Verificando entorno local...${NC}"
    echo -n "  ⏳ Dependencias instaladas... "
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${YELLOW}⚠️ Ejecutar: npm install${NC}"
    fi
    
    echo -n "  ⏳ Backend local disponible... "
    if curl -f -s "http://localhost:3001/api/exercises" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${YELLOW}⚠️ Backend local no ejecutándose${NC}"
    fi
    
    echo -n "  ⏳ Frontend local disponible... "
    if curl -f -s "http://localhost:5173" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${YELLOW}⚠️ Frontend local no ejecutándose${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎯 Verificación completada!${NC}"
