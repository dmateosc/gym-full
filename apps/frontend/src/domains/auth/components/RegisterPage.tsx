import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AlertIcon, CheckIcon } from '../../../assets/icons/index.tsx';
import GoogleSignInButton from './GoogleSignInButton';
import PrivacyNotice from './PrivacyNotice';

interface RegisterPageProps {
  onNavigate: (page: 'login') => void;
}

const inputClass =
  'w-full px-4 py-3 rounded-lg text-white placeholder-[#64748b] outline-none transition-colors bg-[#334155] border border-[#475569] focus:border-[#1f9e3f] focus:ring-2 focus:ring-[rgba(64,206,66,0.25)]';

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { signUp, isLoading, error } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const ok = await signUp(email, password, fullName);
    if (ok) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f172a]">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: '#16a34a22', color: '#4ade80' }}>
            <CheckIcon />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">¡Revisa tu email!</h2>
          <p className="text-[#94a3b8] mb-6">
            Te hemos enviado un enlace de confirmación a <strong className="text-white">{email}</strong>.
            Haz clic en él para activar tu cuenta.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 rounded-lg font-semibold text-white bg-[#1f9e3f] hover:opacity-90 transition-opacity"
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#0f172a]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo-centro-wellness.png"
            alt=""
            className="w-16 h-16 mx-auto object-contain mb-3"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
          <p className="text-[#94a3b8] mt-1">Únete a Centro Wellness</p>
        </div>

        <div className="rounded-2xl p-8 bg-[#1e293b] border border-[#334155]">
          {(error || localError) && (
            <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm" style={{ background: '#ef444415', border: '1px solid #ef444455', color: '#fca5a5' }}>
              <AlertIcon size={16} />
              <span>{localError ?? error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#cbd5e1] mb-1.5">Nombre completo</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan García"
                autoComplete="name"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#cbd5e1] mb-1.5">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#cbd5e1] mb-1.5">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mín. 6 caracteres"
                autoComplete="new-password"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#cbd5e1] mb-1.5">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                className={inputClass}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-opacity duration-200 mt-2 disabled:opacity-60 bg-[#1f9e3f] hover:opacity-90"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#334155]" />
            <span className="text-[#64748b] text-xs uppercase tracking-wider">o</span>
            <div className="flex-1 h-px bg-[#334155]" />
          </div>

          <GoogleSignInButton label="Continuar con Google" />

          <p className="text-center text-[#94a3b8] text-sm mt-6">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-semibold text-[#1f9e3f] hover:underline"
            >
              Inicia sesión
            </button>
          </p>

          <PrivacyNotice />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
