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
import ClassesContainer from './domains/classes/components/ClassesContainer';
import {
  HomeIcon,
  ClipboardIcon,
  DumbbellIcon,
  CrownIcon,
  RepeatIcon,
} from './assets/icons/index.tsx';

// ─── Tipos de página ────────────────────────────────────────────────────────

type Page =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'exercises'
  | 'routines'
  | 'classes'
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
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-[#334155] border-t-[#e50914] animate-spin" />
          <p className="text-[#94a3b8] text-sm">Cargando...</p>
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
    { id: 'dashboard' as const, label: 'Dashboard', Icon: HomeIcon },
    { id: 'exercises' as const, label: 'Ejercicios', Icon: ClipboardIcon },
    { id: 'routines' as const, label: 'Rutinas', Icon: DumbbellIcon },
    { id: 'classes' as const, label: 'Clases', Icon: RepeatIcon },
    ...(isAdmin ? [{ id: 'admin' as const, label: 'Admin', Icon: CrownIcon }] : []),
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
      case 'classes':
        return <ClassesContainer />;
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
        <div className="sticky top-16 z-40 w-full bg-[#0d1422] border-b border-white/[0.06]">
          <div className="container mx-auto px-4">
            <nav className="flex gap-1 py-2 overflow-x-auto">
              {navigationTabs.map(({ id, label, Icon }) => {
                const isActive = currentPage === id;
                return (
                  <button
                    key={id}
                    onClick={() => navigate(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive ? 'bg-[#e50914] text-white' : 'bg-transparent text-[#94a3b8] hover:text-white hover:bg-white/5'}`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
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
