#!/bin/bash

# Script para gestionar la aplicación Docker de GymApp

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}GymApp Docker Management Script${NC}"
    echo ""
    echo "Uso: ./docker-scripts.sh [COMANDO]"
    echo ""
    echo "Comandos disponibles:"
    echo "  build         Construir la imagen de producción"
    echo "  build-dev     Construir la imagen de desarrollo"
    echo "  run           Ejecutar contenedor de producción"
    echo "  run-dev       Ejecutar contenedor de desarrollo"
    echo "  stop          Detener todos los contenedores"
    echo "  clean         Limpiar contenedores e imágenes"
    echo "  logs          Mostrar logs del contenedor de producción"
    echo "  logs-dev      Mostrar logs del contenedor de desarrollo"
    echo "  shell         Acceder al shell del contenedor de producción"
    echo "  shell-dev     Acceder al shell del contenedor de desarrollo"
    echo "  help          Mostrar esta ayuda"
    echo ""
}

# Función para construir imagen de producción
build_prod() {
    echo -e "${YELLOW}Construyendo imagen de producción...${NC}"
    docker build -t gymapp:latest .
    echo -e "${GREEN}Imagen de producción construida exitosamente${NC}"
}

# Función para construir imagen de desarrollo
build_dev() {
    echo -e "${YELLOW}Construyendo imagen de desarrollo...${NC}"
    docker build -f Dockerfile.dev -t gymapp:dev .
    echo -e "${GREEN}Imagen de desarrollo construida exitosamente${NC}"
}

# Función para ejecutar contenedor de producción
run_prod() {
    echo -e "${YELLOW}Ejecutando contenedor de producción...${NC}"
    docker-compose up -d gymapp
    echo -e "${GREEN}Aplicación ejecutándose en http://localhost:3000${NC}"
}

# Función para ejecutar contenedor de desarrollo
run_dev() {
    echo -e "${YELLOW}Ejecutando contenedor de desarrollo...${NC}"
    docker-compose --profile dev up -d gymapp-dev
    echo -e "${GREEN}Aplicación de desarrollo ejecutándose en http://localhost:5173${NC}"
}

# Función para detener contenedores
stop_containers() {
    echo -e "${YELLOW}Deteniendo contenedores...${NC}"
    docker-compose down
    echo -e "${GREEN}Contenedores detenidos${NC}"
}

# Función para limpiar contenedores e imágenes
clean_docker() {
    echo -e "${YELLOW}Limpiando contenedores e imágenes...${NC}"
    docker-compose down --rmi all --volumes --remove-orphans
    docker system prune -f
    echo -e "${GREEN}Limpieza completada${NC}"
}

# Función para mostrar logs de producción
logs_prod() {
    echo -e "${YELLOW}Mostrando logs del contenedor de producción...${NC}"
    docker-compose logs -f gymapp
}

# Función para mostrar logs de desarrollo
logs_dev() {
    echo -e "${YELLOW}Mostrando logs del contenedor de desarrollo...${NC}"
    docker-compose logs -f gymapp-dev
}

# Función para acceder al shell de producción
shell_prod() {
    echo -e "${YELLOW}Accediendo al shell del contenedor de producción...${NC}"
    docker-compose exec gymapp sh
}

# Función para acceder al shell de desarrollo
shell_dev() {
    echo -e "${YELLOW}Accediendo al shell del contenedor de desarrollo...${NC}"
    docker-compose exec gymapp-dev sh
}

# Procesar argumentos
case "${1}" in
    build)
        build_prod
        ;;
    build-dev)
        build_dev
        ;;
    run)
        run_prod
        ;;
    run-dev)
        run_dev
        ;;
    stop)
        stop_containers
        ;;
    clean)
        clean_docker
        ;;
    logs)
        logs_prod
        ;;
    logs-dev)
        logs_dev
        ;;
    shell)
        shell_prod
        ;;
    shell-dev)
        shell_dev
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Comando no reconocido: ${1}${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
