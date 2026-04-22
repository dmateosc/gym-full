import React, { createContext, useEffect, useReducer, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { AuthService } from '../services/authService';
import { AuthState, AuthUser } from '../types/auth.types';

// ─── Estado y acciones ──────────────────────────────────────────────────────

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isAdmin: action.payload?.profile?.role === 'admin',
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// ─── Contexto ────────────────────────────────────────────────────────────────

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  getToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Inicializa la sesión y sincroniza el perfil con el backend
   */
  const initializeSession = async () => {
    try {
      const session = await AuthService.getSession();

      if (session?.user) {
        const profile = await AuthService.getMyProfile(session.access_token);
        // Si no existe perfil aún, sincronizarlo (primer login)
        const finalProfile = profile ?? await AuthService.syncProfile(
          session.access_token,
          session.user.user_metadata?.full_name,
        );

        dispatch({
          type: 'SET_USER',
          payload: {
            id: session.user.id,
            email: session.user.email ?? null,
            profile: finalProfile,
          },
        });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch {
      dispatch({ type: 'SET_USER', payload: null });
    }
  };

  useEffect(() => {
    initializeSession();

    // Escuchar cambios de sesión (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          dispatch({ type: 'SET_USER', payload: null });
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const profile = await AuthService.syncProfile(
            session.access_token,
            session.user.user_metadata?.full_name,
          );

          dispatch({
            type: 'SET_USER',
            payload: {
              id: session.user.id,
              email: session.user.email ?? null,
              profile,
            },
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      await AuthService.signIn(email, password);
      // onAuthStateChange se encarga de actualizar el estado
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      await AuthService.signUp(email, password, fullName);
      // El usuario necesita confirmar email antes de poder iniciar sesión
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signInWithGoogle = async () => {
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      await AuthService.signInWithGoogle();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      dispatch({ type: 'SET_USER', payload: null });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
    }
  };

  const getToken = async (): Promise<string | null> => {
    const session = await AuthService.getSession();
    return session?.access_token ?? null;
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signUp, signInWithGoogle, signOut, clearError, getToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
