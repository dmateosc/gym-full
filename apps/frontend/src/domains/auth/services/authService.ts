import { supabase } from './supabase';
import type { UserProfile } from '../types/auth.types';
import { APP_CONFIG } from '../../shared/config/app.config';

const BACKEND_URL = APP_CONFIG.API.BACKEND_URL;

// Sync token cache — updated by onAuthStateChange
let _cachedToken: string | null = null;
supabase.auth.onAuthStateChange((_, session) => {
  _cachedToken = session?.access_token ?? null;
});
// Seed cache from existing session on load
supabase.auth.getSession().then(({ data: { session } }) => {
  _cachedToken = session?.access_token ?? null;
});

export const AuthService = {
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${globalThis.location.origin}/` },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${globalThis.location.origin}/?recovery=1`,
    });
    if (error) throw new Error(error.message);
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    _cachedToken = null;
    if (error) throw new Error(error.message);
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Sync getter — returns cached token (null until first session loads)
  getToken(): string | null {
    return _cachedToken;
  },

  async syncProfile(token: string, fullName?: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${BACKEND_URL}/users/me/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName }),
      });
      if (!response.ok) return null;
      return response.json() as Promise<UserProfile>;
    } catch {
      return null;
    }
  },

  async getMyProfile(token: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${BACKEND_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return null;
      return response.json() as Promise<UserProfile>;
    } catch {
      return null;
    }
  },
};
