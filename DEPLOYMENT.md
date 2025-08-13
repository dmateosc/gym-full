# 🚀 CI/CD Configuration Guide

## GitHub Actions Automated Deployment

Este proyecto utiliza GitHub Actions para automatizar completamente el proceso de deployment. **No necesitas ejecutar comandos manuales de Vercel**.

### 📋 Workflows Configurados

1. **🚀 Production Deployment** (`main-deployment.yml`)
   - Se ejecuta automáticamente en cada push a `main`
   - Secuencia: Tests → Deploy Backend → Deploy Frontend
   - Deploy a URLs de producción

2. **🔍 Preview Deployment** (`vercel-preview.yml`)
   - Se ejecuta en push a otras ramas y PRs
   - Tests rápidos + deployment de preview
   - URLs temporales para testing

3. **🧪 CI/CD Tests** (`ci-cd.yml`)
   - Tests y linting en todas las ramas
   - Verifica calidad del código antes de merge

### 🔑 Secrets Necesarios en GitHub

Para que el deployment automático funcione, necesitas configurar estos secrets en tu repositorio de GitHub:

#### Paso 1: Obtener Vercel Token
```bash
vercel login
npx vercel-token create
```

#### Paso 2: Obtener Organization ID
```bash
vercel org ls
```

#### Paso 3: Obtener Project IDs
```bash
# Para el frontend
cd apps/frontend
vercel link
cat .vercel/project.json

# Para el backend  
cd apps/backend
vercel link
cat .vercel/project.json
```

#### Paso 4: Configurar en GitHub
Ve a `Settings → Secrets and Variables → Actions` y añade:

- `VERCEL_TOKEN`: Tu token de Vercel
- `VERCEL_ORG_ID`: ID de tu organización
- `VERCEL_PROJECT_ID`: Project ID del frontend
- `VERCEL_PROJECT_ID_BACKEND`: Project ID del backend

### 🔄 Flujo de Trabajo

#### Deployment a Producción
1. Haz push a `main` (o merge PR)
2. GitHub Actions ejecuta automáticamente:
   - ✅ Tests frontend y backend
   - 🚀 Deploy backend a producción
   - 🎨 Deploy frontend a producción
3. ✅ App disponible en producción

#### Preview Deployments
1. Crea rama feature: `git checkout -b feature/mi-feature`
2. Haz push: `git push origin feature/mi-feature`
3. GitHub Actions ejecuta automáticamente:
   - ✅ Tests rápidos
   - 🔍 Deploy preview temporal
4. 📋 URL de preview disponible en el PR

### 🚫 Lo que NO debes hacer

- ❌ `npm run deploy:frontend`
- ❌ `npm run deploy:backend`  
- ❌ `vercel deploy` manual
- ❌ Configurar deployment local

### ✅ Lo que SÍ debes hacer

- ✅ `git push origin main` (deployment automático)
- ✅ Crear PRs (preview automático)
- ✅ Verificar que los secrets estén configurados
- ✅ Revisar logs en GitHub Actions si hay errores

### 🔧 Troubleshooting

#### Error: "VERCEL_TOKEN not found"
- Verifica que el secret esté configurado en GitHub
- Regenera el token si es necesario

#### Error: "Project not found"
- Verifica los Project IDs en los secrets
- Asegúrate de que los proyectos estén linkeados correctamente

#### Error de Build
- Revisa los logs en la pestaña "Actions" del repositorio
- Los errores suelen ser de TypeScript o dependencias

### 📱 URLs de la App

- **🏠 Producción**: https://gym-full.vercel.app
- **🔗 API Producción**: https://gym-exercise-backend.vercel.app/api
- **🔍 Preview**: URLs temporales generadas automáticamente

### 🎯 Próximos Pasos

Una vez configurados los secrets, el deployment será 100% automático. Solo necesitas:

1. Desarrollar tu feature
2. Hacer commit y push
3. ✨ GitHub Actions se encarga del resto

¡No más comandos manuales de deployment! 🎉
