export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  supabaseId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;           // Supabase auth user ID
  email: string | null;
  profile: UserProfile | null;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
}
