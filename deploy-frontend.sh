#!/bin/bash
# Script para desplegar frontend en Vercel correctamente

echo "🚀 Desplegando Frontend en Vercel..."
echo ""

# Cambiar al directorio del frontend
cd apps/frontend

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. ¿Estás en el directorio correcto?"
    exit 1
fi

# Hacer un build para verificar que todo está funcionando
echo "🏗️ Construyendo frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en el build. Revisa los errores arriba."
    exit 1
fi

echo "✅ Build exitoso!"
echo ""

# Mostrar archivos generados
echo "📁 Archivos generados en dist/:"
ls -la dist/
echo ""
echo "📁 Assets generados:"
ls -la dist/assets/
echo ""

# Instrucciones para el despliegue
echo "📋 INSTRUCCIONES PARA VERCEL:"
echo ""
echo "1. Ve a: https://vercel.com/dmateoscanos-projects"
echo "2. Click en 'New Project'"
echo "3. Import repository: dmateosc/gym-full"
echo "4. Configuración del proyecto:"
echo "   - Project Name: gym-full"
echo "   - Framework: Vite"
echo "   - Root Directory: apps/frontend"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "   - Install Command: npm install"
echo ""
echo "5. Environment Variables:"
echo "   VITE_API_BASE_URL = https://gym-exercise-backend.vercel.app/api"
echo ""
echo "6. Click 'Deploy'"
echo ""
echo "🎯 Tu frontend estará disponible en:"
echo "   https://gym-full-[hash].vercel.app"
echo ""

# Opción de usar CLI de Vercel si está instalada
if command -v vercel &> /dev/null; then
    echo "💡 ALTERNATIVA - Usar Vercel CLI:"
    echo ""
    read -p "¿Quieres desplegar usando Vercel CLI ahora? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Desplegando con Vercel CLI..."
        vercel --prod
    fi
else
    echo "💡 Para usar CLI en el futuro, instala: npm i -g vercel"
fi

echo ""
echo "✅ ¡Listo para desplegar!"
