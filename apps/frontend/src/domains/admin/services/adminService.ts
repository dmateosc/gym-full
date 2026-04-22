import { UserProfile, UserRole } from '../../auth/types/auth.types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'https://gym-exercise-backend.vercel.app/api';

export const AdminService = {
  async getAllUsers(token: string): Promise<UserProfile[]> {
    const res = await fetch(`${BACKEND_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al obtener usuarios');
    return res.json();
  },

  async updateUserRole(token: string, userId: string, role: UserRole): Promise<UserProfile> {
    const res = await fetch(`${BACKEND_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Error al actualizar rol');
    return res.json();
  },

  async deleteUser(token: string, userId: string): Promise<void> {
    const res = await fetch(`${BACKEND_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al eliminar usuario');
  },
};
