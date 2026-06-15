import { useCallback, useEffect, useState } from 'react';

/**
 * Hook para el prompt de instalación PWA.
 *
 * - Captura el evento `beforeinstallprompt` (Chrome/Edge en Android,
 *   Chrome en desktop). Lo guarda hasta que se llame a
 *   `promptInstall()`.
 * - Detecta iOS (cualquier navegador: Safari, Chrome, Firefox, Edge —
 *   todos son WebKit) para mostrar la instrucción manual de
 *   "Compartir → Añadir a pantalla de inicio". iOS no soporta
 *   beforeinstallprompt en ningún navegador; ahí tenemos que decirle
 *   al usuario qué hacer.
 * - Reconoce si la app ya está corriendo standalone (instalada).
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type IosBrowser = 'safari' | 'chrome' | 'firefox' | 'edge' | 'other';

function detectIos(): { isIos: boolean; browser: IosBrowser } {
  if (typeof navigator === 'undefined') return { isIos: false, browser: 'other' };
  const ua = navigator.userAgent;
  const isIos =
    (/iPhone|iPad|iPod/.test(ua) ||
      // iPadOS 13+ reports as Mac with touch support
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !('MSStream' in window);
  if (!isIos) return { isIos: false, browser: 'other' };
  let browser: IosBrowser = 'safari';
  if (/CriOS/.test(ua)) browser = 'chrome';
  else if (/FxiOS/.test(ua)) browser = 'firefox';
  else if (/EdgiOS/.test(ua)) browser = 'edge';
  else if (!/Safari/.test(ua)) browser = 'other';
  return { isIos, browser };
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
  iosBrowser: IosBrowser;
  installed: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

export function useInstallPrompt(): UseInstallPrompt {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());
  const ios = detectIos();

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
    iosNeedsManualInstall: !installed && ios.isIos,
    iosBrowser: ios.browser,
    installed,
    promptInstall,
  };
}
