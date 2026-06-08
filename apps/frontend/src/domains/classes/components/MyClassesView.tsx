import { useEffect, useState } from 'react';
import { ClassesService } from '../services/classesService';
import type { Class, CreateClassPayload, UpdateClassPayload } from '../types/class';
import {
  CLASS_CATEGORY_LABELS,
  DAY_OF_WEEK_LABELS,
} from '../types/class';
import { CategoryPill } from './CategoryPill';
import { ClassFormModal } from './ClassFormModal';
import { AttendeesModal } from './AttendeesModal';
import { useAuth } from '../../auth/hooks/useAuth';
import { AdminService } from '../../admin/services/adminService';

export function MyClassesView() {
  const { isAdmin, getToken } = useAuth();
  const [classes, setClasses] = useState<Class[] | null>(null);
  const [instructorById, setInstructorById] = useState<Map<string, string>>(new Map());
  const [todaySessionByClass, setTodaySessionByClass] = useState<Map<string, string>>(
    new Map(),
  );
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; editing: Class | null }>({
    open: false,
    editing: null,
  });
  const [attendees, setAttendees] = useState<{ sessionId: string; title: string } | null>(
    null,
  );

  const load = () => {
    setClasses(null);
    // Admins see every class; instructors only their own.
    const fetcher = isAdmin ? ClassesService.listAll() : ClassesService.mine();
    fetcher
      .then(setClasses)
      .catch((e: Error) => setError(e.message));

    if (isAdmin) {
      const token = getToken();
      if (token) {
        AdminService.getAllUsers(token)
          .then((users) => {
            const map = new Map<string, string>();
            for (const u of users) {
              map.set(u.id, u.fullName ?? u.email);
            }
            setInstructorById(map);
          })
          .catch(() => { /* no es crítico */ });
      }
    }

    ClassesService.today()
      .then((sessions) => {
        const map = new Map<string, string>();
        for (const s of sessions) map.set(s.classId, s.sessionId);
        setTodaySessionByClass(map);
      })
      .catch(() => { /* not critical */ });
  };

  // load depends on isAdmin / getToken implicitly; reload whenever role flips.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [isAdmin]);

  const handleSubmit = async (payload: CreateClassPayload | UpdateClassPayload) => {
    if (modal.editing) {
      await ClassesService.update(modal.editing.id, payload as UpdateClassPayload);
    } else {
      await ClassesService.create(payload as CreateClassPayload);
    }
    load();
  };

  const handleDelete = async (klass: Class) => {
    if (!window.confirm(`¿Desactivar la clase "${klass.name}"?`)) return;
    try {
      await ClassesService.remove(klass.id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleReactivate = async (klass: Class) => {
    try {
      await ClassesService.update(klass.id, { active: true });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Mis clases</h2>
        <button
          onClick={() => setModal({ open: true, editing: null })}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#e50914] hover:opacity-90"
        >
          + Nueva clase
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#ef444415', border: '1px solid #ef444455', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {classes === null ? (
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1e293b] rounded-xl border border-[#334155] h-24 animate-pulse" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 bg-[#1e293b] rounded-xl border border-[#334155]">
          <p className="text-[#94a3b8] mb-3">Aún no has creado ninguna clase.</p>
          <button
            onClick={() => setModal({ open: true, editing: null })}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#e50914] hover:opacity-90"
          >
            Crear la primera
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((c) => {
            const todaySessionId = todaySessionByClass.get(c.id);
            return (
              <div
                key={c.id}
                className={`bg-[#1e293b] rounded-xl border p-4 flex items-start justify-between gap-4 ${
                  c.active ? 'border-[#334155]' : 'border-[#334155] opacity-60'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-semibold text-white">{c.name}</h3>
                    <CategoryPill category={c.category} />
                    {!c.active && (
                      <span className="text-xs font-semibold uppercase text-[#94a3b8]">Inactiva</span>
                    )}
                  </div>
                  {c.description && (
                    <p className="text-[#94a3b8] text-sm mb-2 line-clamp-2">{c.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-[#cbd5e1]">
                    <span>{DAY_OF_WEEK_LABELS[c.dayOfWeek]} · {c.startTime}</span>
                    <span>{c.durationMin} min</span>
                    <span>Aforo {c.capacity}</span>
                    {c.location && <span>{c.location}</span>}
                    <span className="text-[#94a3b8]">{CLASS_CATEGORY_LABELS[c.category]}</span>
                    {isAdmin && (
                      <span className="text-[#fbbf24]">
                        Instructor: {instructorById.get(c.instructorId) ?? c.instructorId.slice(0, 8)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {todaySessionId && (
                    <button
                      onClick={() => setAttendees({ sessionId: todaySessionId, title: c.name })}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#60a5fa] hover:bg-white/5"
                    >
                      Ver asistentes hoy
                    </button>
                  )}
                  <button
                    onClick={() => setModal({ open: true, editing: c })}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#cbd5e1] bg-white/5 hover:bg-white/10"
                  >
                    Editar
                  </button>
                  {c.active ? (
                    <button
                      onClick={() => handleDelete(c)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#fca5a5] hover:bg-[rgba(229,9,20,0.15)]"
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(c)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#4ade80] hover:bg-[rgba(34,197,94,0.15)]"
                    >
                      Reactivar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ClassFormModal
        isOpen={modal.open}
        initial={modal.editing}
        onClose={() => setModal({ open: false, editing: null })}
        onSubmit={handleSubmit}
      />
      <AttendeesModal
        sessionId={attendees?.sessionId ?? null}
        title={attendees?.title ?? ''}
        onClose={() => setAttendees(null)}
      />
    </div>
  );
}
