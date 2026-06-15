import React, { useState } from 'react';
import { useRoutinesWithCache } from '../../shared';
import RoutineView from './RoutineView';
import EmptyRoutineState from './EmptyRoutineState';
import RoutineDateSelector from './RoutineDateSelector';
import MyRoutinesView from './MyRoutinesView';
import PublicRoutinesView from './PublicRoutinesView';
import { RoutineService } from '../services/routineService';
import { AlertIcon } from '../../../assets/icons/index.tsx';

type Tab = 'today' | 'mine' | 'public';

const RoutinesContainer: React.FC = () => {
  const { currentRoutine, isLoading, error } = useRoutinesWithCache();
  const [tab, setTab] = useState<Tab>('today');
  const [savingClone, setSavingClone] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [cloneOk, setCloneOk] = useState<string | null>(null);

  const handleSaveAsMine = async (routineId: string) => {
    setSavingClone(true);
    setCloneError(null);
    setCloneOk(null);
    try {
      await RoutineService.cloneRoutineToMine(routineId);
      setCloneOk('Guardada en tus rutinas.');
    } catch (e) {
      setCloneError((e as Error).message);
    } finally {
      setSavingClone(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'today', label: 'Hoy' },
    { id: 'mine', label: 'Mis rutinas' },
    { id: 'public', label: 'Públicas' },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-[#334155]">
        {tabs.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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

      {tab === 'today' ? (
        <>
          {(cloneError || cloneOk) && (
            <div
              className={`p-3 rounded-lg text-sm mb-4 flex items-start gap-2 ${
                cloneError
                  ? 'bg-red-900/40 border border-red-500/50 text-red-300'
                  : 'bg-[#1f9e3f22] border border-[#1f9e3f55] text-[#6ee06f]'
              }`}
            >
              <span className="mt-0.5"><AlertIcon size={16} /></span>
              <span>{cloneError ?? cloneOk}</span>
            </div>
          )}

          <RoutineDateSelector
            currentRoutine={currentRoutine}
            onRoutineChange={() => {}}
            onLoadingChange={() => {}}
            onErrorChange={() => {}}
          />

          {isLoading ? (
            <div className="flex items-center justify-center min-h-64 px-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 sm:h-10 lg:h-12 w-8 sm:w-10 lg:w-12 border-4 border-[#1f9e3f] border-t-transparent mx-auto mb-3 sm:mb-4"></div>
                <p className="text-gray-300 text-sm sm:text-base">
                  Cargando rutina...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <div className="text-red-500 mb-4 flex justify-center">
                <AlertIcon size={40} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Error al cargar rutina
              </h3>
              <p className="text-gray-400">{error}</p>
            </div>
          ) : currentRoutine ? (
            <RoutineView
              routine={currentRoutine}
              onSaveAsMine={(r) => handleSaveAsMine(r.id)}
              savingAsMine={savingClone}
            />
          ) : (
            <EmptyRoutineState />
          )}
        </>
      ) : tab === 'mine' ? (
        <MyRoutinesView />
      ) : (
        <PublicRoutinesView />
      )}
    </div>
  );
};

export default RoutinesContainer;
