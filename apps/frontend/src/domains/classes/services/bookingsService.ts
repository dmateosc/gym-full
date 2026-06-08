import { APP_CONFIG } from '../../shared/config/app.config';
import { AuthService } from '../../auth/services/authService';
import type { Attendee, Booking, MyBooking } from '../types/class';

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
      // ignore
    }
    throw new Error(`HTTP ${res.status} — ${message}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const BookingsService = {
  book(sessionId: string): Promise<Booking> {
    return call(`/class-sessions/${sessionId}/bookings`, { method: 'POST' });
  },
  cancel(bookingId: string): Promise<void> {
    return call(`/bookings/${bookingId}`, { method: 'DELETE' });
  },
  mine(): Promise<MyBooking[]> {
    return call('/bookings/mine');
  },
  attendees(sessionId: string): Promise<Attendee[]> {
    return call(`/class-sessions/${sessionId}/bookings`);
  },
};
