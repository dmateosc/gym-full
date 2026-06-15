import { useCallback, useEffect, useState } from 'react';
import { ClassesService } from '../services/classesService';
import { BookingsService } from '../services/bookingsService';
import type { TodaySession } from '../types/class';
import { CategoryPill } from './CategoryPill';
import { TimeIcon, EquipmentIcon, NoResultsIcon } from '../../../assets/icons/index.tsx';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  });

export function TodaySessionsView() {
  const [sessions, setSessions] = useState<TodaySession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    setSessions(null);
    setError(null);
    ClassesService.today()
      .then(setSessions)
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const onBook = async (s: TodaySession) => {
    setBusy(s.sessionId);
    setError(null);
    try {
      await BookingsService.book(s.sessionId);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const onCancel = async (bookingId: string) => {
    if (!window.confirm('¿Cancelar tu reserva?')) return;
    setBusy(bookingId);
    setError(null);
    try {
      await BookingsService.cancel(bookingId);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12 text-[#f87171]">
        Error: {error}
      </div>
    );
  }

  if (sessions === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#1e293b] rounded-xl border border-[#334155] h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[#64748b] mb-4 flex justify-center">
          <NoResultsIcon />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No hay clases programadas hoy</h3>
        <p className="text-[#94a3b8]">Vuelve mañana o consulta el horario completo</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((s) => (
        <SessionCard
          key={s.sessionId}
          session={s}
          busy={busy === s.sessionId || busy === s.myBookingId}
          onBook={() => onBook(s)}
          onCancel={() => s.myBookingId && onCancel(s.myBookingId)}
        />
      ))}
    </div>
  );
}

function SessionCard({
  session: s,
  busy,
  onBook,
  onCancel,
}: {
  session: TodaySession;
  busy: boolean;
  onBook: () => void;
  onCancel: () => void;
}) {
  const cancelled = s.status === 'cancelled';
  const started = new Date(s.scheduledAt) <= new Date();
  const hasBooking = s.myBookingStatus !== null && s.myBookingStatus !== 'cancelled';
  const occupancy = `${s.bookedCount}/${s.capacity}`;

  return (
    <div
      className={`bg-[#1e293b] rounded-xl border p-5 transition-colors ${
        cancelled
          ? 'border-[#334155] opacity-60'
          : 'border-[#334155] hover:border-[rgba(64,206,66,0.6)]'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white pr-2">{s.name}</h3>
        <CategoryPill category={s.category} />
      </div>
      {s.description && (
        <p className="text-[#94a3b8] text-sm mb-4 line-clamp-2">{s.description}</p>
      )}
      <div className="flex flex-wrap gap-4 text-sm text-[#cbd5e1] mb-4">
        <span className="flex items-center gap-1.5">
          <span className="text-[#60a5fa]"><TimeIcon /></span>
          {formatTime(s.scheduledAt)} · {s.durationMin} min
        </span>
        {s.location && (
          <span className="flex items-center gap-1.5">
            <span className="text-[#4ade80]"><EquipmentIcon /></span>
            {s.location}
          </span>
        )}
        <span className="text-[#94a3b8]">
          Plazas: <span className="text-white font-semibold">{occupancy}</span>
          {s.waitlistCount > 0 && (
            <span className="text-[#fbbf24]"> · {s.waitlistCount} en espera</span>
          )}
        </span>
        {s.instructorName && (
          <span className="text-[#fbbf24]">
            Instructor: {s.instructorName}
          </span>
        )}
      </div>

      {cancelled ? (
        <p className="text-xs font-semibold text-[#f87171] uppercase">Cancelada</p>
      ) : hasBooking ? (
        <div className="flex items-center justify-between gap-2">
          <BookingBadge status={s.myBookingStatus!} position={s.myWaitlistPosition} />
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#fca5a5] hover:bg-[rgba(220,38,38,0.15)] disabled:opacity-50"
          >
            {busy ? 'Cancelando…' : 'Cancelar reserva'}
          </button>
        </div>
      ) : started ? (
        <p className="text-xs font-semibold text-[#94a3b8] uppercase">Ya ha comenzado</p>
      ) : (
        <button
          onClick={onBook}
          disabled={busy}
          className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1f9e3f] hover:opacity-90 disabled:opacity-60"
        >
          {busy
            ? 'Reservando…'
            : s.availableSpots > 0
              ? 'Reservar plaza'
              : 'Apuntarme a lista de espera'}
        </button>
      )}
    </div>
  );
}

function BookingBadge({
  status,
  position,
}: {
  status: NonNullable<TodaySession['myBookingStatus']>;
  position: number | null;
}) {
  if (status === 'confirmed') {
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          background: '#22c55e22',
          border: '1px solid #22c55e55',
          color: '#4ade80',
        }}
      >
        Plaza confirmada
      </span>
    );
  }
  if (status === 'waitlist') {
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          background: '#eab30822',
          border: '1px solid #eab30855',
          color: '#facc15',
        }}
      >
        Lista de espera{position ? ` · #${position}` : ''}
      </span>
    );
  }
  return null;
}
