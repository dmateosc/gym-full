import { useState, useEffect } from 'react';
import type { Ejercicio, FiltrosEjercicio } from './types/ejercicio';
import { ejerciciosData } from './data/ejercicios';
import Header from './components/Header';
import FiltrosPanel from './components/FiltrosPanel';
import ListaEjercicios from './components/ListaEjercicios';
import DetalleEjercicio from './components/DetalleEjercicio';

function App() {
  const [filtros, setFiltros] = useState<FiltrosEjercicio>({});
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<Ejercicio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular carga inicial y verificar que los datos están disponibles
    try {
      console.log('🚀 Iniciando GymApp...');
      console.log('📊 Datos de ejercicios cargados:', ejerciciosData.length, 'ejercicios');
      console.log('🌍 Environment:', import.meta.env.MODE);
      
      // Agregar un pequeño delay para mostrar el estado de carga
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('❌ Error al inicializar la aplicación:', err);
      setError('Error al cargar la aplicación: ' + (err as Error).message);
      setIsLoading(false);
    }
  }, []);

  // Filtrar ejercicios basado en los filtros aplicados
  const ejerciciosFiltrados = ejerciciosData.filter(ejercicio => {
    if (filtros.categoria && ejercicio.categoria !== filtros.categoria) return false;
    if (filtros.dificultad && ejercicio.dificultad !== filtros.dificultad) return false;
    if (filtros.grupoMuscular && !ejercicio.gruposMusculares.includes(filtros.grupoMuscular)) return false;
    if (filtros.busqueda && !ejercicio.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())) return false;
    return true;
  });

  // Estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-red-600 opacity-20 animate-pulse"></div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">GymApp</h2>
          <p className="text-gray-300 text-lg">Cargando tu catálogo de ejercicios...</p>
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  // Renderizar contenido principal
  const renderMainContent = () => {
    if (ejercicioSeleccionado) {
      return (
        <DetalleEjercicio 
          ejercicio={ejercicioSeleccionado} 
          onVolver={() => setEjercicioSeleccionado(null)}
        />
      );
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FiltrosPanel 
            filtros={filtros} 
            onFiltrosChange={setFiltros}
          />
        </div>
        
        <div className="lg:col-span-3">
          <ListaEjercicios 
            ejercicios={ejerciciosFiltrados}
            onEjercicioSelect={setEjercicioSeleccionado}
          />
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black" 
      style={{
        background: 'linear-gradient(to bottom right, #000000, #111827, #000000)',
        minHeight: '100vh'
      }}
    >
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {renderMainContent()}
      </div>
      
      {/* Debug info en desarrollo */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm font-mono">
          <div>🏋️ Ejercicios: {ejerciciosFiltrados.length}/{ejerciciosData.length}</div>
          <div>🔍 Filtros activos: {Object.keys(filtros).filter(key => filtros[key as keyof FiltrosEjercicio]).length}</div>
        </div>
      )}
    </div>
  );
}

export default App;
