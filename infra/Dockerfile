# Multi-stage Dockerfile para Frontend y Backend
# Este Dockerfile construye tanto el frontend como el backend en un solo archivo

# ==========================================
# STAGE 1: Build Frontend (React + Vite)
# ==========================================
FROM node:20-alpine as frontend-builder

WORKDIR /app

# Copiar archivos de configuración del monorepo
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

# Instalar dependencias
RUN npm ci --workspace=apps/frontend

# Copiar código fuente del frontend
COPY apps/frontend ./apps/frontend
COPY tsconfig*.json ./

# Construir el frontend
RUN npm run frontend:build

# ==========================================
# STAGE 2: Build Backend (NestJS)
# ==========================================
FROM node:20-alpine as backend-builder

WORKDIR /app

# Copiar archivos de configuración del monorepo
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Instalar dependencias
RUN npm ci --workspace=apps/backend

# Copiar código fuente del backend
COPY apps/backend ./apps/backend
COPY tsconfig*.json ./

# Construir el backend
RUN npm run backend:build

# ==========================================
# STAGE 3: Nginx + Frontend (Producción)
# ==========================================
FROM nginx:alpine as frontend-production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar archivos construidos del frontend
COPY --from=frontend-builder /app/apps/frontend/dist /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear directorio para logs
RUN mkdir -p /var/log/nginx

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]

# ==========================================
# STAGE 4: Backend Production Runtime
# ==========================================
FROM node:20-alpine as backend-production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Instalar curl para health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Instalar solo dependencias de producción
RUN npm ci --only=production --workspace=apps/backend && \
    npm cache clean --force

# Copiar aplicación construida
COPY --from=backend-builder --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=backend-builder --chown=nestjs:nodejs /app/apps/backend/package.json ./apps/backend/

# Cambiar al usuario no-root
USER nestjs

# Exponer puerto 3001
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Comando para ejecutar la aplicación
CMD ["node", "apps/backend/dist/main"]

# ==========================================
# STAGE 5: Development - Frontend
# ==========================================
FROM node:20-alpine as frontend-development

WORKDIR /app

# Copiar archivos de configuración del monorepo
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

# Instalar todas las dependencias (incluyendo dev)
RUN npm install

# Exponer puerto 5173 (Vite dev server)
EXPOSE 5173

# Variables de entorno para desarrollo
ENV NODE_ENV=development

# Comando para desarrollo con hot reload
CMD ["npm", "run", "frontend:dev", "--", "--host", "0.0.0.0"]

# ==========================================
# STAGE 6: Development - Backend
# ==========================================
FROM node:20-alpine as backend-development

WORKDIR /app

# Copiar archivos de configuración del monorepo
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Instalar todas las dependencias (incluyendo dev)
RUN npm install

# Exponer puerto 3001
EXPOSE 3001

# Variables de entorno para desarrollo
ENV NODE_ENV=development
ENV PORT=3001

# Comando para desarrollo con hot reload
CMD ["npm", "run", "backend:dev"]
