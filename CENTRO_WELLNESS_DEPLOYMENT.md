# 🏋️ Centro Wellness Sierra de Gata - Deployment Guide

## 🎯 Configuración de Dominios

Este proyecto está configurado para usar dominios fijos en Vercel:

- **Frontend**: `https://centro-wellness-sierra-de-gata.vercel.app`
- **Backend**: `https://centro-wellness-sierra-de-gata-backend.vercel.app`
- **API**: `https://centro-wellness-sierra-de-gata-backend.vercel.app/api`

## 🚀 Deployment Automático

### 1. Configuración de GitHub Secrets

Ejecuta el script para obtener los valores necesarios:
```bash
./setup-github-secrets.sh
```

Configura estos secrets en GitHub (Settings → Secrets and Variables → Actions):
- `VERCEL_TOKEN` - Token de acceso a Vercel
- `VERCEL_ORG_ID` - ID de la organización
- `VERCEL_PROJECT_ID` - ID del proyecto frontend
- `VERCEL_PROJECT_ID_BACKEND` - ID del proyecto backend

### 2. Configuración de Dominios

Ejecuta el script para configurar los dominios fijos:
```bash
./setup-vercel-domains.sh
```

### 3. Deployment Pipeline

El deployment es completamente automático:
1. **Push a `main`** → Activa el workflow
2. **Tests** → Frontend y Backend
3. **Deploy Backend** → Vercel Serverless
4. **Deploy Frontend** → Vercel Static
5. **Summary** → Resultados del deployment

## 🔧 Configuración Local

### Variables de Entorno

**Frontend** (`.env.local`):
```env
VITE_API_BASE_URL=https://centro-wellness-sierra-de-gata-backend.vercel.app/api
```

**Backend** (`.env.local`):
```env
DATABASE_URL=your_supabase_connection_string
NODE_ENV=development
```

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar tests
npm run test

# Build para producción
npm run build
```

## 🌐 URLs de Producción

- **Aplicación Web**: https://centro-wellness-sierra-de-gata.vercel.app
- **API Backend**: https://centro-wellness-sierra-de-gata-backend.vercel.app/api
- **Health Check**: https://centro-wellness-sierra-de-gata-backend.vercel.app/api/health

## 📊 Monitoreo

### CI/CD Status
- **GitHub Actions**: Ve a Actions tab en GitHub
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Deployment Logs**: Disponibles en cada workflow run

### Health Checks
```bash
# API Health Check
curl https://centro-wellness-sierra-de-gata-backend.vercel.app/api/health

# Frontend Health Check
curl https://centro-wellness-sierra-de-gata.vercel.app
```

## 🔒 Seguridad

### CORS Configuration
El backend está configurado para permitir:
- `localhost` (desarrollo)
- `*.vercel.app` con patrones específicos
- Dominios que contengan: `centro`, `wellness`, `gym`, `exercise`

### Environment Variables
- ✅ Usa variables de entorno para configuración
- ❌ No hardcodea URLs en el código
- 🔐 Secrets están protegidos en GitHub

## 🚨 Troubleshooting

### Deployment Falló
1. Verificar secrets de GitHub están configurados
2. Revisar logs en GitHub Actions
3. Verificar que los proyectos estén linkeados en Vercel

### CORS Errors
1. Verificar que el dominio esté en la whitelist
2. Comprobar que la URL del backend sea correcta
3. Revisar logs del backend en Vercel

### Database Connection
1. Verificar `DATABASE_URL` en Vercel
2. Comprobar que Supabase esté accesible
3. Revisar logs de conexión

## 📞 Support

Para issues técnicos:
1. Revisar logs en GitHub Actions
2. Comprobar Vercel Dashboard
3. Verificar configuración de dominios
4. Consultar documentación de troubleshooting

---

## 🎨 Customización

### Cambiar Dominios
1. Actualizar `setup-vercel-domains.sh`
2. Modificar URLs en `.github/workflows/main-deployment.yml`
3. Actualizar `app.config.ts` en el frontend
4. Ejecutar script de configuración

### Añadir Environment Variables
1. Configurar en Vercel Dashboard
2. Añadir al workflow de GitHub Actions
3. Documentar en este archivo

---

*Última actualización: $(date)*
