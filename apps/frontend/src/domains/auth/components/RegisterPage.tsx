import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface RegisterPageProps {
  onNavigate: (page: 'login') => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { signUp, isLoading, error } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const inputStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
  };

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
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #000 0%, #111 50%, #000 100%)' }}
      >
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-white mb-3">¡Revisa tu email!</h2>
          <p className="text-gray-400 mb-6">
            Te hemos enviado un enlace de confirmación a <strong className="text-white">{email}</strong>.
            Haz clic en él para activar tu cuenta.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 rounded-lg font-semibold text-white"
            style={{ background: '#e50914' }}
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #000 0%, #111 50%, #000 100%)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏋️</div>
          <h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
          <p className="text-gray-400 mt-1">Únete a Centro Wellness</p>
        </div>

        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {(error || localError) && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-500/50 text-red-300 text-sm">
              ⚠️ {localError ?? error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan García"
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 outline-none"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 outline-none"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mín. 6 caracteres"
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 outline-none"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 outline-none"
                style={inputStyle}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 mt-2 disabled:opacity-60"
              style={{ background: '#e50914' }}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-semibold hover:underline"
              style={{ color: '#e50914' }}
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
