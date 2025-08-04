// Script para limpiar rutinas existentes usando el backend API
import 'dotenv/config';

console.log('🧹 Iniciando limpieza de rutinas usando backend API...');

// Configurar la URL base del backend
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

console.log(`🔗 URL del backend: ${API_BASE_URL}`);

// Función para hacer requests al backend
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`📡 ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Si es DELETE, no hay contenido
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ Error en ${endpoint}:`, error.message);
    throw error;
  }
}

// Función para obtener rutinas de mañana
async function getTomorrowRoutines() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateString = tomorrow.toISOString().split('T')[0];
  
  console.log(`📅 Buscando rutinas para ${dateString}...`);
  
  try {
    const routines = await apiRequest(`/routines/daily/by-date/${dateString}`);
    return routines;
  } catch (error) {
    console.log('ℹ️  No se encontraron rutinas para mañana (esto es normal)');
    return [];
  }
}

// Función para borrar una rutina
async function deleteRoutine(routineId) {
  console.log(`🗑️  Borrando rutina ID: ${routineId}`);
  
  try {
    await apiRequest(`/routines/daily/${routineId}`, {
      method: 'DELETE'
    });
    console.log(`✅ Rutina ${routineId} borrada exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error borrando rutina ${routineId}:`, error.message);
    return false;
  }
}

// Función para obtener todas las rutinas
async function getAllRoutines() {
  console.log('📋 Obteniendo todas las rutinas...');
  
  try {
    const routines = await apiRequest('/routines/daily');
    console.log(`📊 Total de rutinas encontradas: ${routines.length}`);
    return routines;
  } catch (error) {
    console.error('❌ Error obteniendo rutinas:', error.message);
    return [];
  }
}

// Función principal
async function cleanupRoutines() {
  console.log('🚀 Iniciando limpieza de rutinas...\n');
  
  try {
    // 1. Obtener rutinas de mañana
    const tomorrowRoutines = await getTomorrowRoutines();
    
    if (Array.isArray(tomorrowRoutines) && tomorrowRoutines.length > 0) {
      console.log(`🎯 Encontradas ${tomorrowRoutines.length} rutinas para mañana`);
      
      for (const routine of tomorrowRoutines) {
        console.log(`📝 Rutina: "${routine.name}" (ID: ${routine.id})`);
        await deleteRoutine(routine.id);
      }
    } else if (tomorrowRoutines && tomorrowRoutines.id) {
      // Es una sola rutina, no un array
      console.log(`🎯 Encontrada rutina para mañana: "${tomorrowRoutines.name}" (ID: ${tomorrowRoutines.id})`);
      await deleteRoutine(tomorrowRoutines.id);
    } else {
      console.log('✅ No hay rutinas para mañana, no es necesario limpiar');
    }
    
    // 2. Mostrar estadísticas generales
    console.log('\n📊 Estadísticas generales:');
    const allRoutines = await getAllRoutines();
    
    if (allRoutines.length > 0) {
      console.log(`📋 Total de rutinas en el sistema: ${allRoutines.length}`);
      
      // Mostrar las últimas 5 rutinas
      console.log('\n🕒 Últimas rutinas:');
      allRoutines.slice(-5).forEach(routine => {
        console.log(`   • ${routine.routine_date}: "${routine.name}" (${routine.status})`);
      });
    }
    
    console.log('\n🎉 Limpieza completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
    process.exit(1);
  }
}

// Ejecutar la limpieza
cleanupRoutines();
