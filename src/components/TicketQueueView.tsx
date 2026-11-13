import React, { useMemo, useState } from 'react';
import {
  PoliticaEscaladoSla,
  Ticket,
  VelocidadSimulacion,
} from '../types/itsm';
import {
  CanalEntradaIndicador,
  CronometroSlaVisual,
  EstadoTicketIndicador,
  PrioridadIndicador,
} from './ItsmStatusHelpers';

type FiltroCola = 'todos' | 'N1' | 'N2' | 'incumplido' | 'resueltos';

interface TicketQueueViewProps {
  tickets: Ticket[];
  categoriaInicial: string;
  velocidadSimulacion: VelocidadSimulacion;
  politicaEscaladoSla: PoliticaEscaladoSla;
  onCambiarVelocidad: (velocidad: VelocidadSimulacion) => void;
  onCambiarPoliticaEscalado: (politica: PoliticaEscaladoSla) => void;
  onLimpiarCategoria: () => void;
  onSeleccionarTicket: (ticketId: string) => void;
  onAbrirTicketConKb: (ticketId: string) => void;
  onEscalarN2: (ticketId: string) => void;
  onReanudarSla: (ticketId: string) => void;
  onResolverRapido: (ticketId: string) => void;
  onAbrirNuevoTicket: () => void;
  onAbrirDeclararProblema: (ticketIds: string[]) => void;
}

