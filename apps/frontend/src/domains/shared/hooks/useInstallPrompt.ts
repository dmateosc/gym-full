import { useCallback, useEffect, useState } from 'react';

/**
 * Hook para el prompt de instalación PWA.
 *
 * - Captura el evento `beforeinstallprompt` (Chrome/Edge en Android,
 *   Chrome en desktop). Lo guarda hasta que se llame a
 *   `promptInstall()`.
 * - Detecta Safari iOS para mostrar la instrucción manual de
 *   "Compartir → Añadir a pantalla de inicio" (Safari no soporta
 *   beforeinstallprompt; ahí tenemos que decirle al usuario qué
 *   hacer).
 * - Reconoce si la app ya está corriendo standalone (instalada).
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) && !('MSStream' in window);
  const isSafari =
    /Safari/.test(ua) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/.test(ua);
  return isIOS && isSafari;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  // Standalone display in modern browsers
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  // Legacy iOS Safari flag
  const navAny = navigator as Navigator & { standalone?: boolean };
  return navAny.standalone === true;
}

interface UseInstallPrompt {
  canInstall: boolean;
  iosNeedsManualInstall: boolean;
  installed: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

export function useInstallPrompt(): UseInstallPrompt {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<
    'accepted' | 'dismissed' | 'unavailable'
  > => {
    if (!deferred) return 'unavailable';
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === 'accepted') setInstalled(true);
    return choice.outcome;
  }, [deferred]);

  return {
    canInstall: deferred !== null && !installed,
    iosNeedsManualInstall: !installed && isIosSafari(),
    installed,
    promptInstall,
  };
}
