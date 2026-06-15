import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  AlertIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
} from '../../../assets/icons/index.tsx';

interface ResetPasswordPageProps {
  onDone: () => void;
}

const inputClass =
  'w-full px-4 py-3 rounded-lg text-white placeholder-[#64748b] outline-none transition-colors bg-[#334155] border border-[#475569] focus:border-[#1f9e3f] focus:ring-2 focus:ring-[rgba(64,206,66,0.25)]';

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onDone }) => {
  const { updatePassword, isLoading, error } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (password.length < 8) {
      setLocalError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setLocalError('Las contraseñas no coinciden.');
      return;
    }
    const ok = await updatePassword(password);
    if (ok) setDone(true);
  };

  const shown = localError ?? error;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f172a]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Nueva contraseña</h1>
          <p className="text-[#94a3b8] mt-1">Elige una contraseña segura</p>
        </div>

        <div className="rounded-2xl p-8 bg-[#1e293b] border border-[#334155]">
          {done ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#1f9e3f22] flex items-center justify-center text-[#6ee06f]">
                <CheckIcon size={28} />
              </div>
              <p className="text-white">
                Tu contraseña se ha actualizado correctamente.
              </p>
              <button
                onClick={onDone}
                className="w-full py-3 rounded-lg font-semibold text-white bg-[#1f9e3f] hover:opacity-90 transition-opacity"
              >
                Ir a la app
              </button>
            </div>
          ) : (
            <>
              {shown && (
                <div
                  className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                  style={{
                    background: '#ef444415',
                    border: '1px solid #ef444455',
                    color: '#fca5a5',
                  }}
                >
                  <AlertIcon size={16} />
                  <span>{shown}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      className={`${inputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white transition-colors"
                      aria-label={
                        showPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                    >
                      {showPassword ? (
                        <EyeOffIcon size={20} />
                      ) : (
                        <EyeIcon size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-1.5">
                    Confirmar contraseña
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-opacity duration-200 disabled:opacity-60 bg-[#1f9e3f] hover:opacity-90"
                >
                  {isLoading ? 'Guardando...' : 'Guardar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
