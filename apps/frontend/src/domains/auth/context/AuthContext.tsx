import React, { createContext, useEffect, useReducer, ReactNode } from 'react';
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
  signUp: (email: string, password: string, fullName?: string) => Promise<boolean>;
  signOut: () => void;
  clearError: () => void;
  getToken: () => string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Restaurar sesión desde el token en localStorage al montar
   */
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const profile = await AuthService.getMyProfile();
        if (profile) {
          dispatch({
            type: 'SET_USER',
            payload: {
              id: profile.id,
              email: profile.email,
              profile,
            },
          });
        } else {
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch {
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    initializeSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const { user: profile } = await AuthService.signIn(email, password);
      dispatch({
        type: 'SET_USER',
        payload: {
          id: profile.id,
          email: profile.email,
          profile,
        },
      });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
    }
  };

  const signUp = async (email: string, password: string, fullName?: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const { user: profile } = await AuthService.signUp(email, password, fullName);
      dispatch({
        type: 'SET_USER',
        payload: {
          id: profile.id,
          email: profile.email,
          profile,
        },
      });
      return true;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
      return false;
    }
  };

  const signOut = () => {
    AuthService.signOut();
    dispatch({ type: 'SET_USER', payload: null });
  };

  const getToken = (): string | null => {
    return AuthService.getToken();
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signUp, signOut, clearError, getToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
