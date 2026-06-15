import { useEffect, useState } from 'react';
import type {
  Class,
  ClassCategory,
  CreateClassPayload,
  UpdateClassPayload,
} from '../types/class';
import {
  CLASS_CATEGORIES,
  CLASS_CATEGORY_LABELS,
  DAY_OF_WEEK_LABELS,
} from '../types/class';
import { useAuth } from '../../auth/hooks/useAuth';
import { AdminService } from '../../admin/services/adminService';
import type { UserProfile } from '../../auth/types/auth.types';

interface Props {
  isOpen: boolean;
  initial?: Class | null;
  onClose: () => void;
  onSubmit: (payload: CreateClassPayload | UpdateClassPayload) => Promise<void>;
}

const inputClass =
  'w-full px-3 py-2 bg-[#334155] border border-[#475569] rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#1f9e3f] focus:ring-2 focus:ring-[rgba(64,206,66,0.25)] text-sm';

const labelClass = 'block text-xs font-medium text-[#cbd5e1] mb-1.5';

export function ClassFormModal({ isOpen, initial, onClose, onSubmit }: Props) {
  const { isAdmin, getToken } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ClassCategory>('cycling');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('19:00');
  const [durationMin, setDurationMin] = useState(60);
  const [capacity, setCapacity] = useState(20);
  const [location, setLocation] = useState('');
  const [instructorId, setInstructorId] = useState<string>('');
  const [instructors, setInstructors] = useState<UserProfile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the instructor list when an admin opens the form.
  useEffect(() => {
    if (!isOpen || !isAdmin) return;
    const token = getToken();
    if (!token) return;
    AdminService.getAllUsers(token)
      .then((users) =>
        setInstructors(
          users.filter((u) => u.role === 'instructor' || u.role === 'admin'),
        ),
      )
      .catch(() => { /* silenciar — el campo dropdown queda vacío */ });
  }, [isOpen, isAdmin, getToken]);

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setName(initial.name);
      setDescription(initial.description ?? '');
      setCategory(initial.category);
      setDayOfWeek(initial.dayOfWeek);
      setStartTime(initial.startTime);
      setDurationMin(initial.durationMin);
      setCapacity(initial.capacity);
      setLocation(initial.location ?? '');
      setInstructorId(initial.instructorId);
    } else {
      setName('');
      setDescription('');
      setCategory('cycling');
      setDayOfWeek(1);
      setStartTime('19:00');
      setDurationMin(60);
      setCapacity(20);
      setLocation('');
      setInstructorId('');
    }
    setError(null);
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        name,
        description: description || null,
        category,
        dayOfWeek,
        startTime,
        durationMin,
        capacity,
        location: location || null,
        // Only admins can set instructorId; for instructors the backend ignores it.
        ...(isAdmin && instructorId ? { instructorId } : {}),
      });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="bg-[#1e293b] rounded-xl border border-[#334155] w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1f9e3f] text-white p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{initial ? 'Editar clase' : 'Nueva clase'}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ background: '#ef444415', border: '1px solid #ef444455', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <div>
            <label className={labelClass}>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} className={inputClass} placeholder="Spinning matutino" />
          </div>

          <div>
            <label className={labelClass}>Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={2} className={`${inputClass} resize-none`} placeholder="Opcional" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ClassCategory)} className={`${inputClass} cursor-pointer`}>
                {CLASS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CLASS_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Día de la semana</label>
              <select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} className={`${inputClass} cursor-pointer`}>
                {DAY_OF_WEEK_LABELS.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Inicio</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Duración (min)</label>
              <input type="number" min={1} max={600} value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Aforo</label>
              <input type="number" min={1} max={1000} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Ubicación</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={120} className={inputClass} placeholder="Sala 1, Pista exterior, …" />
          </div>

          {isAdmin && (
            <div>
              <label className={labelClass}>Instructor</label>
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">— Sin asignar (yo mismo) —</option>
                {instructors.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName ?? u.email} {u.role === 'admin' ? '· admin' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-[#cbd5e1] hover:bg-white/5">Cancelar</button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1f9e3f] hover:opacity-90 disabled:opacity-60"
            >
              {busy ? 'Guardando…' : initial ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
