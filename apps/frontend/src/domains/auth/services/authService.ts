import { supabase } from './supabase';
import { UserProfile } from '../types/auth.types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'https://gym-exercise-backend.vercel.app/api';

export const AuthService = {
  /**
   * Registrar nuevo usuario con email y contraseña
   */
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Iniciar sesión con email y contraseña
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Iniciar sesión con Google
   */
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Cerrar sesión
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  /**
   * Obtener sesión actual
   */
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Sincronizar perfil con el backend después del login
   * Crea el perfil si es la primera vez, lo actualiza si ya existe
   */
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
      console.error('Error sincronizando perfil');
      return null;
    }
  },

  /**
   * Obtener perfil del usuario autenticado desde el backend
   */
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
