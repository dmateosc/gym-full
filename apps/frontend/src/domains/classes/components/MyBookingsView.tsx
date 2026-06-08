import { useCallback, useEffect, useState } from 'react';
import { BookingsService } from '../services/bookingsService';
import type { MyBooking } from '../types/class';
import { CategoryPill } from './CategoryPill';
import { TimeIcon, EquipmentIcon, NoResultsIcon } from '../../../assets/icons/index.tsx';

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  });

export function MyBookingsView() {
  const [bookings, setBookings] = useState<MyBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    setBookings(null);
    setError(null);
    BookingsService.mine()
      .then(setBookings)
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const onCancel = async (bookingId: string) => {
    if (!window.confirm('¿Cancelar esta reserva?')) return;
    setBusy(bookingId);
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
    return <div className="text-center py-12 text-[#f87171]">Error: {error}</div>;
  }

  if (bookings === null) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#1e293b] rounded-xl border border-[#334155] h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[#64748b] mb-4 flex justify-center">
          <NoResultsIcon />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No tienes reservas activas</h3>
        <p className="text-[#94a3b8]">Reserva tu plaza desde la pestaña "Hoy"</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div
          key={b.bookingId}
          className="bg-[#1e293b] rounded-xl border border-[#334155] p-4 flex items-start justify-between gap-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-semibold text-white">{b.name}</h3>
              <CategoryPill category={b.category} />
              {b.status === 'waitlist' && (
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: '#eab30822',
                    border: '1px solid #eab30855',
                    color: '#facc15',
                  }}
                >
                  Lista de espera{b.position ? ` · #${b.position}` : ''}
                </span>
              )}
              {b.status === 'confirmed' && (
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: '#22c55e22',
                    border: '1px solid #22c55e55',
                    color: '#4ade80',
                  }}
                >
                  Confirmada
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-[#cbd5e1]">
              <span className="flex items-center gap-1.5">
                <span className="text-[#60a5fa]"><TimeIcon /></span>
                <span className="capitalize">{formatDateTime(b.scheduledAt)}</span>
                · {b.durationMin} min
              </span>
              {b.location && (
                <span className="flex items-center gap-1.5">
                  <span className="text-[#4ade80]"><EquipmentIcon /></span>
                  {b.location}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onCancel(b.bookingId)}
            disabled={busy === b.bookingId}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#fca5a5] hover:bg-[rgba(229,9,20,0.15)] disabled:opacity-50 shrink-0"
          >
            {busy === b.bookingId ? 'Cancelando…' : 'Cancelar'}
          </button>
        </div>
      ))}
    </div>
  );
}
