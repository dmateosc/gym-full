# Dockerfile para Backend - Heroku Deploy
FROM node:20-alpine AS builder

# Instalar dependencias para compilación
RUN apk add --no-cache python3 make g++

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar build de la etapa anterior
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Cambiar al usuario no-root
USER nestjs

# Exponer puerto (Heroku asigna PORT dinámicamente)
EXPOSE $PORT

# Configurar variables de entorno por defecto
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:prod"]
