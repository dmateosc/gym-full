# 🚀 Guía de Despliegue en Vercel - Frontend

## 📋 Resumen

Esta guía te ayuda a desplegar el frontend de la aplicación GymApp en Vercel, conectándolo al backend ya desplegado.

## 🎯 URLs de Producción

- **Frontend**: https://vercel.com/dmateoscanos-projects/gym-full
- **Backend**: https://gym-exercise-backend.vercel.app/api

## 🔧 Configuración de Variables de Entorno

### En el Dashboard de Vercel

1. Ve a https://vercel.com/dmateoscanos-projects/gym-full
2. **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

```bash
# Variable principal - URL del backend API
VITE_API_BASE_URL=https://gym-exercise-backend.vercel.app/api

# Variables opcionales
VITE_APP_TITLE=GymApp - Ejercicios
VITE_APP_VERSION=1.0.0
```

### Usando la CLI de Vercel

```bash
# Desde el directorio apps/frontend
cd apps/frontend

# Configurar automáticamente
npm run setup-env

# O manualmente
vercel env add VITE_API_BASE_URL production
# Valor: https://gym-exercise-backend.vercel.app/api
```

## 🚀 Despliegue

### Opción 1: Desde el directorio frontend

```bash
cd apps/frontend

# Despliegue a producción
npm run deploy

# Preview deploy
npm run deploy:preview
```

### Opción 2: Usando Vercel CLI directamente

```bash
# Desde el directorio frontend
cd apps/frontend

# Producción
vercel --prod

# Preview
vercel
```

### Opción 3: Git-based deployment (Recomendado)

1. Haz commit de tus cambios
2. Push a la rama `main`
3. Vercel desplegará automáticamente

## 🔍 Verificación

### 1. Verificar el Frontend

```bash
# Verificar que el sitio carga
curl -I https://gym-full-dmateoscanos-projects.vercel.app/

# En navegador
open https://gym-full-dmateoscanos-projects.vercel.app/
```

### 2. Verificar la Conexión al Backend

1. Abre las herramientas de desarrollo del navegador
2. Ve a la consola
3. Busca estos logs:
   ```
   🔗 API Base URL: https://gym-exercise-backend.vercel.app/api
   🌍 Environment: production
   📝 VITE_API_BASE_URL: https://gym-exercise-backend.vercel.app/api
   ```

### 3. Probar la Funcionalidad

- Los ejercicios deben cargar correctamente
- Los filtros deben funcionar
- No debe haber errores de CORS

## 🛠️ Estructura de Archivos

```
apps/frontend/
├── vercel.json              # Configuración de Vercel
├── .env.local              # Variables locales (no commiteado)
├── .env.example            # Ejemplo de variables
├── setup-vercel-env.sh     # Script de configuración
└── src/
    └── services/
        └── api.ts          # Configuración automática de API URL
```

## 🔄 Flujo de Desarrollo

### Desarrollo Local

```bash
# Con backend local
VITE_API_BASE_URL=http://localhost:3001/api npm run dev

# Con backend de Vercel
VITE_API_BASE_URL=https://gym-exercise-backend.vercel.app/api npm run dev
```

### Despliegue

1. **Desarrollo** → `vercel` (preview deployment)
2. **Producción** → `vercel --prod` o push a `main`

## 🆘 Troubleshooting

### ❌ "API not responding"

```bash
# Verificar backend
curl https://gym-exercise-backend.vercel.app/api/exercises

# Verificar variables de entorno
vercel env ls
```

### ❌ "CORS errors"

- Verificar que el backend incluye el dominio del frontend en la configuración de CORS
- El backend debe permitir: `https://gym-full-dmateoscanos-projects.vercel.app`

### ❌ "Build failing"

```bash
# Probar build local
npm run build

# Verificar logs en Vercel dashboard
```

## 📚 Enlaces Útiles

- [Vercel Dashboard](https://vercel.com/dmateoscanos-projects)
- [Frontend URL](https://gym-full-dmateoscanos-projects.vercel.app)
- [Backend API](https://gym-exercise-backend.vercel.app/api)
- [Documentación de Vercel](https://vercel.com/docs)
