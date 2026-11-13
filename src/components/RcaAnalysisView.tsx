import React from 'react';
import { IshikawaDiagrama, Problema } from '../types/itsm';
import { HistoryTimeline } from './HistoryTimeline';
import { EstadoProblemaIndicador, PrioridadIndicador } from './ItsmStatusHelpers';
import { RcaToolsPanel } from './RcaToolsPanel';

interface RcaAnalysisViewProps {
  problemas: Problema[];
  problemaSeleccionadoId: string;
  onSeleccionarProblema: (id: string) => void;
  onGuardarRca: (
    problemaId: string,
    payload: {
      analisis5Porques: string[];
      causaRaiz: string;
      workaround: string;
      ishikawa: IshikawaDiagrama;
    }
  ) => void;
}

export const RcaAnalysisView: React.FC<RcaAnalysisViewProps> = ({
  problemas,
  problemaSeleccionadoId,
  onSeleccionarProblema,
  onGuardarRca,
}) => {
  const problema =
    problemas.find((p) => p.id === problemaSeleccionadoId) ?? problemas[0];

  if (!problema) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-8 text-center text-sm text-slate-300">
        No hay problemas registrados para analizar.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Problem Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-[#111827] p-4">
        <div className="flex flex-wrap items-center gap-2">
          {problemas.map((p) => {
            const activo = p.id === problema.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSeleccionarProblema(p.id)}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap ${
                  activo
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-800 bg-[#0B0F17] text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {p.id}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <PrioridadIndicador prioridad={problema.prioridad} />
          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>
          <EstadoProblemaIndicador estado={problema.estado} />
          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-slate-300">{problema.ciAfectado}</span>
        </div>
      </div>

      {/* Unified RCA Interactive Workbench + Lateral Timeline */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="rounded-xl border border-slate-800/80 bg-[#111827] p-5 space-y-4 xl:col-span-8">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-100">
              {problema.id} — {problema.titulo}
            </h2>
            <p className="mt-1 text-xs text-slate-400">{problema.descripcion}</p>
          </div>

          <RcaToolsPanel problema={problema} onGuardarRca={onGuardarRca} />
        </div>

        <aside
          aria-label={`Timeline de auditoría del problema ${problema.id}`}
          className="rounded-xl border border-slate-800/80 bg-[#111827] p-5 xl:col-span-4"
        >
          <HistoryTimeline
            historyLog={problema.historyLog}
            titulo={`Timeline · ${problema.id}`}
            subtitulo="Auditoría cronológica inmutable del Problema"
          />
        </aside>
      </div>
    </div>
  );
};
