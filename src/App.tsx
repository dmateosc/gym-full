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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">GymApp</h2>
          <p className="text-gray-600">Cargando ejercicios...</p>
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
    <div className="min-h-screen bg-gray-50">
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
