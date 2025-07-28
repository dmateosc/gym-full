#!/bin/bash

# Script para gestionar el despliegue con Docker
# Uso: ./docker-deploy.sh [comando]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}=== Script de Despliegue Docker para Gym App ===${NC}"
    echo ""
    echo "Comandos disponibles:"
    echo "  build         - Construir imágenes de producción"
    echo "  build-dev     - Construir imágenes de desarrollo"
    echo "  run           - Ejecutar en modo producción"
    echo "  run-dev       - Ejecutar en modo desarrollo"
    echo "  stop          - Detener todos los contenedores"
    echo "  restart       - Reiniciar servicios de producción"
    echo "  restart-dev   - Reiniciar servicios de desarrollo"
    echo "  logs          - Ver logs de todos los servicios"
    echo "  logs-frontend - Ver logs del frontend"
    echo "  logs-backend  - Ver logs del backend"
    echo "  clean         - Limpiar contenedores e imágenes"
    echo "  status        - Ver estado de los contenedores"
    echo "  help          - Mostrar esta ayuda"
    echo ""
}

# Función para verificar si Docker está corriendo
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Error: Docker no está corriendo${NC}"
        exit 1
    fi
}

# Función para construir imágenes de producción
build_production() {
    echo -e "${YELLOW}Construyendo imágenes de producción...${NC}"
    docker build -f infra/Dockerfile --target frontend-production -t gymapp-frontend:latest .
    docker build -f infra/Dockerfile --target backend-production -t gymapp-backend:latest .
    echo -e "${GREEN}✓ Imágenes de producción construidas exitosamente${NC}"
}

# Función para construir imágenes de desarrollo
build_development() {
    echo -e "${YELLOW}Construyendo imágenes de desarrollo...${NC}"
    docker build -f infra/Dockerfile --target frontend-development -t gymapp-frontend:dev .
    docker build -f infra/Dockerfile --target backend-development -t gymapp-backend:dev .
    echo -e "${GREEN}✓ Imágenes de desarrollo construidas exitosamente${NC}"
}

# Función para ejecutar en producción
run_production() {
    echo -e "${YELLOW}Iniciando servicios de producción...${NC}"
    docker-compose up -d frontend backend
    echo -e "${GREEN}✓ Servicios de producción iniciados${NC}"
    echo -e "${BLUE}Frontend disponible en: http://localhost:3000${NC}"
    echo -e "${BLUE}Backend disponible en: http://localhost:3001${NC}"
}

# Función para ejecutar en desarrollo
run_development() {
    echo -e "${YELLOW}Iniciando servicios de desarrollo...${NC}"
    docker-compose --profile dev up -d frontend-dev backend-dev
    echo -e "${GREEN}✓ Servicios de desarrollo iniciados${NC}"
    echo -e "${BLUE}Frontend (dev) disponible en: http://localhost:5173${NC}"
    echo -e "${BLUE}Backend (dev) disponible en: http://localhost:3002${NC}"
}

# Función para detener servicios
stop_services() {
    echo -e "${YELLOW}Deteniendo todos los servicios...${NC}"
    docker-compose down
    echo -e "${GREEN}✓ Servicios detenidos${NC}"
}

# Función para mostrar logs
show_logs() {
    case $1 in
        "frontend")
            docker-compose logs -f frontend
            ;;
        "backend")
            docker-compose logs -f backend
            ;;
        *)
            docker-compose logs -f
            ;;
    esac
}

# Función para mostrar estado
show_status() {
    echo -e "${BLUE}=== Estado de los contenedores ===${NC}"
    docker-compose ps
    echo ""
    echo -e "${BLUE}=== Uso de recursos ===${NC}"
    docker stats --no-stream
}

# Función para limpiar
clean_all() {
    echo -e "${YELLOW}Limpiando contenedores, imágenes y volúmenes...${NC}"
    docker-compose down --rmi all --volumes --remove-orphans
    echo -e "${GREEN}✓ Limpieza completada${NC}"
}

# Verificar Docker
check_docker

# Procesar comando
case $1 in
    "build")
        build_production
        ;;
    "build-dev")
        build_development
        ;;
    "run")
        run_production
        ;;
    "run-dev")
        run_development
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        run_production
        ;;
    "restart-dev")
        stop_services
        sleep 2
        run_development
        ;;
    "logs")
        show_logs
        ;;
    "logs-frontend")
        show_logs "frontend"
        ;;
    "logs-backend")
        show_logs "backend"
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_all
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}Comando no reconocido: $1${NC}"
        show_help
        exit 1
        ;;
esac
