# 🚀 CI/CD Pipeline - Gym Exercise App

## 📋 Descripción

Este proyecto incluye un pipeline de CI/CD completamente automatizado usando GitHub Actions para desplegar:
- **Frontend**: GitHub Pages (React + Vite)
- **Backend**: Heroku (NestJS + PostgreSQL)

## 🔄 Workflows Configurados

### 1. 🏋️ CI/CD Principal (`ci-cd.yml`)
**Trigger:** Push a `main` o `develop`, Pull Requests a `main`

**Jobs:**
- **🧪 Tests y Linting**: Verifica el código y ejecuta linting
- **🐳 Docker Build**: Construye la imagen Docker (solo en `main`)

### 2. 🚀 Deploy Frontend a GitHub Pages (`deploy.yml`)
**Trigger:** Push a `main` con cambios en `apps/frontend/`, manual dispatch

**Jobs:**
- **🏗️ Build**: Construye la aplicación React para producción
- **🚀 Deploy**: Despliega automáticamente a GitHub Pages

### 3. 🚀 Deploy Backend a Heroku (`heroku-deploy.yml`)
**Trigger:** Push a `main` con cambios en `apps/backend/`, manual dispatch

**Jobs:**
- **🧪 Tests**: Ejecuta linting y tests del backend
- **🏗️ Build**: Construye la aplicación NestJS
- **🚀 Deploy**: Despliega automáticamente a Heroku con Docker

## 🛠️ Configuración Requerida

### 1. Habilitar GitHub Pages
1. Ve a **Settings** → **Pages** en tu repositorio
2. Selecciona **Source**: "GitHub Actions"
3. El despliegue será automático en cada push a `main`

### 2. Configurar Heroku Deploy
Necesitas configurar los siguientes **secrets** en GitHub:

#### 🔐 GitHub Secrets Requeridos:
```
HEROKU_API_KEY=tu-heroku-api-key
HEROKU_EMAIL=tu-email@heroku.com
DATABASE_URL=postgresql://usuario:password@host:puerto/db
DATABASE_HOST=tu-host.supabase.co
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=tu-password
DATABASE_NAME=postgres
```

#### 📝 Cómo obtener HEROKU_API_KEY:
1. Ve a [Heroku Account Settings](https://dashboard.heroku.com/account)
2. Scroll hasta "API Key" y revela la clave
3. Copia y pégala en GitHub Secrets

### 3. Scripts de Package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "preview": "vite preview"
  }
}
```

## 🌐 URLs de Despliegue

### Desarrollo Local
```bash
# Frontend
cd apps/frontend && npm run dev
# http://localhost:5173

# Backend  
cd apps/backend && npm run start:dev
# http://localhost:3001
```

### Producción
```bash
# Frontend (GitHub Pages)
https://dmateosc.github.io/gym-full/

# Backend (Heroku)
https://gym-exercise-backend.herokuapp.com/api

# API Endpoints de ejemplo:
# https://gym-exercise-backend.herokuapp.com/api/exercises
# https://gym-exercise-backend.herokuapp.com/api/exercises/categories
```

### Docker Local (Opcional)
```bash
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## 🔄 Flujo de Trabajo

### Para Desarrollo
1. Crea una rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios en `apps/frontend/` o `apps/backend/`
3. Push: `git push origin feature/nueva-funcionalidad`
4. Crea un Pull Request hacia `main`

### Para Producción
1. Merge el PR a `main`
2. **Automático**: GitHub Actions despliega automáticamente:
   - Si hay cambios en `apps/frontend/` → GitHub Pages
   - Si hay cambios en `apps/backend/` → Heroku
2. El CI/CD automáticamente:
   - ✅ Ejecuta tests y linting
   - 🏗️ Construye la aplicación
   - 🐳 Crea imagen Docker
   - 🚀 Despliega a GitHub Pages

## 📊 Monitoreo

### Estado de Despliegues
- ✅ **Green**: Despliegue exitoso
- ❌ **Red**: Falló el despliegue
- 🟡 **Yellow**: En progreso

### Logs
1. Ve a **Actions** tab en GitHub
2. Selecciona el workflow run
3. Revisa los logs de cada job

## 🔧 Comandos Útiles