export const TicketQueueView: React.FC<TicketQueueViewProps> = ({
  tickets,
  categoriaInicial,
  velocidadSimulacion,
  politicaEscaladoSla,
  onCambiarVelocidad,
  onCambiarPoliticaEscalado,
  onLimpiarCategoria,
  onSeleccionarTicket,
  onAbrirTicketConKb,
  onEscalarN2,
  onReanudarSla,
  onResolverRapido,
  onAbrirNuevoTicket,
  onAbrirDeclararProblema,
}) => {
  const [filtro, setFiltro] = useState<FiltroCola>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const ticketsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return tickets.filter((t) => {
      if (categoriaInicial && t.categoria !== categoriaInicial) {
        return false;
      }
      if (filtro === 'N1' && (t.nivel !== 'N1' || t.estado === 'Resuelto')) {
        return false;
      }
      if (filtro === 'N2' && (t.nivel !== 'N2' || t.estado === 'Resuelto')) {
        return false;
      }
      if (filtro === 'incumplido' && !t.slaIncumplido) {
        return false;
      }
      if (filtro === 'resueltos' && t.estado !== 'Resuelto') {
        return false;
      }
      if (q) {
        const match =
          t.id.toLowerCase().includes(q) ||
          t.titulo.toLowerCase().includes(q) ||
          t.ciAfectado.toLowerCase().includes(q) ||
          t.asignadoA.toLowerCase().includes(q) ||
          t.categoria.toLowerCase().includes(q) ||
          t.canalEntrada.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [tickets, filtro, busqueda, categoriaInicial]);

  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const tabs: { id: FiltroCola; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'N1', label: 'Nivel 1 (Abiertos)' },
    { id: 'N2', label: 'Nivel 2 (Abiertos)' },
    { id: 'incumplido', label: 'SLA Incumplido' },
    { id: 'resueltos', label: 'Resueltos' },
  ];

  const velocidades: { val: VelocidadSimulacion; label: string }[] = [
    { val: 0, label: 'Pausa' },
    { val: 1, label: '1x' },
    { val: 10, label: '10x' },
    { val: 60, label: '60x' },
  ];

  return (
    <div className="space-y-5">
      {/* Filter, Search, SLA Speed & Escalation Policy Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-[#111827] p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div
            className="flex flex-wrap items-center gap-1 rounded-lg bg-[#0B0F17] p-1"
            role="tablist"
            aria-label="Filtrar cola de tickets"
          >
            {tabs.map((tab) => {
              const activo = filtro === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activo}
                  onClick={() => setFiltro(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    activo
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* SLA Escalation Policy Selector */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0B0F17] px-2.5 py-1">
              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                Escalado N2:
              </span>
              <button
                type="button"
                onClick={() => onCambiarPoliticaEscalado('reiniciar')}
                className={`rounded px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap ${
                  politicaEscaladoSla === 'reiniciar'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Reiniciar SLA
              </button>
              <button
                type="button"
                onClick={() => onCambiarPoliticaEscalado('pausar')}
                className={`rounded px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap ${
                  politicaEscaladoSla === 'pausar'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Pausar SLA
              </button>
            </div>

            {/* SLA Clock Speed Control */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0B0F17] px-2.5 py-1">
              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                Motor SLA:
              </span>
              {velocidades.map((v) => (
                <button
                  key={v.val}
                  type="button"
                  onClick={() => onCambiarVelocidad(v.val)}
                  className={`rounded px-2 py-1 font-mono text-[11px] font-medium transition-colors whitespace-nowrap ${
                    velocidadSimulacion === v.val
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <i
                className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar ID, CI, síntoma..."
                aria-label="Buscar tickets"
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] py-2 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sub-bar: Count + Declarar Problema Bulk Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/70 pt-3 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Mostrando{' '}
              <strong className="font-mono tabular-nums text-slate-200">
                {ticketsFiltrados.length}
              </strong>{' '}
              ticket(s)
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span>
              Selecciona varios tickets con síntomas iguales para declarar un Problema maestro
            </span>
            {categoriaInicial && (
              <button
                type="button"
                onClick={onLimpiarCategoria}
                className="inline-flex items-center gap-2 rounded-md border border-blue-500/40 bg-blue-950/30 px-2.5 py-1 text-xs font-medium text-blue-300 hover:bg-blue-900/40 transition-colors whitespace-nowrap"
              >
                <span>Categoría: {categoriaInicial}</span>
                <i className="fa-solid fa-xmark text-[10px]" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {seleccionados.length > 0 && (
              <>
                <span className="font-mono text-xs text-amber-300">
                  {seleccionados.length} seleccionado(s)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onAbrirDeclararProblema(seleccionados);
                    setSeleccionados([]);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition-colors whitespace-nowrap"
                >
                  <i
                    className="fa-solid fa-triangle-exclamation text-[11px]"
                    aria-hidden="true"
                  />
                  <span>Declarar Problema ({seleccionados.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSeleccionados([])}
                  className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  Limpiar
                </button>
              </>
            )}

            {seleccionados.length === 0 && (
              <button
                type="button"
                onClick={() => onAbrirDeclararProblema([])}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/25 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-900/40 transition-colors whitespace-nowrap"
              >
                <i
                  className="fa-solid fa-triangle-exclamation text-[11px] text-amber-400"
                  aria-hidden="true"
                />
                <span>Declarar Problema</span>
              </button>
            )}

            <button
              type="button"
              onClick={onAbrirNuevoTicket}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
            >
              + Nuevo Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Cards Grid with Multi-select & Live Visual Countdown Timers */}
      {ticketsFiltrados.length === 0 ? (
        <div className="rounded-xl border border-slate-800/80 bg-[#111827] px-6 py-12 text-center">
          <i
            className="fa-regular fa-folder-open mb-2 text-2xl text-slate-500"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-slate-200">
            No hay tickets que coincidan con el filtro actual
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Prueba cambiando el criterio de búsqueda o crea un nuevo ticket.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ticketsFiltrados.map((ticket) => {
            const restanteSeg = ticket.slaObjetivoSeg - ticket.slaTranscurridoSeg;
            const slaRoto =
              ticket.estado !== 'Resuelto' &&
              !ticket.slaPausado &&
              (ticket.slaIncumplido || restanteSeg <= 0);
            const estaSeleccionado = seleccionados.includes(ticket.id);

            return (
              <article
                key={ticket.id}
                onClick={() => onSeleccionarTicket(ticket.id)}
                className={`group flex cursor-pointer flex-col justify-between rounded-xl border p-5 transition-colors ${
                  slaRoto
                    ? 'border-red-500/80 bg-red-950/20 hover:border-red-400 motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]'
                    : estaSeleccionado
                      ? 'border-blue-500 bg-blue-950/15'
                      : 'border-slate-800/80 bg-[#111827] hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Metadata Line with Selection Checkbox */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {ticket.estado !== 'Resuelto' && (
                        <input
                          type="checkbox"
                          checked={estaSeleccionado}
                          onChange={() => toggleSeleccion(ticket.id)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Seleccionar ticket ${ticket.id} para agrupar en Problema`}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                      <span className="font-mono font-semibold text-blue-400">
                        {ticket.id}
                      </span>
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-mono text-slate-300">
                        {ticket.nivel}
                      </span>
                      {ticket.problemaVinculadoId && (
                        <>
                          <span className="text-slate-600" aria-hidden="true">
                            ·
                          </span>
                          <span className="font-mono text-amber-300">
                            {ticket.problemaVinculadoId}
                          </span>
                        </>
                      )}
                    </div>
                    <PrioridadIndicador prioridad={ticket.prioridad} />
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-display text-sm font-semibold leading-snug text-slate-100 group-hover:text-blue-300 transition-colors">
                      {ticket.titulo}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
                      {ticket.descripcion}
                    </p>
                  </div>

                  {/* Secondary ITIL Metadata */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                    <CanalEntradaIndicador canal={ticket.canalEntrada} />
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-mono text-slate-300">
                      {ticket.ciAfectado}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className="truncate">{ticket.asignadoA}</span>
                  </div>

                  {/* Live Countdown Timer */}
                  <CronometroSlaVisual ticket={ticket} />
                </div>

                {/* Card Footer Actions */}
                <div
                  className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/70 pt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <EstadoTicketIndicador estado={ticket.estado} />
                    {ticket.fcrCumplido && (
                      <span className="font-mono text-[11px] font-semibold text-emerald-400">
                        · FCR cumplido
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {ticket.estado !== 'Resuelto' && (
                      <button
                        type="button"
                        onClick={() => onAbrirTicketConKb(ticket.id)}
                        className="rounded-md border border-blue-500/40 bg-blue-950/30 px-2.5 py-1.5 text-[11px] font-medium text-blue-300 hover:bg-blue-900/40 transition-colors whitespace-nowrap"
                      >
                        Resolver usando KB
                      </button>
                    )}
                    {ticket.nivel === 'N1' && ticket.estado !== 'Resuelto' && (
                      <button
                        type="button"
                        onClick={() => onEscalarN2(ticket.id)}
                        className="rounded-md border border-amber-500/40 bg-amber-950/30 px-2.5 py-1.5 text-[11px] font-medium text-amber-200 hover:bg-amber-900/40 transition-colors whitespace-nowrap"
                      >
                        Escalar a N2
                      </button>
                    )}
                    {ticket.slaPausado && ticket.estado !== 'Resuelto' && (
                      <button
                        type="button"
                        onClick={() => onReanudarSla(ticket.id)}
                        className="rounded-md border border-blue-500/40 bg-blue-950/30 px-2.5 py-1.5 text-[11px] font-medium text-blue-300 hover:bg-blue-900/40 transition-colors whitespace-nowrap"
                      >
                        Reanudar SLA
                      </button>
                    )}
                    {ticket.estado !== 'Resuelto' && (
                      <button
                        type="button"
                        onClick={() => onResolverRapido(ticket.id)}
                        className="rounded-md border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1.5 text-[11px] font-medium text-emerald-300 hover:bg-emerald-900/40 transition-colors whitespace-nowrap"
                      >
                        Resolver
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onSeleccionarTicket(ticket.id)}
                      className="rounded-md border border-slate-700 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
                    >
                      Detalle
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
