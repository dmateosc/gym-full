# 🚀 Deployment Guide - Gym Exercise App

## 📋 Resumen

Esta aplicación utiliza una arquitectura separada:
- **Frontend**: React + Vite → GitHub Pages
- **Backend**: NestJS + PostgreSQL → Heroku

## 🎯 Setup Inicial

### 1. Configurar GitHub Pages
1. Ve a **Settings** → **Pages** en tu repositorio
2. Source: **GitHub Actions**
3. ✅ Auto-deploy habilitado

### 2. Configurar Heroku
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app (si no existe)
heroku create gym-exercise-backend

# Verificar
heroku apps
```

### 3. Configurar GitHub Secrets
Ve a **Settings** → **Secrets and variables** → **Actions**:

```
HEROKU_API_KEY=tu-api-key-de-heroku
HEROKU_EMAIL=tu-email@heroku.com
DATABASE_URL=postgresql://user:pass@host:port/db
DATABASE_HOST=tu-host.supabase.co
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=tu-password
DATABASE_NAME=postgres
```

## 🔄 Proceso de Deploy

### Automático (Recomendado)
```bash
# 1. Hacer cambios en apps/frontend/ o apps/backend/
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# 2. GitHub Actions automáticamente:
#    ✅ Ejecuta tests
#    🏗️ Build de la aplicación
#    🚀 Deploy a producción
```

### Manual (Emergencias)
```bash
# Frontend - Manual deploy
gh workflow run deploy.yml

# Backend - Manual deploy  
gh workflow run heroku-deploy.yml
```

## 🌐 URLs de Producción

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | https://dmateosc.github.io/gym-full/ | Aplicación React |
| Backend API | https://gym-exercise-backend.herokuapp.com/api | API NestJS |
| Exercises | https://gym-exercise-backend.herokuapp.com/api/exercises | Endpoint principal |

## 🔍 Verificación Post-Deploy

### Frontend
```bash
# Verificar que el sitio carga
curl -I https://dmateosc.github.io/gym-full/

# Verificar en navegador
open https://dmateosc.github.io/gym-full/
```

### Backend
```bash
# Health check
curl https://gym-exercise-backend.herokuapp.com/api/exercises

# Verificar categorías
curl https://gym-exercise-backend.herokuapp.com/api/exercises/categories
```

## 📊 Monitoreo

### GitHub Actions
1. Ve a **Actions** tab en GitHub
2. Verifica status de workflows:
   - ✅ **Deploy to GitHub Pages**
   - ✅ **Deploy Backend to Heroku**

### Heroku Logs
```bash
# Logs en tiempo real
heroku logs --tail --app gym-exercise-backend

# Logs específicos del deploy
heroku logs --num=100 --app gym-exercise-backend | grep "State changed"
```

### Status de la App
```bash
# Verificar estado de la app
heroku ps --app gym-exercise-backend

# Información de la app
heroku info --app gym-exercise-backend
```

## 🆘 Troubleshooting Rápido

### ❌ Deploy del Frontend Falla
```bash
# 1. Verificar build local
cd apps/frontend
npm run build

# 2. Verificar logs en GitHub Actions
# 3. Re-ejecutar workflow si es necesario
```

### ❌ Deploy del Backend Falla
```bash
# 1. Verificar secrets en GitHub
# 2. Verificar logs de Heroku
heroku logs --app gym-exercise-backend

# 3. Verificar variables de entorno
heroku config --app gym-exercise-backend

# 4. Restart manual si es necesario
heroku restart --app gym-exercise-backend
```

### ❌ API No Responde
```bash
# 1. Verificar status
curl -I https://gym-exercise-backend.herokuapp.com/

# 2. Verificar logs
heroku logs --tail --app gym-exercise-backend

# 3. Verificar conexión a base de datos
heroku logs --grep="database" --app gym-exercise-backend
```

## 🔧 Comandos Útiles

### Heroku
```bash
# Abrir app en navegador
heroku open --app gym-exercise-backend

# Ejecutar bash en el dyno
heroku run bash --app gym-exercise-backend

# Ver variables de entorno
heroku config --app gym-exercise-backend

# Restart de la aplicación
heroku restart --app gym-exercise-backend

# Escalar dynos
heroku ps:scale web=1 --app gym-exercise-backend
```

### GitHub CLI
```bash
# Ver workflows
gh workflow list

# Ejecutar workflow manualmente
gh workflow run deploy.yml
gh workflow run heroku-deploy.yml

# Ver runs recientes
gh run list
```

## 🔄 Rollback

### Frontend (GitHub Pages)
1. Ve a **Actions** → último deploy exitoso
2. **Re-run all jobs**

### Backend (Heroku)
```bash
# Ver releases
heroku releases --app gym-exercise-backend

# Rollback
heroku rollback v[número] --app gym-exercise-backend
```

---

## 📞 Contacto

Si tienes problemas con el deployment, revisa:
1. 📖 [CI_CD.md](./CI_CD.md) - Documentación completa
2. 🛠️ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Guía de resolución de problemas
3. 🔧 **GitHub Issues** - Para reportar bugs del deployment
