import { APP_CONFIG } from '../../shared/config/app.config';
import { AuthService } from '../../auth/services/authService';
import type {
  Class,
  CreateClassPayload,
  TodaySession,
  UpdateClassPayload,
} from '../types/class';

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
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} — ${body || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const ClassesService = {
  today(): Promise<TodaySession[]> {
    return call('/classes/today');
  },
  mine(): Promise<Class[]> {
    return call('/classes/mine');
  },
  listAll(activeOnly = false): Promise<Class[]> {
    return call(`/classes${activeOnly ? '?activeOnly=true' : ''}`);
  },
  create(payload: CreateClassPayload): Promise<Class> {
    return call('/classes', { method: 'POST', body: JSON.stringify(payload) });
  },
  update(id: string, payload: UpdateClassPayload): Promise<Class> {
    return call(`/classes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  remove(id: string): Promise<void> {
    return call(`/classes/${id}`, { method: 'DELETE' });
  },
};
