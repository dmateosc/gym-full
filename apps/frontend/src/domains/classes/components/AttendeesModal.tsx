import { useEffect, useState } from 'react';
import { BookingsService } from '../services/bookingsService';
import type { Attendee } from '../types/class';

interface Props {
  sessionId: string | null;
  title: string;
  onClose: () => void;
}

export function AttendeesModal({ sessionId, title, onClose }: Props) {
  const [list, setList] = useState<Attendee[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    setList(null);
    setError(null);
    BookingsService.attendees(sessionId)
      .then(setList)
      .catch((e: Error) => setError(e.message));
  }, [sessionId]);

  if (!sessionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="bg-[#1e293b] rounded-xl border border-[#334155] w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1f9e3f] text-white p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Asistentes — {title}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {error ? (
            <p className="text-[#f87171] text-sm">{error}</p>
          ) : list === null ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-[#172033] rounded animate-pulse" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="text-[#94a3b8] text-sm text-center py-6">Aún no hay asistentes inscritos</p>
          ) : (
            <ul className="space-y-2">
              {list.map((a) => (
                <li
                  key={a.bookingId}
                  className="flex items-center justify-between gap-3 bg-[#172033] border border-[#334155] rounded-lg p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {a.userFullName ?? <span className="text-[#94a3b8] italic">Sin nombre</span>}
                    </p>
                    <p className="text-[#94a3b8] text-xs truncate">{a.userEmail}</p>
                  </div>
                  {a.status === 'confirmed' ? (
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                      style={{
                        background: '#22c55e22',
                        border: '1px solid #22c55e55',
                        color: '#4ade80',
                      }}
                    >
                      Confirmado
                    </span>
                  ) : (
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                      style={{
                        background: '#eab30822',
                        border: '1px solid #eab30855',
                        color: '#facc15',
                      }}
                    >
                      Espera #{a.position}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
