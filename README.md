# 🎬 GymApp - Aplicación
### Paleta de Colores
- 🔴 **Rojo Netflix**: Acentos principales y header  
- ⚫ **Negro/Gris**: Fondos y contenedores
- ⚪ **Blanco**: Texto principal

## 🚀 Despliegue Automático

### 📱 URLs de Producción
- **🎨 Frontend**: https://gym-full.vercel.app
- **🔗 Backend API**: https://gym-exercise-backend.vercel.app/api

### ⚡ CI/CD Pipeline Automático
El proyecto utiliza **GitHub Actions** para deployment 100% automático:

**✨ Deployment a Producción:**
- ✅ Push a `main` → Deployment automático a producción
- 🧪 Tests automáticos antes del deployment
- 🚀 Backend + Frontend desplegados secuencialmente

**🔍 Preview Deployments:**
- 📋 Cada PR crea un deployment de preview automático
- 🔧 Tests rápidos + URLs temporales para testing

### 🛠️ Configuración Inicial (Solo una vez)

```bash
# 1. Verificar configuración actual
npm run check-deployment

# 2. Si necesitas configurar secrets en GitHub:
# Ve a: Settings → Secrets and Variables → Actions
# Y añade los valores que te muestra el comando anterior
```

**🚫 Ya NO necesitas:**
- ❌ `npm run deploy:frontend`
- ❌ `npm run deploy:backend`  
- ❌ `vercel deploy` manual
- ❌ Configuración manual de deployment

**✅ Workflow automático:**
1. 💻 Desarrolla tu feature
2. 📝 Commit y push: `git push origin main`
3. ⏰ GitHub Actions se encarga del resto
4. 🎉 App desplegada automáticamente

> 📚 **Más detalles**: Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para configuración avanzada
# VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_PROJECT_ID_BACKEND
```rcicios con Diseño Netflix

Una aplicación web moderna para explorar y gestionar ejercicios de gimnasio, construida con React, TypeScript y Vite. **Ahora con un diseño completamente inspirado en Netflix para una experiencia visual premium.**

> 🐳 **¡Aplicación completamente dockerizada!** - [Ver guía de Docker](DOCKER_SUMMARY.md)
> 🎨 **¡Nuevo diseño Netflix!** - [Ver documentación de diseño](NETFLIX_DESIGN.md)

## ✨ Características Principales

- **🎬 Diseño Netflix-style** - Interfaz moderna con gradientes oscuros y acentos rojos
- **🏋️ Catálogo completo de ejercicios** con información detallada
- **🔍 Sistema de filtros avanzado** por categoría, dificultad y grupos musculares
- **⚡ Búsqueda en tiempo real** de ejercicios
- **📱 Vista detallada responsiva** con instrucciones paso a paso
- **🎨 Animaciones suaves** y efectos hover profesionales
- **🌙 Tema oscuro** optimizado para la vista

## 🎨 Nuevo Diseño Netflix

### Características Visuales
- **Fondo con gradiente oscuro** (negro → gris → negro)
- **Header rojo característico** inspirado en Netflix
- **Tarjetas con efectos hover** y escalado suave
- **Panel de filtros dark mode** con acentos rojos
- **Badges coloridos** para categorías y dificultad
- **Transiciones profesionales** en todos los elementos

### Paleta de Colores
- 🔴 **Rojo Netflix**: Acentos principales y header
- ⚫ **Negro/Gris**: Fondos y contenedores
- ⚪ **Blanco**: Texto principal
- 🌈 **Gradientes temáticos**: Categorías de ejercicios

## 🚀 Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS v4** - Framework de CSS utilitario moderno
- **ESLint** - Linter para mantener calidad del código
- **Docker** - Containerización para desarrollo y producción

## 📋 Categorías de ejercicios

- **Fuerza** - Ejercicios de fortalecimiento muscular
- **Cardio** - Ejercicios cardiovasculares
- **Flexibilidad** - Estiramientos y yoga
- **Resistencia** - Ejercicios de resistencia
- **Equilibrio** - Ejercicios de estabilidad
- **Funcional** - Movimientos funcionales

## 🎯 Niveles de dificultad

- **Principiante** - Para quienes comienzan
- **Intermedio** - Para usuarios con experiencia
- **Avanzado** - Para usuarios experimentados

## 🛠️ Instalación y configuración

1. **Clona el repositorio**
```bash
git clone [url-del-repositorio]
cd gym-full
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Ejecuta la aplicación en modo desarrollo**
```bash
npm run dev
```

4. **Abre tu navegador** y visita `http://localhost:5173`

## 📦 Scripts disponibles

- `npm run dev` - Ejecuta la aplicación en modo desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la aplicación construida
- `npm run lint` - Ejecuta el linter

### 🐳 Scripts de Docker

- `npm run docker:build` - Construye la imagen de producción
- `npm run docker:run` - Ejecuta el contenedor de producción
- `npm run docker:stop` - Detiene los contenedores
- `./docker-scripts.sh help` - Ver todos los comandos de Docker

## 🐳 Ejecutar con Docker

### Inicio rápido con Docker

```bash
# Ejecutar en producción (puerto 3000)
docker-compose up -d

# Ejecutar en desarrollo con hot reload (puerto 5173)
docker-compose --profile dev up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Script de gestión Docker

```bash
# Hacer ejecutable (solo la primera vez)
chmod +x docker-scripts.sh

# Ver comandos disponibles
./docker-scripts.sh help

# Ejecutar en producción
./docker-scripts.sh run

# Ejecutar en desarrollo
./docker-scripts.sh run-dev
```

📖 **[Ver guía completa de Docker](DOCKER.md)**

## 🏗️ Estructura del proyecto

```
src/
├── components/          # Componentes React
│   ├── Header.tsx
│   ├── FiltrosPanel.tsx
│   ├── ListaEjercicios.tsx
│   └── DetalleEjercicio.tsx
├── data/               # Datos de la aplicación
│   └── ejercicios.ts
├── types/              # Definiciones de tipos TypeScript
│   └── ejercicio.ts
└── App.tsx             # Componente principal
```

## 💡 Características técnicas

- **Filtrado dinámico** - Los ejercicios se filtran en tiempo real
- **Estado reactivo** - Gestión eficiente del estado con React hooks
- **Tipado fuerte** - TypeScript para mejor experiencia de desarrollo
- **Diseño adaptativo** - Funciona en todos los dispositivos
- **Búsqueda inteligente** - Búsqueda por nombre de ejercicio

## 🎨 Interfaz de usuario

- **Colores temáticos** por categoría de ejercicio
- **Iconos intuitivos** para navegación y acciones
- **Animaciones suaves** para mejor experiencia
- **Información clara** y bien organizada

## 🚧 Próximas características

- Favoritos de ejercicios
- Rutinas personalizadas
- Temporizador integrado
- Videos demostrativos
- Progreso y estadísticas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
