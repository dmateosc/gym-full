import { APP_CONFIG } from '../../shared/config/app.config';
import type { UserProfile } from '../types/auth.types';

const API = APP_CONFIG.API.BACKEND_URL;

const TOKEN_KEY = 'auth_token';

export const TokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const AuthService = {
  async signIn(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(err.message ?? 'Credenciales inválidas');
    }
    const data = await res.json() as { token: string; user: UserProfile };
    TokenStorage.set(data.token);
    return data;
  },

  async signUp(email: string, password: string, fullName?: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(err.message ?? 'Error al registrarse');
    }
    const data = await res.json() as { token: string; user: UserProfile };
    TokenStorage.set(data.token);
    return data;
  },

  async getMyProfile(): Promise<UserProfile | null> {
    const token = TokenStorage.get();
    if (!token) return null;
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        TokenStorage.clear();
        return null;
      }
      return res.json() as Promise<UserProfile>;
    } catch {
      return null;
    }
  },

  signOut() {
    TokenStorage.clear();
  },

  getToken(): string | null {
    return TokenStorage.get();
  },
};
