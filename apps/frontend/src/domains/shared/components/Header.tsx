import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { APP_CONFIG } from '../config/app.config';

interface HeaderProps {
  onNavigate?: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.profile?.fullName ?? user?.email?.split('@')[0] ?? '';

  return (
    <header
      className="sticky top-0 z-50 w-full shadow-2xl"
      style={{
        background: APP_CONFIG.THEME.GRADIENT_STYLE,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={() => isAuthenticated ? onNavigate?.('dashboard') : undefined}
        >
          <span className="text-2xl">🏋️</span>
          <div>
            <p className="font-bold text-white text-lg leading-none hidden sm:block">
              Centro Wellness
            </p>
            <p className="text-gray-400 text-xs hidden sm:block">Sierra de Gata</p>
          </div>
        </button>

        {/* Usuario autenticado */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                style={{ background: isAdmin ? '#e50914' : '#4b5563' }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-white text-sm font-medium leading-none">{displayName}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {isAdmin ? '👑 Admin' : '👤 Usuario'}
                </p>
              </div>
              <span className="text-gray-500 text-xs">▾</span>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div
                  className="absolute right-0 top-full mt-2 w-54 rounded-xl shadow-2xl z-20 py-1.5"
                  style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', minWidth: '210px' }}
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-white text-sm font-semibold">{displayName}</p>
                    <p className="text-gray-500 text-xs truncate">{user.email}</p>
                  </div>

                  {[
                    { page: 'dashboard', icon: '🏠', label: 'Mi Dashboard' },
                    { page: 'exercises', icon: '📋', label: 'Ejercicios' },
                    { page: 'routines', icon: '💪', label: 'Rutinas' },
                  ].map(({ page, icon, label }) => (
                    <button
                      key={page}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2.5"
                      onClick={() => { onNavigate?.(page); setMenuOpen(false); }}
                    >
                      <span>{icon}</span> {label}
                    </button>
                  ))}

                  {isAdmin && (
                    <div className="border-t border-white/10 mt-1 pt-1">
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-900/20 flex items-center gap-2.5"
                        style={{ color: '#fca5a5' }}
                        onClick={() => { onNavigate?.('admin'); setMenuOpen(false); }}
                      >
                        <span>👑</span> Panel Admin
                      </button>
                    </div>
                  )}

                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2.5"
                      onClick={async () => { setMenuOpen(false); await signOut(); }}
                    >
                      <span>🚪</span> Cerrar sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm hidden sm:block">Tu centro de entrenamiento</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
