import { APP_CONFIG } from '../../shared/config/app.config';
import { AuthService } from '../../auth/services/authService';
import type { Notification } from '../types/notification';

const BASE = APP_CONFIG.API.BASE_URL;

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const token = AuthService.getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new Error(`HTTP ${res.status} — ${message}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const NotificationsService = {
  mine(unreadOnly = false): Promise<Notification[]> {
    return call(`/notifications/mine${unreadOnly ? '?unreadOnly=true' : ''}`);
  },
  unreadCount(): Promise<{ count: number }> {
    return call('/notifications/unread-count');
  },
  markRead(id: string): Promise<void> {
    return call(`/notifications/${id}/read`, { method: 'POST' });
  },
  markAllRead(): Promise<void> {
    return call('/notifications/read-all', { method: 'POST' });
  },
};
