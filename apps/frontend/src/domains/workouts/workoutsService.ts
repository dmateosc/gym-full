import { APP_CONFIG } from '../shared/config/app.config';
import { AuthService } from '../auth/services/authService';
import type { WorkoutSession } from './types';

const BASE = APP_CONFIG.API.BASE_URL;

function authHeaders(): HeadersInit {
  const token = AuthService.getToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const WorkoutsService = {
  start(routineId: string): Promise<WorkoutSession> {
    return fetch(`${BASE}/workouts/start/${routineId}`, {
      method: 'POST',
      headers: authHeaders(),
    }).then((r) => unwrap<WorkoutSession>(r));
  },

  listMine(): Promise<WorkoutSession[]> {
    return fetch(`${BASE}/workouts/mine`, { headers: authHeaders() }).then((r) =>
      unwrap<WorkoutSession[]>(r),
    );
  },

  getOne(id: string): Promise<WorkoutSession> {
    return fetch(`${BASE}/workouts/${id}`, { headers: authHeaders() }).then((r) =>
      unwrap<WorkoutSession>(r),
    );
  },

  logSet(
    id: string,
    payload: {
      routineExerciseId: string;
      setNumber: number;
      weight?: number;
      reps?: number;
      notes?: string;
    },
  ): Promise<WorkoutSession> {
    return fetch(`${BASE}/workouts/${id}/sets`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((r) => unwrap<WorkoutSession>(r));
  },

  complete(id: string, notes?: string): Promise<WorkoutSession> {
    return fetch(`${BASE}/workouts/${id}/complete`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ notes }),
    }).then((r) => unwrap<WorkoutSession>(r));
  },

  abandon(id: string): Promise<void> {
    return fetch(`${BASE}/workouts/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((r) => {
      if (!r.ok && r.status !== 204) throw new Error(`HTTP ${r.status}`);
    });
  },
};
