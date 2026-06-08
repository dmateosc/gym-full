import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  HomeIcon,
  ClipboardIcon,
  DumbbellIcon,
  CrownIcon,
  AccountIcon,
  LogoutIcon,
  ChevronIcon,
  RepeatIcon,
} from '../../../assets/icons/index.tsx';

interface HeaderProps {
  onNavigate?: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.profile?.fullName ?? user?.email?.split('@')[0] ?? '';

  return (
    <header
      className="sticky top-0 z-50 w-full bg-[#0b1120] border-b border-white/10"
    >
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={() => isAuthenticated ? onNavigate?.('dashboard') : undefined}
        >
          <img
            src="/logo gym.jpeg"
            alt=""
            className="w-9 h-9 rounded-lg object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="text-left hidden sm:block">
            <p className="font-bold text-white text-lg leading-none">
              Centro Wellness
            </p>
            <p className="text-[#94a3b8] text-xs mt-0.5">Sierra de Gata</p>
          </div>
        </button>

        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${menuOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                style={{ background: isAdmin ? '#e50914' : '#475569' }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-white text-sm font-medium leading-none">{displayName}</p>
                <p className="text-[#94a3b8] text-xs mt-1 flex items-center gap-1">
                  {isAdmin ? <CrownIcon size={12} /> : <AccountIcon size={12} />}
                  {isAdmin ? 'Admin' : 'Usuario'}
                </p>
              </div>
              <span className="text-[#64748b]"><ChevronIcon size={16} /></span>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div
                  className="absolute right-0 top-full mt-2 rounded-xl shadow-2xl z-20 py-1.5 bg-[#161e2e] border border-white/10"
                  style={{ minWidth: '210px' }}
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-white text-sm font-semibold">{displayName}</p>
                    <p className="text-[#64748b] text-xs truncate">{user.email}</p>
                  </div>

                  {[
                    { page: 'dashboard', Icon: HomeIcon, label: 'Mi Dashboard' },
                    { page: 'exercises', Icon: ClipboardIcon, label: 'Ejercicios' },
                    { page: 'routines', Icon: DumbbellIcon, label: 'Rutinas' },
                    { page: 'classes', Icon: RepeatIcon, label: 'Clases' },
                  ].map(({ page, Icon, label }) => (
                    <button
                      key={page}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#cbd5e1] hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                      onClick={() => { onNavigate?.(page); setMenuOpen(false); }}
                    >
                      <Icon size={18} /> {label}
                    </button>
                  ))}

                  {isAdmin && (
                    <div className="border-t border-white/10 mt-1 pt-1">
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-[#fca5a5] hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                        onClick={() => { onNavigate?.('admin'); setMenuOpen(false); }}
                      >
                        <CrownIcon size={18} /> Panel Admin
                      </button>
                    </div>
                  )}

                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-[#f87171] hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                      onClick={async () => { setMenuOpen(false); await signOut(); }}
                    >
                      <LogoutIcon size={18} /> Cerrar sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[#94a3b8] text-sm hidden sm:block">Tu centro de entrenamiento</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
