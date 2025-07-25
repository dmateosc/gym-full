# GymApp - Aplicación de Ejercicios de Gimnasio

Una aplicación web moderna para explorar y gestionar ejercicios de gimnasio, construida con React, TypeScript y Vite.

> 🐳 **¡Aplicación completamente dockerizada!** - [Ver guía de Docker](DOCKER_SUMMARY.md)

## 🏋️ Características

- **Catálogo completo de ejercicios** con información detallada
- **Sistema de filtros avanzado** por categoría, dificultad y grupos musculares
- **Búsqueda en tiempo real** de ejercicios
- **Vista detallada** con instrucciones paso a paso
- **Diseño responsivo** optimizado para móvil y escritorio
- **Interfaz moderna** con Tailwind CSS

## 🚀 Tecnologías utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS** - Framework de CSS utilitario
- **ESLint** - Linter para mantener calidad del código

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
