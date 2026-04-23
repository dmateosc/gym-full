import { useState, useEffect } from 'react';
import {
  ExercisesContainer,
  RoutinesContainer,
  APP_CONFIG,
  AppProvider,
} from './domains';
import { AuthProvider, useAuth, LoginPage, RegisterPage } from './domains/auth';
import DashboardContainer from './domains/dashboard/components/DashboardContainer';
import AdminUsersContainer from './domains/admin/components/AdminUsersContainer';
import Header from './domains/shared/components/Header';

// ─── Tipos de página ────────────────────────────────────────────────────────

type Page =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'exercises'
  | 'routines'
  | 'admin';

// ─── Contenido principal (requiere auth) ─────────────────────────────────────

function AppContent() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated && currentPage !== 'register') {
      setCurrentPage('login');
    } else if (!isLoading && isAuthenticated && (currentPage === 'login' || currentPage === 'register')) {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, isLoading, currentPage]);

  const navigate = (page: string) => {
    // Proteger la ruta admin
    if (page === 'admin' && !isAdmin) return;
    setCurrentPage(page as Page);
  };

  // Pantalla de carga inicial
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#000' }}
      >
        <div className="text-center">
          <div className="text-5xl mb-4">🏋️</div>
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Páginas de auth (sin header ni navegación)
  if (currentPage === 'login' || (!isAuthenticated && currentPage !== 'register')) {
    return (
      <LoginPage
        onNavigate={(page) => setCurrentPage(page === 'home' ? 'dashboard' : page)}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <RegisterPage onNavigate={(page) => setCurrentPage(page)} />
    );
  }

  // Tabs de navegación según rol
  const navigationTabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: '🏠' },
    { id: 'exercises' as const, label: 'Ejercicios', icon: '📋' },
    { id: 'routines' as const, label: 'Rutinas', icon: '💪' },
    ...(isAdmin ? [{ id: 'admin' as const, label: 'Admin', icon: '👑' }] : []),
  ];

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardContainer
            onNavigate={(page) => setCurrentPage(page)}
          />
        );
      case 'exercises':
        return <ExercisesContainer />;
      case 'routines':
        return <RoutinesContainer />;
      case 'admin':
        return isAdmin ? <AdminUsersContainer /> : null;
      default:
        return (
          <DashboardContainer
            onNavigate={(page) => setCurrentPage(page)}
          />
        );
    }
  };

  return (
    <AppProvider>
      <div
        className="min-h-screen"
        style={{ background: APP_CONFIG.THEME.BACKGROUND_STYLE }}
      >
        <Header onNavigate={navigate} />

        {/* Navegación por tabs */}
        <div
          className="sticky top-16 z-40 w-full"
          style={{
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="container mx-auto px-4">
            <nav className="flex gap-1 py-2 overflow-x-auto">
              {navigationTabs.map((tab) => {
                const isActive = currentPage === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigate(tab.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                    style={{
                      background: isActive ? '#e50914' : 'transparent',
                      color: isActive ? '#fff' : '#9ca3af',
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenido */}
        <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {renderContent()}
        </main>
      </div>
    </AppProvider>
  );
}

// ─── App raíz ────────────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
