import React from 'react';
import {
  CanalEntrada,
  ProblemaEstado,
  Ticket,
  TicketEstado,
  TicketPrioridad,
} from '../types/itsm';

export function formatearTiempoSla(segundosTotales: number): string {
  const abs = Math.abs(Math.round(segundosTotales));
  const horas = Math.floor(abs / 3600);
  const mins = Math.floor((abs % 3600) / 60);
  const segs = abs % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (horas > 0) {
    return `${horas}:${pad(mins)}:${pad(segs)}`;
  }
  return `${pad(mins)}:${pad(segs)}`;
}

export const CanalEntradaIndicador: React.FC<{ canal: CanalEntrada }> = ({
  canal,
}) => {
  const iconMap: Record<CanalEntrada, string> = {
    'Portal de Usuario': 'fa-solid fa-globe',
    Teléfono: 'fa-solid fa-phone',
    Monitorización: 'fa-solid fa-wave-square',
    'Correo Corporativo': 'fa-regular fa-envelope',
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 whitespace-nowrap">
      <i className={`${iconMap[canal]} text-[11px] text-slate-400`} aria-hidden="true" />
      <span>{canal}</span>
    </span>
  );
};

export const PrioridadIndicador: React.FC<{ prioridad: TicketPrioridad }> = ({
  prioridad,
}) => {
  if (prioridad === 'P1 - Crítica') {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-red-400 whitespace-nowrap">
        <i className="fa-solid fa-angles-up text-[11px]" aria-hidden="true" />
        <span>P1 Crítica</span>
      </span>
    );
  }
  if (prioridad === 'P2 - Alta') {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-amber-400 whitespace-nowrap">
        <i className="fa-solid fa-chevron-up text-[11px]" aria-hidden="true" />
        <span>P2 Alta</span>
      </span>
    );
  }
  if (prioridad === 'P3 - Media') {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-blue-400 whitespace-nowrap">
        <i className="fa-solid fa-equals text-[10px]" aria-hidden="true" />
        <span>P3 Media</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-slate-400 whitespace-nowrap">
      <i className="fa-solid fa-chevron-down text-[11px]" aria-hidden="true" />
      <span>P4 Baja</span>
    </span>
  );
};

export const EstadoTicketIndicador: React.FC<{ estado: TicketEstado }> = ({
  estado,
}) => {
  if (estado === 'Resuelto') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 whitespace-nowrap">
        <i className="fa-solid fa-circle-check text-[11px]" aria-hidden="true" />
        <span>Resuelto</span>
      </span>
    );
  }
  if (estado === 'Escalado (N2)') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 whitespace-nowrap">
        <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" aria-hidden="true" />
        <span>Escalado (N2)</span>
      </span>
    );
  }
  if (estado === 'En Espera') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 whitespace-nowrap">
        <i className="fa-regular fa-hourglass-half text-[11px]" aria-hidden="true" />
        <span>En Espera</span>
      </span>
    );
  }
  if (estado === 'En Progreso (N1)') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 whitespace-nowrap">
        <i className="fa-solid fa-spinner text-[11px]" aria-hidden="true" />
        <span>En Progreso (N1)</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 whitespace-nowrap">
      <i className="fa-regular fa-circle-dot text-[11px]" aria-hidden="true" />
      <span>Nuevo</span>
    </span>
  );
};

export const EstadoProblemaIndicador: React.FC<{ estado: ProblemaEstado }> = ({
  estado,
}) => {
  if (estado === 'Error Conocido (KEDB)') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 whitespace-nowrap">
        <i className="fa-solid fa-book-open text-[11px]" aria-hidden="true" />
        <span>Error Conocido (KEDB)</span>
      </span>
    );
  }
  if (estado === 'Causa Raíz Identificada') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 whitespace-nowrap">
        <i className="fa-solid fa-magnifying-glass-chart text-[11px]" aria-hidden="true" />
        <span>Causa Raíz Identificada</span>
      </span>
    );
  }
  if (estado === 'Resuelto') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 whitespace-nowrap">
        <i className="fa-solid fa-circle-check text-[11px]" aria-hidden="true" />
        <span>Resuelto</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 whitespace-nowrap">
      <i className="fa-solid fa-microscope text-[11px]" aria-hidden="true" />
      <span>Investigación</span>
    </span>
  );
};

