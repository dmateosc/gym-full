# 🏗️ Infraestructura - Dockerfile Unificado

Este directorio contiene la configuración de infraestructura para el despliegue de la aplicación Gym Full.

## 📁 Contenido

- `Dockerfile` - Dockerfile unificado con múltiples stages para frontend y backend

## 🐳 Dockerfile Unificado

El Dockerfile está dividido en **6 stages** que permiten construir tanto el frontend como el backend desde un solo archivo:

### Stages de Build

1. **`frontend-builder`** - Construye la aplicación React con Vite
2. **`backend-builder`** - Construye la aplicación NestJS

### Stages de Producción

3. **`frontend-production`** - Nginx sirviendo archivos estáticos del frontend
4. **`backend-production`** - Runtime optimizado para la API NestJS

### Stages de Desarrollo

5. **`frontend-development`** - Servidor de desarrollo Vite con hot reload
6. **`backend-development`** - Servidor de desarrollo NestJS con hot reload

## 🚀 Uso

### Construcción

```bash
# Frontend de producción
docker build -f infra/Dockerfile --target frontend-production -t gymapp-frontend .

# Backend de producción
docker build -f infra/Dockerfile --target backend-production -t gymapp-backend .

# Frontend de desarrollo
docker build -f infra/Dockerfile --target frontend-development -t gymapp-frontend:dev .

# Backend de desarrollo
docker build -f infra/Dockerfile --target backend-development -t gymapp-backend:dev .
```

### Con Docker Compose

```bash
# Producción
docker-compose up -d frontend backend

# Desarrollo
docker-compose --profile dev up -d frontend-dev backend-dev
```

## 🔧 Características

### Optimizaciones de Producción

- **Multi-stage builds** para imágenes más pequeñas
- **Usuario no-root** en backend para seguridad
- **Health checks** integrados
- **Nginx optimizado** para SPA
- **Cache de dependencias** eficiente

### Desarrollo

- **Hot reload** completo
- **Volúmenes montados** para cambios en tiempo real
- **Puertos separados** para evitar conflictos
- **Variables de entorno** configuradas

### Seguridad

- Usuario no-root en producción
- Health checks automáticos
- Configuración de Nginx segura
- Variables de entorno controladas

## 📊 Tamaños de Imagen

Las imágenes están optimizadas para ser lo más pequeñas posibles:

- **Frontend (producción)**: ~25MB (Alpine + Nginx)
- **Backend (producción)**: ~150MB (Alpine + Node + deps)
- **Frontend (desarrollo)**: ~300MB (con dev deps)
- **Backend (desarrollo)**: ~250MB (con dev deps)

## 🌐 Puertos

### Producción
- Frontend: Puerto 80
- Backend: Puerto 3001

### Desarrollo
- Frontend: Puerto 5173
- Backend: Puerto 3001

## 🏥 Health Checks

Ambos servicios incluyen health checks:

- **Frontend**: `curl -f http://localhost/`
- **Backend**: `curl -f http://localhost:3001/health`

## 🔄 Comandos Útiles

```bash
# Ver logs del build
docker build -f infra/Dockerfile --target frontend-production --progress=plain .

# Inspeccionar imagen
docker inspect gymapp-frontend:latest

# Ejecutar shell en contenedor
docker run -it --rm gymapp-frontend:dev /bin/sh

# Ver tamaño de capas
docker history gymapp-frontend:latest
```

## 📝 Notas

- El Dockerfile está optimizado para el contexto del monorepo
- Las dependencias se instalan por workspace
- Los builds utilizan `npm ci` para mayor velocidad
- Cache de Docker optimizado por capas
- Soporte completo para development y production

---

Para más información sobre el uso, consulta el [README principal](../README.md) o la [documentación de Docker](../DOCKER.md).
