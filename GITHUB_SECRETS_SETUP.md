# 🔐 GitHub Secrets Configuration for Auto Deployment

Para habilitar el deployment automático, configura estos secrets en GitHub:

## 📍 GitHub Repository Settings
Ve a: **Settings → Secrets and Variables → Actions**

## 🔑 Required Secrets:

### VERCEL_TOKEN
1. Ejecuta: `npx vercel login`
2. Genera token: `npx vercel token create "GitHub Actions"`
3. Copia el token generado

### VERCEL_ORG_ID
```bash
# Ejecuta desde apps/frontend:
cat .vercel/project.json | grep orgId
```

### VERCEL_PROJECT_ID (Frontend)
```bash
# Ejecuta desde apps/frontend:
cat .vercel/project.json | grep projectId
```

### VERCEL_PROJECT_ID_BACKEND (Backend)
```bash
# Ejecuta desde apps/backend:
cat .vercel/project.json | grep projectId
```

## 🚀 Resultado Final

Una vez configurados los secrets, cada push a `main` ejecutará:

1. ✅ Tests del backend y frontend
2. 🔧 Deploy del backend API
3. 🎨 Deploy del frontend app
4. 📢 Confirmación de deployment exitoso

## URLs de Producción

- **Frontend**: https://centro-wellness-sierra-de-gata-79cfu2fes-dmateoscanos-projects.vercel.app
- **Backend**: https://centro-wellness-sierra-de-gata-back.vercel.app
- **API Docs**: https://centro-wellness-sierra-de-gata-back.vercel.app/api/docs

## 📝 Ejecutar Setup Automático

```bash
# Ejecutar script helper:
./setup-github-secrets.sh
```
