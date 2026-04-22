import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { AdminService } from '../services/adminService';
import { UserProfile, UserRole } from '../../auth/types/auth.types';

const AdminUsersContainer: React.FC = () => {
  const { getToken, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await AdminService.getAllUsers(token);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const token = await getToken();
    if (!token) return;
    setUpdatingId(userId);
    try {
      const updated = await AdminService.updateUserRole(token, userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`¿Eliminar al usuario ${email}? Esta acción no se puede deshacer.`)) return;
    const token = await getToken();
    if (!token) return;
    setUpdatingId(userId);
    try {
      await AdminService.deleteUser(token, userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">👑 Gestión de Usuarios</h1>
          <p className="text-gray-400 text-sm mt-1">
            {users.length} usuarios registrados
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          🔄 Actualizar
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/50 border border-red-500/50 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Tabla de usuarios */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-400">Cargando usuarios...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 text-4xl mb-3">👥</div>
            <p className="text-gray-400">No hay usuarios registrados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
              <tr>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Usuario</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium hidden sm:table-cell">Registrado</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Rol</th>
                <th className="text-right px-6 py-4 text-gray-400 text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                const isCurrentUser = user.supabaseId === currentUser?.id;
                const isUpdating = updatingId === user.id;

                return (
                  <tr
                    key={user.id}
                    style={{
                      background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    {/* Avatar + datos */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{ background: user.role === 'admin' ? '#e50914' : '#374151' }}
                        >
                          {(user.fullName ?? user.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {user.fullName ?? <span className="text-gray-500 italic">Sin nombre</span>}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: '#e5091420', color: '#e50914' }}>
                                Tú
                              </span>
                            )}
                          </p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Fecha de registro */}
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-gray-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </td>

                    {/* Rol (editable) */}
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        disabled={isCurrentUser || isUpdating}
                        className="text-sm rounded-lg px-2 py-1.5 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: user.role === 'admin' ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.08)',
                          border: `1px solid ${user.role === 'admin' ? 'rgba(229,9,20,0.4)' : 'rgba(255,255,255,0.15)'}`,
                          color: user.role === 'admin' ? '#f87171' : '#9ca3af',
                        }}
                      >
                        <option value="user">👤 Usuario</option>
                        <option value="admin">👑 Admin</option>
                      </select>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      {!isCurrentUser && (
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          disabled={isUpdating}
                          className="text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            color: '#f87171',
                            border: '1px solid rgba(239,68,68,0.3)',
                          }}
                        >
                          {isUpdating ? '...' : 'Eliminar'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Info */}
      <div
        className="rounded-xl p-4 text-sm text-gray-400"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <strong className="text-gray-300">ℹ️ Roles:</strong>{' '}
        <strong className="text-red-400">Admin</strong> — acceso completo (crear/editar ejercicios, gestionar usuarios). {' '}
        <strong className="text-gray-300">Usuario</strong> — puede ver el catálogo y sus rutinas.
      </div>
    </div>
  );
};

export default AdminUsersContainer;