export const SlaBarraProgreso: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const restanteSeg = ticket.slaObjetivoSeg - ticket.slaTranscurridoSeg;
  const pct = Math.min(
    100,
    Math.round(
      (ticket.slaTranscurridoSeg / Math.max(ticket.slaObjetivoSeg, 1)) * 100
    )
  );

  if (ticket.estado === 'Resuelto') {
    return (
      <div className="w-36 space-y-1">
        <div className="flex items-center justify-between font-mono text-[11px] tabular-nums text-emerald-400">
          <span>Cerrado</span>
          <span>{formatearTiempoSla(ticket.slaTranscurridoSeg)}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  if (ticket.slaPausado) {
    return (
      <div className="w-36 space-y-1">
        <div className="flex items-center justify-between font-mono text-[11px] tabular-nums text-slate-300">
          <span>Pausado</span>
          <span>{formatearTiempoSla(restanteSeg)}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-slate-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  const vencido = ticket.slaIncumplido || restanteSeg < 0;
  const enRiesgo = !vencido && pct >= 75;

  const barColor = vencido
    ? 'bg-red-500'
    : enRiesgo
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  const textColor = vencido
    ? 'text-red-400 font-semibold'
    : enRiesgo
      ? 'text-amber-400 font-medium'
      : 'text-slate-300';

  return (
    <div className="w-36 space-y-1">
      <div
        className={`flex items-center justify-between font-mono text-[11px] tabular-nums ${textColor}`}
      >
        <span>
          {vencido
            ? `-${formatearTiempoSla(restanteSeg)} venc.`
            : `${formatearTiempoSla(restanteSeg)}`}
        </span>
        <span className="text-slate-500">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export const CronometroSlaVisual: React.FC<{ ticket: Ticket }> = ({
  ticket,
}) => {
  const restanteSeg = ticket.slaObjetivoSeg - ticket.slaTranscurridoSeg;
  const pctConsumido = Math.min(
    100,
    Math.round(
      (ticket.slaTranscurridoSeg / Math.max(ticket.slaObjetivoSeg, 1)) * 100
    )
  );
  const pctRestante = Math.max(0, 100 - pctConsumido);

  if (ticket.estado === 'Resuelto') {
    return (
      <div className="rounded-lg border border-emerald-500/25 bg-emerald-950/20 px-3 py-2">
        <div className="flex items-center justify-between text-[11px] text-emerald-400">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <i className="fa-solid fa-circle-check" aria-hidden="true" />
            <span>SLA Cumplido</span>
          </span>
          <span className="font-mono tabular-nums">
            {formatearTiempoSla(ticket.slaTranscurridoSeg)} /{' '}
            {ticket.slaObjetivoMin}m
          </span>
        </div>
      </div>
    );
  }

  if (ticket.slaPausado) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 space-y-2 text-slate-300">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
            <i className="fa-solid fa-pause text-amber-400" aria-hidden="true" />
            <span>SLA PAUSADO (OLA N2)</span>
          </span>
          <span className="font-mono text-base font-bold tracking-tight tabular-nums text-slate-200">
            {formatearTiempoSla(Math.max(0, restanteSeg))}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-slate-500"
            style={{ width: `${pctRestante}%` }}
          />
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] tabular-nums text-slate-400">
          <span>Objetivo: {ticket.slaObjetivoMin} min</span>
          <span>En espera de reanudación</span>
        </div>
      </div>
    );
  }

  const vencido = ticket.slaIncumplido || restanteSeg <= 0;
  const enRiesgo = !vencido && pctConsumido >= 75;

  const containerStyle = vencido
    ? 'border-red-500/60 bg-red-950/40 text-red-300'
    : enRiesgo
      ? 'border-amber-500/40 bg-amber-950/25 text-amber-300'
      : 'border-slate-800 bg-[#0B0F17] text-slate-200';

  const barColor = vencido
    ? 'bg-red-500'
    : enRiesgo
      ? 'bg-amber-500'
      : 'bg-blue-500';

  return (
    <div className={`rounded-lg border px-3 py-2.5 space-y-2 ${containerStyle}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold">
          <i
            className={`fa-solid ${
              vencido
                ? 'fa-triangle-exclamation text-red-400 motion-safe:animate-pulse'
                : enRiesgo
                  ? 'fa-stopwatch text-amber-400'
                  : 'fa-regular fa-clock text-blue-400'
            }`}
            aria-hidden="true"
          />
          <span>
            {vencido
              ? 'SLA INCUMPLIDO'
              : enRiesgo
                ? 'SLA EN RIESGO'
                : 'CRONÓMETRO SLA'}
          </span>
        </span>
        <span className="font-mono text-base font-bold tracking-tight tabular-nums">
          {vencido
            ? `-${formatearTiempoSla(restanteSeg)}`
            : formatearTiempoSla(restanteSeg)}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/90">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${vencido ? 100 : pctRestante}%` }}
        />
      </div>

      <div className="flex items-center justify-between font-mono text-[10px] tabular-nums text-slate-400">
        <span>Objetivo: {ticket.slaObjetivoMin} min</span>
        <span>Consumido: {pctConsumido}%</span>
      </div>
    </div>
  );
};
