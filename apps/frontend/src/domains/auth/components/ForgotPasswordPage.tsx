import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AlertIcon, CheckIcon } from '../../../assets/icons/index.tsx';

interface ForgotPasswordPageProps {
  onNavigate: (page: 'login') => void;
}

const inputClass =
  'w-full px-4 py-3 rounded-lg text-white placeholder-[#64748b] outline-none transition-colors bg-[#334155] border border-[#475569] focus:border-[#1f9e3f] focus:ring-2 focus:ring-[rgba(64,206,66,0.25)]';

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { requestPasswordReset, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await requestPasswordReset(email);
    if (ok) setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f172a]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Recuperar contraseña</h1>
          <p className="text-[#94a3b8] mt-1">
            Te enviaremos un enlace para restablecerla
          </p>
        </div>

        <div className="rounded-2xl p-8 bg-[#1e293b] border border-[#334155]">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#1f9e3f22] flex items-center justify-center text-[#6ee06f]">
                <CheckIcon size={28} />
              </div>
              <p className="text-white">
                Revisa tu correo. Si {email} está registrado, recibirás un
                enlace para crear una nueva contraseña.
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="w-full py-3 rounded-lg font-semibold text-white bg-[#1f9e3f] hover:opacity-90 transition-opacity"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div
                  className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                  style={{
                    background: '#ef444415',
                    border: '1px solid #ef444455',
                    color: '#fca5a5',
                  }}
                >
                  <AlertIcon size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#cbd5e1] mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    autoComplete="email"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-opacity duration-200 disabled:opacity-60 bg-[#1f9e3f] hover:opacity-90"
                >
                  {isLoading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>

              <p className="text-center text-[#94a3b8] text-sm mt-6">
                <button
                  onClick={() => onNavigate('login')}
                  className="font-semibold text-[#1f9e3f] hover:underline"
                >
                  Volver al inicio de sesión
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
