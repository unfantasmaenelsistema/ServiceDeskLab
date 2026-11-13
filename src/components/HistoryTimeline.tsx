import React from 'react';
import { HistoryLogEntry, HistoryLogTipo } from '../types/itsm';

interface HistoryTimelineProps {
  historyLog: HistoryLogEntry[];
  titulo?: string;
  subtitulo?: string;
}

function estiloPorTipo(tipo: HistoryLogTipo): {
  ring: string;
  iconColor: string;
  labelColor: string;
} {
  switch (tipo) {
    case 'sla_incumplido':
      return {
        ring: 'border-red-500/50 bg-red-950/50',
        iconColor: 'text-red-400',
        labelColor: 'text-red-300',
      };
    case 'escalado_n2':
    case 'rfc_vinculado':
      return {
        ring: 'border-amber-500/50 bg-amber-950/40',
        iconColor: 'text-amber-400',
        labelColor: 'text-amber-200',
      };
    case 'cierre':
    case 'kb_aplicado':
      return {
        ring: 'border-emerald-500/50 bg-emerald-950/40',
        iconColor: 'text-emerald-400',
        labelColor: 'text-emerald-300',
      };
    case 'rca_actualizado':
    case 'problema_vinculado':
    case 'ci_asociado':
      return {
        ring: 'border-blue-500/50 bg-blue-950/40',
        iconColor: 'text-blue-400',
        labelColor: 'text-blue-200',
      };
    default:
      return {
        ring: 'border-slate-700 bg-[#111827]',
        iconColor: 'text-slate-300',
        labelColor: 'text-slate-200',
      };
  }
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  historyLog,
  titulo = 'Registro Histórico Inmutable',
  subtitulo = 'Trazabilidad cronológica solo lectura para auditoría docente',
}) => {
  const eventosOrdenados = [...historyLog].reverse();

  return (
    <section
      aria-label={titulo}
      className="flex flex-col space-y-3"
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 font-display text-xs font-semibold text-slate-100">
            <i
              className="fa-solid fa-clock-rotate-left text-[11px] text-blue-400"
              aria-hidden="true"
            />
            <span className="truncate">{titulo}</span>
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-400">{subtitulo}</p>
        </div>
        <span
          className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 whitespace-nowrap shrink-0"
          title="Registro bloqueado contra edición o borrado"
        >
          <i className="fa-solid fa-lock text-[9px]" aria-hidden="true" />
          <span className="tabular-nums">{historyLog.length}</span>
        </span>
      </div>

      {eventosOrdenados.length === 0 ? (
        <p className="rounded-lg border border-slate-800/80 bg-[#0B0F17] p-3 text-xs text-slate-400">
          Sin eventos registrados en la bitácora inmutable.
        </p>
      ) : (
        <ol className="relative space-y-3.5 pl-4 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-slate-800">
          {eventosOrdenados.map((ev) => {
            const estilo = estiloPorTipo(ev.tipo);
            return (
              <li key={ev.id} className="relative pl-4">
                <span
                  className={`absolute -left-4 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border ${estilo.ring}`}
                  aria-hidden="true"
                >
                  <i className={`${ev.icono} text-[10px] ${estilo.iconColor}`} />
                </span>

                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-[10px] text-slate-400">
                    <span className="font-mono tabular-nums text-slate-400">
                      {ev.timestampSimuladoLabel}
                    </span>
                    <span className="truncate font-medium text-slate-500">
                      {ev.actor}
                    </span>
                  </div>
                  <p className={`text-xs font-semibold leading-snug ${estilo.labelColor}`}>
                    {ev.accion}
                  </p>
                  {ev.detalle && (
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      {ev.detalle}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
