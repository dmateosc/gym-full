import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { EyeIcon, EyeOffIcon, AlertIcon } from '../../../assets/icons/index.tsx';

interface LoginPageProps {
  onNavigate: (page: 'register' | 'home') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { signIn, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  const inputClass =
    'w-full px-4 py-3 rounded-lg text-white placeholder-[#64748b] outline-none transition-colors bg-[#334155] border border-[#475569] focus:border-[#1f9e3f] focus:ring-2 focus:ring-[rgba(64,206,66,0.25)]';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f172a]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo gym.jpeg"
            alt=""
            className="w-16 h-16 mx-auto rounded-xl object-cover mb-3"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <h1 className="text-3xl font-bold text-white">Centro Wellness</h1>
          <p className="text-[#94a3b8] mt-1">Inicia sesión en tu cuenta</p>
        </div>

        <div className="rounded-2xl p-8 bg-[#1e293b] border border-[#334155]">
          {error && (
            <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm" style={{ background: '#ef444415', border: '1px solid #ef444455', color: '#fca5a5' }}>
              <AlertIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#cbd5e1] mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#cbd5e1] mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-opacity duration-200 disabled:opacity-60 bg-[#1f9e3f] hover:opacity-90"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-[#94a3b8] text-sm mt-6">
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-semibold text-[#1f9e3f] hover:underline"
            >
              Regístrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
