# 🚀 CI/CD Pipeline - Gym Exercise App

## 📋 Descripción

Pipeline automatizado usando GitHub Actions para desplegar en:
- **Frontend**: GitHub Pages + Vercel
- **Backend**: Vercel

## 🔄 Workflows

### 1. 🏋️ CI/CD Principal (`ci-cd.yml`)
- **Trigger**: Push/PR a main/develop
- **Jobs**: Tests, Linting, Build
- **Monorepo**: Maneja frontend y backend por separado

### 2. 🚀 GitHub Pages (`deploy.yml`)  
- **Trigger**: Push a main con cambios en frontend
- **Deploy**: https://dmateosc.github.io/gym-full/

### 3. 🚀 Vercel (`vercel.yml`)
- **Trigger**: Push a main, Pull Requests
- **Deploy**: Frontend y Backend a Vercel
- **Preview**: Cada PR genera preview deployments

## 🛠️ Setup Rápido

### GitHub Secrets
```bash
VERCEL_TOKEN=<token-from-vercel>
VERCEL_ORG_ID=<org-id-from-vercel>
VERCEL_PROJECT_ID=<frontend-project-id>
VERCEL_PROJECT_ID_BACKEND=<backend-project-id>
```

### Comandos
```bash
# Enlazar proyectos
npm run vercel:link-frontend
npm run vercel:link-backend

# Development
npm run dev

# Testing  
npm run test

# Build
npm run build
```

## 🌐 URLs

| Servicio | URL |
|----------|-----|
| Frontend (GitHub Pages) | https://dmateosc.github.io/gym-full/ |
| Frontend (Vercel) | https://gym-full.vercel.app |
| Backend API | https://gym-exercise-backend.vercel.app/api |

## 🆘 Troubleshooting

### Deploy falla
1. Verificar GitHub Secrets
2. Verificar logs en Actions tab
3. Re-ejecutar workflow si es necesario

### Tests fallan
```bash
npm run test
```

### Build falla
```bash
npm run build
```
