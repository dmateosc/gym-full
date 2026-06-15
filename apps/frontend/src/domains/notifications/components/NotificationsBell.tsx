import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { NotificationsService } from '../services/notificationsService';
import type { Notification } from '../types/notification';
import { BellIcon } from '../../../assets/icons/index.tsx';

const POLL_INTERVAL_MS = 60_000;

const formatRelative = (iso: string): string => {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diffMin = Math.floor((now - t) / 60_000);
  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
};

const TYPE_ACCENT: Record<string, string> = {
  booking_confirmed: '#22c55e',
  booking_promoted: '#fbbf24',
  daily_reminder: '#60a5fa',
};

export function NotificationsBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notification[] | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);

  const refreshCount = useCallback(() => {
    if (!isAuthenticated) return;
    NotificationsService.unreadCount()
      .then(({ count }) => setUnread(count))
      .catch(() => { /* silenciar */ });
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCount();
    const id = window.setInterval(refreshCount, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [refreshCount]);

  const loadItems = useCallback(() => {
    setLoadingItems(true);
    NotificationsService.mine()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoadingItems(false));
  }, []);

  const toggle = () => {
    setOpen((v) => {
      if (!v) loadItems();
      return !v;
    });
  };

  const handleMarkAll = async () => {
    await NotificationsService.markAllRead();
    setUnread(0);
    setItems((prev) =>
      prev ? prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) : prev,
    );
  };

  const handleClickItem = async (n: Notification) => {
    if (n.readAt) return;
    try {
      await NotificationsService.markRead(n.id);
      setUnread((c) => Math.max(c - 1, 0));
      setItems((prev) =>
        prev
          ? prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x))
          : prev,
      );
    } catch {
      /* ignore */
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
          open ? 'bg-white/10' : 'hover:bg-white/5'
        }`}
        aria-label="Notificaciones"
      >
        <span className="text-[#cbd5e1]"><BellIcon size={20} /></span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center bg-[#dc2626]">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl shadow-2xl z-20 bg-[#161e2e] border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <p className="text-white text-sm font-semibold">Notificaciones</p>
              {items && items.some((n) => !n.readAt) && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-[#60a5fa] hover:underline"
                >
                  Marcar todas
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loadingItems || items === null ? (
                <div className="p-4 space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <p className="text-[#94a3b8] text-sm text-center py-8">No tienes notificaciones</p>
              ) : (
                <ul>
                  {items.map((n) => (
                    <li
                      key={n.id}
                      onClick={() => handleClickItem(n)}
                      className={`px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                        n.readAt ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="w-2 h-2 rounded-full mt-2 shrink-0"
                          style={{
                            background: n.readAt ? '#475569' : (TYPE_ACCENT[n.type] ?? '#cbd5e1'),
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">{n.title}</p>
                          <p className="text-[#94a3b8] text-xs whitespace-pre-line mt-1">
                            {n.body}
                          </p>
                          <p className="text-[#64748b] text-[10px] mt-1.5">
                            {formatRelative(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
