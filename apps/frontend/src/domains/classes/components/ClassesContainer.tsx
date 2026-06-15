import { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { TodaySessionsView } from './TodaySessionsView';
import { MyClassesView } from './MyClassesView';
import { MyBookingsView } from './MyBookingsView';

type Tab = 'today' | 'mine-bookings' | 'mine-classes';

export default function ClassesContainer() {
  const { isInstructor, isAdmin } = useAuth();
  const canManage = isInstructor || isAdmin;
  const [tab, setTab] = useState<Tab>('today');

  const tabs: { id: Tab; label: string; visible: boolean }[] = [
    { id: 'today', label: 'Hoy', visible: true },
    { id: 'mine-bookings', label: 'Mis reservas', visible: true },
    { id: 'mine-classes', label: 'Mis clases', visible: canManage },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Clases colectivas</h1>
      </div>

      <div className="flex gap-1 mb-6 border-b border-[#334155] overflow-x-auto">
        {tabs
          .filter((t) => t.visible)
          .map(({ id, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? 'border-[#1f9e3f] text-white'
                    : 'border-transparent text-[#94a3b8] hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
      </div>

      {tab === 'today' && <TodaySessionsView />}
      {tab === 'mine-bookings' && <MyBookingsView />}
      {tab === 'mine-classes' && canManage && <MyClassesView />}
    </div>
  );
}
