# 🐳 Guía de Despliegue con Docker

Esta guía describe cómo desplegar la aplicación Gym Full usando Docker en diferentes entornos.

## 📋 Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Arquitectura](#arquitectura)
- [Despliegue Rápido](#despliegue-rápido)
- [Entornos](#entornos)
- [Comandos Útiles](#comandos-útiles)
- [Configuración](#configuración)
- [Troubleshooting](#troubleshooting)

## Prerrequisitos

- Docker (versión 20.10 o superior)
- Docker Compose (versión 2.0 o superior)
- Node.js 20+ (para desarrollo local)

## Arquitectura

La aplicación está dividida en dos servicios principales:

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (React +      │    │   (NestJS)      │
│   Vite + Nginx) │    │                 │
│   Puerto: 3000  │◄──►│  Puerto: 3001   │
└─────────────────┘    └─────────────────┘
```

### Servicios

- **Frontend**: Aplicación React con Vite servida por Nginx
- **Backend**: API NestJS con TypeScript
- **Red**: Comunicación interna entre servicios

## Despliegue Rápido

### 🚀 Producción (Recomendado)

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd gym-full

# 2. Construir y ejecutar
./docker-deploy.sh build
./docker-deploy.sh run

# 3. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### 🛠️ Desarrollo

```bash
# Ejecutar en modo desarrollo con hot reload
./docker-deploy.sh build-dev
./docker-deploy.sh run-dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3002
```

# Ejecutar contenedor de desarrollo
npm run docker:run-dev

# Detener contenedores
npm run docker:stop

# Limpiar contenedores e imágenes
npm run docker:clean
```

### Script de Gestión (`./docker-scripts.sh`)

| Comando | Descripción |
|---------|-------------|
| `build` | Construir imagen de producción |
| `build-dev` | Construir imagen de desarrollo |
| `run` | Ejecutar contenedor de producción |
| `run-dev` | Ejecutar contenedor de desarrollo |
| `stop` | Detener todos los contenedores |
| `clean` | Limpiar contenedores e imágenes |
| `logs` | Mostrar logs de producción |
| `logs-dev` | Mostrar logs de desarrollo |
| `shell` | Acceder al shell de producción |
| `shell-dev` | Acceder al shell de desarrollo |

## 🌐 Puertos y URLs

- **Producción**: http://localhost:3000
- **Desarrollo**: http://localhost:5173

## 📁 Estructura de Archivos Docker

```
├── Dockerfile              # Imagen de producción con Nginx
├── Dockerfile.dev          # Imagen de desarrollo con hot reload
├── docker-compose.yml      # Orquestación de servicios
├── nginx.conf              # Configuración de Nginx
├── docker-scripts.sh       # Script de gestión
└── .dockerignore           # Archivos a ignorar en build
```

## 🔧 Configuración

### Producción

La imagen de producción:
- Usa Node.js 20 Alpine para construir
- Usa Nginx Alpine para servir
- Optimizada para tamaño y rendimiento
- Incluye configuración de cache y seguridad

### Desarrollo

La imagen de desarrollo:
- Usa Node.js 20 Alpine
- Incluye hot reload
- Monta el código fuente como volumen
- Perfecto para desarrollo activo

## 🚀 Despliegue

### Construcción para Producción

```bash
# Construir imagen
docker build -t gymapp:latest .

# Ejecutar contenedor
docker run -d -p 3000:80 --name gymapp gymapp:latest
```

### Con Docker Compose

```bash
# Ejecutar en background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## 🔍 Solución de Problemas

### Puerto ya en uso

Si el puerto está en uso, cambiar en `docker-compose.yml`:

```yaml
ports:
  - "3001:80"  # Cambiar 3000 por 3001
```

### Problemas de permisos

En sistemas Linux/macOS:

```bash
sudo docker-compose up -d
```

### Limpiar todo

Para empezar desde cero:

```bash
./docker-scripts.sh clean
# o
docker system prune -a --volumes
```

## 📊 Optimizaciones

### Imagen de Producción

- **Multi-stage build** para reducir tamaño
- **Alpine Linux** para imagen mínima
- **Nginx optimizado** para SPA
- **Compresión gzip** habilitada
- **Headers de seguridad** configurados

### Imagen de Desarrollo

- **Hot reload** para desarrollo ágil
- **Volume mounting** para cambios en tiempo real
- **Port mapping** para acceso local

## 🛡️ Seguridad

Las imágenes incluyen:

- Headers de seguridad HTTP
- Usuario no-root para ejecutar la aplicación
- Configuración de CORS apropiada
- Validación de entrada en Nginx

## 📝 Notas

- La aplicación se reinicia automáticamente si el contenedor falla
- Los logs están disponibles via `docker-compose logs`
- Las imágenes se pueden personalizar editando los Dockerfiles
- Para producción, considera usar un orquestador como Kubernetes
