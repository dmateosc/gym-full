# 🐳 GymApp - Guía de Docker

Esta guía explica cómo ejecutar la aplicación GymApp usando Docker para un desarrollo y despliegue consistente.

## 📋 Prerrequisitos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado

## 🚀 Inicio Rápido

### Usando Docker Compose (Recomendado)

```bash
# Ejecutar en modo producción
docker-compose up -d

# Ejecutar en modo desarrollo
docker-compose --profile dev up -d
```

### Usando el Script de Gestión

```bash
# Hacer el script ejecutable (solo la primera vez)
chmod +x docker-scripts.sh

# Ver comandos disponibles
./docker-scripts.sh help

# Ejecutar en producción
./docker-scripts.sh run

# Ejecutar en desarrollo
./docker-scripts.sh run-dev
```

## 🛠️ Comandos Disponibles

### Scripts NPM

```bash
# Construir imagen de producción
npm run docker:build

# Construir imagen de desarrollo
npm run docker:build-dev

# Ejecutar contenedor de producción
npm run docker:run

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
