# 🏋️‍♂️ Generador Automático de Rutinas con OpenAI

Sistema que genera automáticamente rutinas de fuerza inteligentes utilizando **OpenAI GPT-4o-mini** y **Supabase PostgreSQL**, ejecutándose diariamente mediante GitHub Actions.

## ✨ Características

- **🤖 IA Económica**: Usa GPT-4o-mini (modelo más económico) para crear rutinas personalizadas
- **📅 Distribución Inteligente**: Cada día enfocado en grupos musculares específicos  
- **🔄 Sin Repeticiones**: Evita duplicar rutinas para la misma fecha
- **💾 Base de Datos Real**: Utiliza ejercicios existentes de tu base de datos Supabase
- **⏰ Automático**: Ejecuta diariamente a las 6:00 UTC para preparar el día siguiente
- **💰 Ultra Económico**: ~$0.003 USD/mes (centavos por mes)

## 📅 Cronograma Semanal

| Día | Grupos Musculares | Enfoque |
|-----|------------------|---------|
| **Lunes** | Pecho, Tríceps, Deltoides | Push superior |
| **Martes** | Dorsales, Bíceps | Pull superior |
| **Miércoles** | Cuádriceps, Glúteos, Isquiotibiales | Lower body |
| **Jueves** | Pecho, Deltoides, Tríceps | Push superior (variación) |
| **Viernes** | Dorsales, Bíceps | Pull superior (variación) |
| **Sábado** | Cuádriceps, Glúteos, Isquiotibiales | Lower body (variación) |
| **Domingo** | 😴 **Descanso** | Recovery |

## 🛠️ Configuración

### Variables de Entorno Requeridas

En GitHub: `Settings > Secrets and variables > Actions`:

```
OPENAI_API_KEY=sk-proj-...
DATABASE_URL=postgresql://...
```

## 📁 Archivos

- **`generate-daily-routine-openai.js`** - Script principal que genera rutinas con OpenAI
- **`package.json`** - Dependencias (OpenAI, pg, dotenv)
- **GitHub Actions**: `.github/workflows/generate-routines.yml`

## ⚡ Funcionamiento

### 🤖 Automático (Recomendado)
- **Ejecuta**: Diariamente a las 6:00 UTC  
- **Genera**: Rutina para el día siguiente
- **Costo**: ~$0.0001 USD por rutina generada

### 🛠️ Manual
1. Ve a GitHub → Actions → "Generate Daily Gym Routines"  
2. Click "Run workflow"

## 🧠 Inteligencia Artificial

GPT-4o-mini recibe:

- **Lista de ejercicios** disponibles para los grupos musculares del día
- **Instrucciones específicas** para crear rutinas balanceadas
- **Formato JSON** requerido para la respuesta

**Responde con:**
- Rutina completa con 6 ejercicios
- Series, repeticiones y pesos sugeridos
- Calentamiento y enfriamiento específicos  
- Estimaciones de duración y calorías

## 🎯 Ejemplo de Rutina Generada

```json
{
  "name": "Rutina de Cuádriceps, Glúteos, Isquiotibiales - Saturday",
  "description": "¡Fortalece tu cuerpo y transforma tus piernas!",
  "estimatedDurationMinutes": 60,
  "estimatedCalories": 450,
  "exercises": [
    {
      "exerciseId": "57bdce13-8c9c-482e-a33c-fadc20eff671",
      "orderInRoutine": 1,
      "sets": 4,
      "reps": 12,
      "weight": "20.00",
      "restSeconds": 90,
      "notes": "Mantén la espalda recta y baja hasta paralelo"
    }
  ]
}
```

## 💰 Costo y Eficiencia

- **Modelo**: GPT-4o-mini (más económico)
- **Costo por rutina**: ~$0.0001 USD  
- **Costo mensual**: ~$0.003 USD (30 rutinas)
- **Tokens promedio**: ~1500 por rutina

## ✅ Estado: FUNCIONANDO

