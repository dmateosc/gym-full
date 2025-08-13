# 📖 Swagger API Documentation - Centro Wellness Sierra de Gata

## 🎯 Implementación Completada

Se ha implementado **Swagger/OpenAPI** completo para la documentación automática de la API del Centro Wellness Sierra de Gata.

### ✅ Características Implementadas

#### **🔧 Configuración Principal**
- ✅ **Swagger UI** configurado en `/api/docs`
- ✅ **Documentación automática** de todos los endpoints
- ✅ **Esquemas interactivos** para testing
- ✅ **Metadata completa** del proyecto

#### **📋 Endpoints Documentados**

**🏋️ Exercises (Ejercicios)**
- `GET /api/exercises` - Listar ejercicios con filtros
- `POST /api/exercises` - Crear nuevo ejercicio  
- `GET /api/exercises/categories` - Obtener categorías
- `GET /api/exercises/muscle-groups` - Obtener grupos musculares
- `GET /api/exercises/{id}` - Obtener ejercicio específico
- `PATCH /api/exercises/{id}` - Actualizar ejercicio
- `DELETE /api/exercises/{id}` - Eliminar ejercicio

**📅 Routines (Rutinas)**
- `GET /api/routines/daily` - Listar rutinas diarias
- `POST /api/routines/daily` - Crear rutina diaria
- `GET /api/routines/daily/by-date/{date}` - Rutina por fecha
- `GET /api/routines/daily/today` - Rutina de hoy

**🔍 Health (Monitoreo)**
- `GET /api/health` - Health check del servidor
- `GET /api` - Mensaje de bienvenida

#### **📊 DTOs Documentados**
- ✅ **CreateExerciseDto** - Esquema completo con ejemplos
- ✅ **UpdateExerciseDto** - Esquema de actualización
- ✅ **ExerciseFiltersDto** - Filtros de búsqueda
- ✅ **CreateDailyRoutineDto** - Creación de rutinas

## 🌐 URLs de Acceso

### **🏠 Desarrollo Local**
- **Swagger UI**: http://localhost:3001/api/docs
- **API Base**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

### **🚀 Producción**
- **Swagger UI**: https://centro-wellness-sierra-de-gata-backend.vercel.app/api/docs
- **API Base**: https://centro-wellness-sierra-de-gata-backend.vercel.app/api
- **Health Check**: https://centro-wellness-sierra-de-gata-backend.vercel.app/api/health

## 🎨 Personalización

### **🏷️ Metadata del Proyecto**
```typescript
.setTitle('Centro Wellness Sierra de Gata API')
.setDescription('🏋️ API REST completa para la gestión del Centro Wellness...')
.setVersion('1.0')
.addTag('exercises', 'Gestión de ejercicios y categorías')
.addTag('routines', 'Rutinas de entrenamiento')
.addTag('health', 'Endpoints de salud y monitoreo')
```

### **🎨 UI Personalizada**
- ✅ Título personalizado
- ✅ CSS custom con colores del proyecto
- ✅ Configuración avanzada de Swagger UI
- ✅ Persistencia de autorización

## 📚 Ejemplos de Uso

### **1. 🏋️ Crear Ejercicio**
```json
POST /api/exercises
{
  "name": "Flexiones de brazos",
  "description": "Ejercicio para fortalecer el pecho, tríceps y deltoides anteriores",
  "category": "strength",
  "difficulty": "intermediate",
  "muscleGroups": ["Pectorales", "Tríceps", "Deltoides"],
  "equipment": ["Ninguno", "Peso corporal"],
  "instructions": [
    "Colócate en posición de plancha con los brazos extendidos",
    "Baja el cuerpo doblando los codos",
    "Empuja hacia arriba hasta la posición inicial"
  ],
  "estimatedDuration": 15,
  "calories": 120
}
```

### **2. 📅 Crear Rutina**
```json
POST /api/routines/daily
{
  "name": "Rutina Fuerza Lunes",
  "date": "2025-08-14",
  "description": "Rutina enfocada en fuerza para el lunes",
  "exercises": [
    {
      "exerciseId": "uuid-exercise-1",
      "sets": 3,
      "reps": 12,
      "weight": 20
    }
  ]
}
```

### **3. 🔍 Filtrar Ejercicios**
```bash
GET /api/exercises?category=strength&difficulty=intermediate&muscleGroup=Pectorales
```

## 🚀 Deployment

### **📦 Dependencias Instaladas**
```json
{
  "@nestjs/swagger": "^11.2.0",
  "swagger-ui-express": "^5.0.1"
}
```

### **⚙️ Configuración en Producción**
- ✅ Swagger disponible en producción en Vercel
- ✅ URLs de servidor configuradas automáticamente
- ✅ CORS habilitado para Swagger UI
- ✅ Documentación actualizada en cada deployment

## 🔧 Comandos Útiles

### **🛠️ Desarrollo**
```bash
# Iniciar servidor con Swagger
npm run start:dev

# Acceder a documentación
open http://localhost:3001/api/docs

# Verificar health
curl http://localhost:3001/api/health
```

### **🌐 Producción**
```bash
# Verificar Swagger en producción
curl https://centro-wellness-sierra-de-gata-backend.vercel.app/api/health

# Acceder a documentación online
open https://centro-wellness-sierra-de-gata-backend.vercel.app/api/docs
```

## 📋 Próximas Mejoras

### **🔐 Autenticación**
- [ ] JWT Authentication en Swagger
- [ ] Bearer token configuration
- [ ] Roles y permisos

### **📊 Métricas**
- [ ] Endpoint de métricas
- [ ] Documentación de performance
- [ ] Health checks avanzados

### **🎨 UI Avanzada**
- [ ] Logo personalizado
- [ ] Tema dark/light
- [ ] Exportación de documentación

---

## 🎉 Resultado

La API del **Centro Wellness Sierra de Gata** ahora cuenta con:

✅ **Documentación completa** y automática  
✅ **Interface interactiva** para testing  
✅ **Esquemas detallados** con ejemplos  
✅ **Deployment automático** en producción  
✅ **URLs fijas** y accesibles  

**🌐 Accede ahora**: https://centro-wellness-sierra-de-gata-backend.vercel.app/api/docs

---

*Última actualización: 14 de agosto de 2025*
