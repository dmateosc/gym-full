# 🌐 Configuración de Dominios Fijos en Vercel

## 📊 Problema Actual
Los deployments de Vercel generan URLs dinámicas que cambian con cada deploy:
- `https://frontend-vpw4wj9cw-dmateoscanos-projects.vercel.app` (cambia)
- `https://backend-48ihtvc0d-dmateoscanos-projects.vercel.app` (cambia)

## 🎯 Solución: Configurar Dominios de Producción Fijos

### 📋 Paso 1: Configurar Frontend Domain

1. **Ve al dashboard de Vercel Frontend:**
   - https://vercel.com/dmateoscanos-projects/[tu-proyecto-frontend]

2. **Ir a Settings → Domains:**
   - Agregar dominio: `gym-exercise-frontend.vercel.app`
   - Marcar como **Production Domain**

3. **Verificar configuración:**
   ```
   Production: gym-exercise-frontend.vercel.app
   Preview: [nombre-aleatorio].vercel.app
   ```

### 📋 Paso 2: Configurar Backend Domain

1. **Ve al dashboard de Vercel Backend:**
   - https://vercel.com/dmateoscanos-projects/[tu-proyecto-backend]

2. **Ir a Settings → Domains:**
   - Agregar dominio: `gym-exercise-backend.vercel.app`
   - Marcar como **Production Domain**

3. **Verificar configuración:**
   ```
   Production: gym-exercise-backend.vercel.app
   Preview: [nombre-aleatorio].vercel.app
   ```

### 📋 Paso 3: Actualizar Project Names

1. **Frontend Project:**
   - Settings → General → Project Name
   - Cambiar a: `gym-exercise-frontend`

2. **Backend Project:**
   - Settings → General → Project Name
   - Cambiar a: `gym-exercise-backend`

## 🔧 Configuraciones Ya Actualizadas

### Frontend (`vercel.json`):
```json
{
  "env": {
    "VITE_API_BASE_URL": "https://gym-exercise-backend.vercel.app/api"
  }
}
```

### Backend CORS Configuration:
```typescript
const origins = [
  'https://gym-exercise-frontend.vercel.app',
  'https://gym-exercise-backend.vercel.app',
  // Patrones para preview deployments
]
```

## 🚀 Comandos CLI Alternativos

Si prefieres usar Vercel CLI:

```bash
# 1. Configurar frontend
cd apps/frontend
vercel alias https://[current-frontend-url].vercel.app gym-exercise-frontend.vercel.app

# 2. Configurar backend  
cd apps/backend
vercel alias https://[current-backend-url].vercel.app gym-exercise-backend.vercel.app
```

## ✅ Beneficios

1. **URLs Consistentes**: Nunca cambiarán en producción
2. **CORS Estable**: No necesidad de actualizar configuración
3. **SEO Friendly**: URLs fijas para indexación
4. **Fácil Memorización**: Nombres descriptivos
5. **Environment Variables**: Configuración limpia

## 🔄 Proceso de Deploy

1. **GitHub Push** → **GitHub Actions** → **Vercel Deploy**
2. **Production Deploy** → `gym-exercise-*.vercel.app`
3. **Preview Deploy** → `[random-name].vercel.app`

## 📊 Verificación

Después de configurar, verificar:

1. **Frontend Production**: https://gym-exercise-frontend.vercel.app
2. **Backend Production**: https://gym-exercise-backend.vercel.app/api
3. **CORS Test**: Verificar conexión entre frontend y backend

## 🚨 Notas Importantes

- Los dominios `.vercel.app` son **gratuitos**
- Solo proyectos **Pro** pueden usar dominios custom externos
- Los preview deployments seguirán teniendo URLs dinámicas
- La configuración se aplica solo a **production deployments**

---

**🎯 Resultado Final:** URLs de producción fijas que nunca cambiarán, facilitando el mantenimiento y la configuración CORS.
