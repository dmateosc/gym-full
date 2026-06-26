import React, { useRef, useState } from 'react';
import { RoutineService } from '../services/routineService';
import { AlertIcon } from '../../../assets/icons/index.tsx';

export interface ImportedDraft {
  name: string;
  description?: string;
  exercises: {
    exerciseId: string | null;
    rawName: string;
    matchedName?: string | null;
    orderInRoutine: number;
    sets?: number;
    reps?: number;
    weight?: number;
    durationSeconds?: number;
    distanceMeters?: number;
    restSeconds?: number;
    notes?: string;
  }[];
}

interface Props {
  onClose: () => void;
  onParsed: (draft: ImportedDraft) => void;
}

const ImportRoutineModal: React.FC<Props> = ({ onClose, onParsed }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    setFilename(file.name);
    try {
      const draft = await RoutineService.importFromFile(file);
      onParsed(draft);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => !busy && onClose()}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#1e293b] border border-[#334155] p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Importar rutina</h2>
            <p className="text-[#94a3b8] text-xs mt-1">
              Sube un Excel/CSV o una captura. La IA extraerá los ejercicios y
              te dejará la rutina lista para revisar.
            </p>
          </div>
          <button
            onClick={() => !busy && onClose()}
            disabled={busy}
            aria-label="Cerrar"
            className="text-[#94a3b8] hover:text-white text-base leading-none disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />

        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-full py-8 rounded-xl border-2 border-dashed border-[#475569] hover:border-[#1f9e3f] hover:bg-[#1f9e3f0a] text-center text-[#cbd5e1] text-sm transition-colors disabled:opacity-60"
        >
          {busy ? (
            <>
              Analizando «{filename}»…
              <br />
              <span className="text-[#94a3b8] text-xs">
                Puede tardar unos segundos
              </span>
            </>
          ) : (
            <>
              <span className="text-white font-semibold">
                Pulsa para elegir un archivo
              </span>
              <br />
              <span className="text-[#94a3b8] text-xs">
                .xlsx, .csv, JPG o PNG (máx. 8 MB)
              </span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 rounded-lg bg-red-900/40 border border-red-500/50 text-red-300 text-sm flex items-start gap-2">
            <span className="mt-0.5">
              <AlertIcon size={16} />
            </span>
            <span>{error}</span>
          </div>
        )}

        <p className="text-[#64748b] text-[11px]">
          Tip: en Excel funciona mejor con columnas tipo «Ejercicio · Series ·
          Reps · Peso · Descanso · Notas». La imagen puede ser una foto de la
          libreta o un screenshot de otra app.
        </p>
      </div>
    </div>
  );
};

export default ImportRoutineModal;
