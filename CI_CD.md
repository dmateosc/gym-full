# 🚀 CI/CD Pipeline - Gym Exercise App

## 📋 Descripción

Este proyecto incluye un pipeline de CI/CD completamente automatizado usando GitHub Actions para desplegar la aplicación de ejercicios con estilo Netflix.

## 🔄 Workflows Configurados

### 1. 🏋️ CI/CD Principal (`ci-cd.yml`)
**Trigger:** Push a `main` o `develop`, Pull Requests a `main`

**Jobs:**
- **🧪 Tests y Linting**: Verifica el código y ejecuta linting
- **🐳 Docker Build**: Construye la imagen Docker (solo en `main`)

### 2. 🚀 Deploy a GitHub Pages (`deploy.yml`)
**Trigger:** Push a `main`, manual dispatch

**Jobs:**
- **🏗️ Build**: Construye la aplicación para producción
- **🚀 Deploy**: Despliega automáticamente a GitHub Pages

## 🛠️ Configuración Requerida

### 1. Habilitar GitHub Pages
1. Ve a **Settings** → **Pages** en tu repositorio
2. Selecciona **Source**: "GitHub Actions"
3. El despliegue será automático en cada push a `main`

### 2. Scripts de Package.json
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
npm run dev
# http://localhost:5173
```

### Producción Docker
```bash
docker-compose up
# http://localhost:3000
```

### GitHub Pages
```
https://[tu-usuario].github.io/gym-full/
```

## 🔄 Flujo de Trabajo

### Para Desarrollo
1. Crea una rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios
3. Push: `git push origin feature/nueva-funcionalidad`
4. Crea un Pull Request hacia `develop`

### Para Producción
1. Merge a `main` desde `develop`
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

### Build falla
1. Revisa los logs del job "Build"
2. Verifica que las dependencias estén actualizadas
3. Ejecuta `npm run build` localmente

### Deploy falla
1. Verifica que GitHub Pages esté habilitado
2. Revisa permisos del repositorio
3. Checa la configuración de `base` en `vite.config.ts`

### Docker build falla
1. Verifica el Dockerfile
2. Checa que todas las dependencias estén en package.json
3. Ejecuta build local: `npm run docker:build`

## 🎯 Próximos Pasos

- [ ] Agregar tests unitarios con Vitest
- [ ] Implementar notificaciones de Slack/Discord
- [ ] Agregar análisis de código con SonarQube
- [ ] Configurar deployment staging
- [ ] Implementar monitoring con Sentry