### Desarrollo Local
```bash
# Instalar dependencias
npm ci

# Ejecutar en desarrollo
npm run dev

# Linting
npm run lint
npm run lint:fix

# Build de producción
npm run build

# Preview del build
npm run preview
```

### Docker
```bash
# Build y run
npm run docker:build
npm run docker:run

# Parar contenedores
npm run docker:stop

# Limpiar todo
npm run docker:clean
```

## 🛡️ Características de Seguridad

- ✅ Linting automático en cada push
- ✅ Build verification antes de deploy
- ✅ Solo despliegue desde rama `main`
- ✅ Artifacts temporales (1 día retention)
- ✅ Permisos mínimos requeridos

## 📈 Optimizaciones

- **Cache de npm**: Reutiliza dependencias entre builds
- **Docker cache**: Optimiza tiempo de build de imágenes
- **Artifacts**: Solo archivos necesarios para deploy
- **Concurrency**: Cancela builds anteriores en progreso

## 🆘 Troubleshooting

### Frontend (GitHub Pages) - Build falla
1. Revisa los logs del job "Build"
2. Verifica que las dependencias estén actualizadas
3. Ejecuta `npm run build` localmente en `apps/frontend/`
4. Verifica que el path del artifact sea correcto: `apps/frontend/dist`

### Backend (Heroku) - Deploy falla
1. **Verifica Secrets en GitHub**:
   - `HEROKU_API_KEY`: Debe ser válida y no expirada
   - `HEROKU_EMAIL`: Email asociado a tu cuenta Heroku
   - `DATABASE_*`: Variables de conexión a Supabase

2. **Verifica la App en Heroku**:
   ```bash
   # Crear app si no existe
   heroku create gym-exercise-backend
   
   # Verificar variables de entorno
   heroku config --app gym-exercise-backend
   ```

3. **Logs de Heroku**:
   ```bash
   # Ver logs en tiempo real
   heroku logs --tail --app gym-exercise-backend
   
   # Ver logs específicos
   heroku logs --num=200 --app gym-exercise-backend
   ```

4. **Problemas comunes**:
   - **Puerto**: Heroku asigna PORT dinámicamente, asegúrate de usar `process.env.PORT`
   - **Base de datos**: Verifica conexión a Supabase con las credenciales correctas
   - **CORS**: URLs de frontend deben estar permitidas en main.ts

### Base de Datos - Conexión falla
1. **Verifica credenciales de Supabase**:
   - URL, puerto, usuario, contraseña, nombre de BD
   - Verifica que la contraseña no tenga caracteres especiales sin escape

2. **Testa conexión local**:
   ```bash
   cd apps/backend
   npm run start:dev
   # Verifica logs de conexión TypeORM
   ```

3. **Verifica variables en Heroku**:
   ```bash
   heroku config:get DATABASE_URL --app gym-exercise-backend
   ```

### Cache Issues
```bash
# Limpiar cache de npm
npm cache clean --force

# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install

# Limpiar cache de GitHub Actions
# Ve a Settings → Actions → Caches y elimina cache obsoleto
```

## 🔄 Rollback en Caso de Problemas

### Frontend (GitHub Pages)
1. Ve a **Actions** → **Deploy to GitHub Pages**
2. Selecciona un deploy anterior exitoso
3. Click "Re-run all jobs"

### Backend (Heroku)
```bash
# Ver releases
heroku releases --app gym-exercise-backend

# Rollback a versión anterior
heroku rollback v[numero-version] --app gym-exercise-backend
```

## 📞 Soporte y Referencias

- 📖 [GitHub Actions Docs](https://docs.github.com/en/actions)
- 🚀 [Heroku Deploy Action](https://github.com/akhileshns/heroku-deploy)
- 📄 [GitHub Pages Deploy](https://github.com/actions/deploy-pages)
- 🐳 [Docker GitHub Actions](https://github.com/docker/build-push-action)

---

**✨ Pipeline Status**: 
- Frontend: [![Deploy Frontend](https://github.com/dmateosc/gym-full/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/dmateosc/gym-full/actions)
- Backend: [![Deploy Backend](https://github.com/dmateosc/gym-full/workflows/Deploy%20Backend%20to%20Heroku/badge.svg)](https://github.com/dmateosc/gym-full/actions)
