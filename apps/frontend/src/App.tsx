import { useState } from 'react';
import { 
  Header, 
  Navigation,
  ExercisesContainer,
  RoutinesContainer,
  APP_CONFIG
} from './domains';

// Test CI/CD integration - Vercel deployment test
function App() {
  const [currentView, setCurrentView] = useState<'exercises' | 'routines'>('exercises');

  const navigationTabs = [
    {
      id: 'exercises' as const,
      label: 'Catálogo de Ejercicios',
      icon: '📋'
    },
    {
      id: 'routines' as const,
      label: 'Rutinas de Entrenamiento',
      icon: '💪'
    }
  ];

  const renderMainContent = () => {
    switch (currentView) {
      case 'routines':
        return <RoutinesContainer />;
      case 'exercises':
      default:
        return <ExercisesContainer />;
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black" 
      style={{
        background: APP_CONFIG.THEME.BACKGROUND_STYLE,
        minHeight: '100vh'
      }}
    >
      <Header />
      
      <Navigation 
        currentView={currentView}
        onViewChange={setCurrentView}
        tabs={navigationTabs}
      />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;
