import { useState } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

/**
 * Botón "Instalar app" que aparece en el header.
 *
 * - Android/desktop Chrome/Edge: lanza el prompt nativo del navegador.
 * - iOS Safari: abre un mini popover con la instrucción manual
 *   (Compartir → Añadir a pantalla de inicio).
 * - No se renderiza si la app ya está instalada / corriendo
 *   standalone.
 */
export function InstallAppButton() {
  const {
    canInstall,
    iosNeedsManualInstall,
    iosBrowser,
    installed,
    promptInstall,
  } = useInstallPrompt();
  const [showIosHelp, setShowIosHelp] = useState(false);

  if (installed) return null;
  if (!canInstall && !iosNeedsManualInstall) return null;

  const handleClick = async () => {
    if (canInstall) {
      await promptInstall();
    } else if (iosNeedsManualInstall) {
      setShowIosHelp((v) => !v);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#e50914] hover:opacity-90 transition-opacity"
        aria-label="Instalar la app"
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
          <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
        </svg>
        Instalar app
      </button>

      {/* Versión compacta para móvil — solo icono */}
      <button
        onClick={handleClick}
        className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white bg-[#e50914] hover:opacity-90"
        aria-label="Instalar la app"
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
          <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
        </svg>
      </button>

      {showIosHelp && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowIosHelp(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-2xl z-20 bg-[#161e2e] border border-white/10 p-4">
            <p className="text-white text-sm font-semibold mb-2">
              {iosBrowser === 'chrome'
                ? 'Cómo instalar desde Chrome (iPhone)'
                : iosBrowser === 'firefox'
                  ? 'Cómo instalar desde Firefox (iPhone)'
                  : iosBrowser === 'edge'
                    ? 'Cómo instalar desde Edge (iPhone)'
                    : 'Cómo instalar en iPhone'}
            </p>
            <ol className="text-[#cbd5e1] text-xs space-y-2 list-decimal list-inside">
              {iosBrowser === 'chrome' ? (
                <>
                  <li>
                    Toca el menú <span className="font-semibold">⋯</span> (tres
                    puntos) abajo a la derecha.
                  </li>
                  <li>
                    Pulsa{' '}
                    <span className="font-semibold">
                      «Añadir a pantalla de inicio»
                    </span>
                    .
                  </li>
                  <li>Confirma con «Añadir».</li>
                </>
              ) : iosBrowser === 'firefox' || iosBrowser === 'edge' ? (
                <>
                  <li>
                    Abre el menú del navegador (icono de tres líneas o tres
                    puntos).
                  </li>
                  <li>
                    Busca{' '}
                    <span className="font-semibold">«Compartir»</span> y luego{' '}
                    <span className="font-semibold">
                      «Añadir a pantalla de inicio»
                    </span>
                    .
                  </li>
                  <li>
                    Si no aparece, abre la web en Safari y úsalo desde ahí.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    Toca el botón{' '}
                    <span className="font-semibold">Compartir</span> en la
                    barra inferior de Safari (icono cuadrado con flecha hacia
                    arriba).
                  </li>
                  <li>
                    Desplázate y pulsa{' '}
                    <span className="font-semibold">
                      «Añadir a pantalla de inicio»
                    </span>
                    .
                  </li>
                  <li>Confirma con «Añadir» arriba a la derecha.</li>
                </>
              )}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
