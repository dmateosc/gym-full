# 🤝 Contribuyendo a GymApp

¡Gracias por tu interés en contribuir a GymApp! Este documento te guiará en el proceso de contribución.

## 🎬 Filosofía de Diseño

GymApp utiliza un **diseño inspirado en Netflix** que debe mantenerse consistente en todas las contribuciones:

### Principios de Diseño
- **🌙 Dark First**: Diseño oscuro como prioridad
- **🔴 Acentos Rojos**: Usar rojo Netflix para elementos importantes
- **✨ Micro-interacciones**: Animaciones suaves y feedback visual
- **📱 Mobile First**: Responsive design siempre
- **⚡ Performance**: Optimización constante

## 🚀 Comenzando

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Git
- Docker (opcional)

### Configuración Inicial
```bash
# 1. Fork el repositorio en GitHub

# 2. Clona tu fork
git clone https://github.com/TU_USUARIO/gym-full.git
cd gym-full

# 3. Añade el repositorio original como upstream
git remote add upstream https://github.com/USUARIO_ORIGINAL/gym-full.git

# 4. Instala dependencias
npm install

# 5. Ejecuta en desarrollo
npm run dev
```

## 🎨 Guía de Estilo

### Colores Netflix
```css
/* Principales */
--netflix-red: #E50914;
--netflix-dark-red: #B81D24;
--netflix-black: #000000;
--netflix-dark-gray: #141414;
--netflix-gray: #333333;

/* Gradientes */
background: linear-gradient(to right, #dc2626, #b91c1c, #991b1b);
background: linear-gradient(to bottom right, #000000, #111827, #000000);
```

### Clases Tailwind Recomendadas
```tsx
// Contenedores principales
"bg-gradient-to-br from-black via-gray-900 to-black"

// Tarjetas
"bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl border border-gray-700"

// Botones principales
"bg-gradient-to-r from-red-600 to-red-800 text-white hover:scale-105 transition-all duration-300"

// Estados hover
"hover:shadow-red-500/20 hover:border-red-500/50"

// Estados focus
"focus:ring-2 focus:ring-red-500 focus:border-transparent"
```

### Animaciones
```tsx
// Transiciones estándar
"transition-all duration-300"
"transition-colors duration-200"

// Efectos hover
"hover:scale-105 transform"
"group-hover:text-red-300"
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Header.tsx      # Header con diseño Netflix
│   ├── FiltrosPanel.tsx # Panel de filtros dark
│   ├── ListaEjercicios.tsx # Grid de ejercicios
│   └── DetalleEjercicio.tsx # Vista detallada
├── data/               # Datos estáticos
├── types/              # Tipos TypeScript
├── assets/             # Recursos estáticos
├── App.tsx             # Componente principal
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales
```

## 🔧 Tipos de Contribuciones

### 1. 🐛 Corrección de Bugs
- Reporta bugs con información detallada
- Incluye pasos para reproducir
- Proporciona screenshots si es visual

### 2. ✨ Nuevas Funcionalidades
- Discute la funcionalidad antes de implementar
- Mantén el diseño Netflix consistente
- Añade documentación correspondiente

### 3. 🎨 Mejoras de Diseño
- Sigue las guías de diseño Netflix
- Prueba en diferentes resoluciones
- Mantén la accesibilidad

### 4. 📚 Documentación
- Mantén la documentación actualizada
- Usa ejemplos claros
- Incluye screenshots cuando sea relevante

## 🔄 Flujo de Trabajo

### Crear una Rama
```bash
# Sincroniza con upstream
git fetch upstream
git checkout main
git merge upstream/main

# Crea una nueva rama
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-bug
```

### Hacer Cambios
1. **Mantén commits pequeños** y descriptivos
2. **Sigue convenciones**: `feat:`, `fix:`, `docs:`, `style:`
3. **Prueba todo** antes de hacer push

### Ejemplo de Commits
```bash
git commit -m "feat: añadir filtro por equipamiento con diseño Netflix"
git commit -m "fix: corregir overflow en tarjetas de ejercicios móvil"
git commit -m "docs: actualizar guía de componentes"
git commit -m "style: mejorar gradientes en botones hover"
```

### Enviar Pull Request
1. **Push a tu fork**
   ```bash
   git push origin feature/nombre-descriptivo
   ```

2. **Crear PR** en GitHub con:
   - Título descriptivo
   - Descripción detallada
   - Screenshots del antes/después
   - Checklist completado

## 🧪 Testing

### Antes de Enviar PR
```bash
# 1. Desarrollo
npm run dev
# Prueba todas las funcionalidades

# 2. Build de producción
npm run build
npm run preview

# 3. Docker (si aplica)
docker-compose build --no-cache
docker-compose up

# 4. Linting
npm run lint
```

### Checklist de Testing
- [ ] Funciona en desarrollo (`localhost:5173`)
- [ ] Build de producción sin errores
- [ ] Responsive en móvil, tablet, desktop
- [ ] Todos los filtros funcionan
- [ ] Búsqueda funcional
- [ ] Navegación entre vistas
- [ ] Diseño Netflix consistente
- [ ] Animaciones suaves
- [ ] Docker build exitoso

## 🎨 Componentes de Ejemplo

### Botón Netflix
```tsx
const NetflixButton = ({ children, onClick }: Props) => (
  <button
    onClick={onClick}
    className="
      bg-gradient-to-r from-red-600 to-red-800 
      text-white font-semibold px-6 py-3 rounded-lg
      hover:scale-105 hover:shadow-lg hover:shadow-red-500/25
      transition-all duration-300
      focus:ring-2 focus:ring-red-500 focus:outline-none
    "
  >
    {children}
  </button>
);
```

### Tarjeta Netflix
```tsx
const NetflixCard = ({ children }: Props) => (
  <div className="
    bg-gradient-to-br from-gray-900 via-gray-800 to-black
    rounded-xl border border-gray-700 p-6
    hover:scale-105 hover:shadow-2xl hover:shadow-red-500/10
    hover:border-red-500/50
    transition-all duration-300 cursor-pointer
  ">
    {children}
  </div>
);
```

## 📋 Revisión de Código

### Lo que Buscamos
- **Consistencia** con el diseño Netflix
- **Código limpio** y mantenible
- **Performance** optimizado
- **Accesibilidad** mantenida
- **Responsive design** funcional

### Lo que Evitamos
- Colores que no sean de la paleta Netflix
- Animaciones bruscas o muy lentas
- Código duplicado
- Inconsistencias de estilo
- Breaking changes sin documentar

## 🤔 ¿Necesitas Ayuda?

### Recursos
- [Documentación de Diseño Netflix](NETFLIX_DESIGN.md)
- [Guía de Docker](DOCKER_SUMMARY.md)
- [Changelog](CHANGELOG.md)

### Contacto
- Abre un **Issue** para discusión
- Usa **Discussions** para preguntas
- Revisa **Issues existentes** antes de crear uno nuevo

## 🎉 Reconocimientos

¡Todas las contribuciones son valoradas! Los contribuidores serán reconocidos en el README.

---

**¡Gracias por ayudar a hacer GymApp aún mejor!** 🏋️‍♂️🎬
