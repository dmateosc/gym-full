import { useEffect, useState } from 'react';
import { ClassesService } from '../services/classesService';
import type { Class, CreateClassPayload, UpdateClassPayload } from '../types/class';
import {
  CLASS_CATEGORY_LABELS,
  DAY_OF_WEEK_LABELS,
} from '../types/class';
import { CategoryPill } from './CategoryPill';
import { ClassFormModal } from './ClassFormModal';

export function MyClassesView() {
  const [classes, setClasses] = useState<Class[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; editing: Class | null }>({
    open: false,
    editing: null,
  });

  const load = () => {
    setClasses(null);
    ClassesService.mine()
      .then(setClasses)
      .catch((e: Error) => setError(e.message));
  };

  useEffect(load, []);

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
          {classes.map((c) => (
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
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
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
          ))}
        </div>
      )}

      <ClassFormModal
        isOpen={modal.open}
        initial={modal.editing}
        onClose={() => setModal({ open: false, editing: null })}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
