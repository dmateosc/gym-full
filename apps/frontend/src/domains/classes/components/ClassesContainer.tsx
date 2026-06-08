import { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { TodaySessionsView } from './TodaySessionsView';
import { MyClassesView } from './MyClassesView';

type Tab = 'today' | 'mine';

export default function ClassesContainer() {
  const { isInstructor, isAdmin } = useAuth();
  const canManage = isInstructor || isAdmin;
  const [tab, setTab] = useState<Tab>('today');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Clases colectivas</h1>
      </div>

      {canManage && (
        <div className="flex gap-1 mb-6 border-b border-[#334155]">
          {([
            { id: 'today' as const, label: 'Hoy' },
            { id: 'mine' as const, label: 'Mis clases' },
          ]).map(({ id, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-[#e50914] text-white'
                    : 'border-transparent text-[#94a3b8] hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {!canManage || tab === 'today' ? <TodaySessionsView /> : <MyClassesView />}
    </div>
  );
}
