import React, { useEffect, useMemo, useState } from 'react';
import {
  CMDB_CIS_SUGERIDOS,
  buscarArticulosKbRelevantes,
  esArticuloKbCorrectoParaTicket,
} from '../data/serviceDeskStore';
import {
  ArticuloKb,
  NotaTecnica,
  PoliticaEscaladoSla,
  Problema,
  RolSimulador,
  Ticket,
  TicketEstado,
} from '../types/itsm';
import { HistoryTimeline } from './HistoryTimeline';
import {
  CronometroSlaVisual,
  EstadoTicketIndicador,
  PrioridadIndicador,
} from './ItsmStatusHelpers';

interface TicketDrawerProps {
  ticket: Ticket | null;
  problemas: Problema[];
  articulosKb: ArticuloKb[];
  rolActivo?: RolSimulador;
  abrirSelectorKbInicial?: boolean;
  politicaEscaladoSla: PoliticaEscaladoSla;
  onCerrar: () => void;
  onEscalarN2: (ticketId: string) => void;
  onReanudarSla: (ticketId: string) => void;
  onAbrirDeclararProblema: (ticketIds: string[]) => void;
  onResolverTicket: (ticketId: string) => void;
  onResolverConKb: (ticketId: string, articuloId: string) => void;
  onExportarInforme: (ticketId: string) => void;
  onActualizarTicket: (
    ticketId: string,
    cambios: Partial<Ticket>,
    notaAutomatica?: Omit<NotaTecnica, 'id' | 'fecha'>
  ) => void;
  onAgregarNota: (
    ticketId: string,
    nota: Omit<NotaTecnica, 'id' | 'fecha'>
  ) => void;
}

const ESTADOS_DISPONIBLES: TicketEstado[] = [
  'Nuevo',
  'En Progreso (N1)',
  'Escalado (N2)',
  'En Espera',
  'Resuelto',
];

export const TicketDrawer: React.FC<TicketDrawerProps> = ({
  ticket,
  problemas,
  articulosKb,
  rolActivo = 'sdm',
  abrirSelectorKbInicial = false,
  politicaEscaladoSla,
  onCerrar,
  onEscalarN2,
  onReanudarSla,
  onAbrirDeclararProblema,
  onResolverTicket,
  onResolverConKb,
  onExportarInforme,
  onActualizarTicket,
  onAgregarNota,
}) => {
  const [textoNota, setTextoNota] = useState('');
  const [tipoNota, setTipoNota] =
    useState<NotaTecnica['tipo']>('Diagnóstico N2');
  const [mostrarSelectorKb, setMostrarSelectorKb] = useState(
    abrirSelectorKbInicial
  );
  const [articuloKbSeleccionadoId, setArticuloKbSeleccionadoId] = useState('');
  const [ciDraft, setCiDraft] = useState(ticket?.ciAfectado ?? '');

  useEffect(() => {
    setMostrarSelectorKb(abrirSelectorKbInicial);
    setArticuloKbSeleccionadoId('');
    setCiDraft(ticket?.ciAfectado ?? '');
  }, [ticket?.id, ticket?.ciAfectado, abrirSelectorKbInicial]);

  useEffect(() => {
    if (!ticket) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ticket, onCerrar]);

  const articulosOrdenados = useMemo(() => {
    if (!ticket) return [];
    const consulta = `${ticket.titulo} ${ticket.descripcion} ${ticket.ciAfectado}`;
    const sugeridos = buscarArticulosKbRelevantes(
      consulta,
      articulosKb,
      ticket.categoria
    );
    const idsSugeridos = new Set(sugeridos.map((s) => s.articulo.id));
    const restantes = articulosKb
      .filter((a) => !idsSugeridos.has(a.id))
      .map((articulo) => ({ articulo, coincidencias: [] as string[], score: 0 }));
    return [...sugeridos, ...restantes];
  }, [ticket, articulosKb]);

  if (!ticket) return null;

  const problemaVinculado = problemas.find(
    (p) => p.id === ticket.problemaVinculadoId
  );
  const articuloKbAplicado = ticket.kbAplicadoId
    ? articulosKb.find((a) => a.id === ticket.kbAplicadoId)
    : undefined;
  const elegibleFcr =
    ticket.nivel === 'N1' &&
    ticket.estado !== 'Resuelto' &&
    ticket.slaTranscurridoSeg < 180;
  const articuloSeleccionado =
    articulosKb.find((a) => a.id === articuloKbSeleccionadoId) ??
    articulosOrdenados[0]?.articulo ??
    null;

  const handleSubmitNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textoNota.trim()) return;
    onAgregarNota(ticket.id, {
      autor: ticket.asignadoA || 'Analista N2',
      tipo: tipoNota,
      texto: textoNota.trim(),
    });
    setTextoNota('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-ticket-id"
      onClick={onCerrar}
    >
      <div
        className="flex h-full w-full max-w-5xl flex-col border-l border-slate-800 bg-[#0D131F] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-4">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                id="drawer-ticket-id"
                className="font-mono font-semibold text-blue-400"
              >
                {ticket.id}
              </span>
              <span className="text-slate-600" aria-hidden="true">
                ·
              </span>
              <PrioridadIndicador prioridad={ticket.prioridad} />
              <span className="text-slate-600" aria-hidden="true">
                ·
              </span>
              <EstadoTicketIndicador estado={ticket.estado} />
            </div>
            <h2 className="font-display text-base font-semibold text-slate-100">
              {ticket.titulo}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onExportarInforme(ticket.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#111827] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <i className="fa-solid fa-print text-[11px] text-blue-400" aria-hidden="true" />
              <span className="hidden sm:inline">Exportar Informe (PDF/Imprimir)</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              type="button"
              onClick={onCerrar}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Cerrar detalle de incidente"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 2-Column Body: Left Workspace + Right Lateral Immutable Timeline */}
        <div className="grid flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-12 lg:overflow-hidden">
          <div
            className={`space-y-6 p-6 lg:overflow-y-auto ${
              rolActivo === 'sdm' || rolActivo === 'n2'
                ? 'lg:col-span-7'
                : 'lg:col-span-12'
            }`}
          >
          {/* Live SLA Timer */}
          <CronometroSlaVisual ticket={ticket} />

          {/* Metadata Grid with CMDB CI Association */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-[#111827] p-4 text-xs sm:grid-cols-3">
            <div>
              <span className="block text-slate-400">Nivel / Equipo Asignado</span>
              <span className="mt-1 block font-mono font-medium text-slate-100">
                {ticket.nivel} · {ticket.asignadoA}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-2">
              <label
                htmlFor="drawer-ci-cmdb"
                className="block text-slate-400"
              >
                CI Afectado (CMDB)
              </label>
              <span
                className={
                  rolActivo === 'usuario'
                    ? 'mt-1 block font-mono font-medium text-slate-100'
                    : 'hidden'
                }
              >
                {ticket.ciAfectado}
              </span>
              <div
                className={
                  rolActivo === 'usuario'
                    ? 'hidden'
                    : 'mt-1 flex flex-wrap items-center gap-1.5'
                }
              >
                <input
                  id="drawer-ci-cmdb"
                  type="text"
                  list="cmdb-cis-ticket-list"
                  value={ciDraft}
                  onChange={(e) => setCiDraft(e.target.value)}
                  className="min-w-0 flex-1 rounded-md border border-slate-700 bg-[#0B0F17] px-2.5 py-1 font-mono text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                />
                <datalist id="cmdb-cis-ticket-list">
                  {CMDB_CIS_SUGERIDOS.map((ci) => (
                    <option key={ci} value={ci} />
                  ))}
                </datalist>
                {ciDraft.trim() &&
                  ciDraft.trim() !== ticket.ciAfectado && (
                    <button
                      type="button"
                      onClick={() => {
                        const limpio = ciDraft.trim().toUpperCase();
                        setCiDraft(limpio);
                        onActualizarTicket(ticket.id, { ciAfectado: limpio });
                      }}
                      className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-500 transition-colors whitespace-nowrap"
                    >
                      Asociar CI
                    </button>
                  )}
              </div>
            </div>
            <div>
              <span className="block text-slate-400">Categoría</span>
              <span className="mt-1 block font-medium text-slate-100">
                {ticket.categoria}
              </span>
            </div>
            <div>
              <span className="block text-slate-400">Impacto / Urgencia</span>
              <span className="mt-1 block font-medium text-slate-100">
                {ticket.impacto} / {ticket.urgencia}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-slate-400">Canal / Solicitante</span>
              <span className="mt-1 block font-medium text-slate-100 truncate">
                {ticket.canalEntrada} · {ticket.solicitante}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-slate-300">
              Descripción del Incidente
            </h3>
            <p className="rounded-lg border border-slate-800/80 bg-[#111827] p-3.5 text-sm leading-relaxed text-slate-300">
              {ticket.descripcion}
            </p>
          </div>

          {/* FCR / KB Resolution Summary */}
          {ticket.fcrCumplido && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/25 p-4 space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2 font-semibold text-emerald-300">
                <span>
                  <i
                    className="fa-solid fa-bolt-lightning mr-1.5"
                    aria-hidden="true"
                  />
                  FCR Cumplido (First Contact Resolution &lt; 3 min)
                </span>
                {ticket.kbAplicadoId && (
                  <span className="font-mono text-[11px] text-emerald-200">
                    {ticket.kbAplicadoId}
                  </span>
                )}
              </div>
              <p className="text-slate-200">
                Resuelto en Nivel 1 aplicando documentación KEDB en{' '}
                <strong className="font-mono">
                  {Math.floor(ticket.slaTranscurridoSeg / 60)}m{' '}
                  {String(ticket.slaTranscurridoSeg % 60).padStart(2, '0')}s
                </strong>
                {articuloKbAplicado ? `: "${articuloKbAplicado.titulo}"` : '.'}
              </p>
            </div>
          )}

          {/* Saved Closure Report (if resolved with report) */}
          {ticket.informeCierre && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-emerald-300 font-semibold">
                <span>
                  <i className="fa-solid fa-file-circle-check mr-1.5" aria-hidden="true" />
                  Informe de Cierre Registrado
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {new Date(ticket.informeCierre.fechaCierre).toLocaleString(
                    'es-ES',
                    { dateStyle: 'short', timeStyle: 'short' }
                  )}
                </span>
              </div>
              <p className="text-slate-200">
                <strong className="text-slate-400">Workaround:</strong>{' '}
                {ticket.informeCierre.workaround}
              </p>
              <p className="text-slate-200">
                <strong className="text-slate-400">Solución Definitiva:</strong>{' '}
                {ticket.informeCierre.solucionDefinitiva}
              </p>
              {ticket.informeCierre.causaRaizDocumentada && (
                <p className="text-slate-200">
                  <strong className="text-slate-400">Causa Raíz:</strong>{' '}
                  {ticket.informeCierre.causaRaizDocumentada}
                </p>
              )}
            </div>
          )}

          {/* Workflow & Escalation Actions (hidden for End User Portal) */}
          <div
            className={
              rolActivo === 'usuario'
                ? 'hidden'
                : 'space-y-4 rounded-xl border border-slate-800 bg-[#111827] p-4'
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="drawer-estado"
                  className="mb-1.5 block text-xs font-medium text-slate-300"
                >
                  Estado del ciclo de vida
                </label>
                <select
                  id="drawer-estado"
                  value={ticket.estado}
                  onChange={(e) => {
                    const nuevoEstado = e.target.value as TicketEstado;
                    if (
                      nuevoEstado === 'Resuelto' &&
                      ticket.estado !== 'Resuelto'
                    ) {
                      onResolverTicket(ticket.id);
                      return;
                    }
                    onActualizarTicket(
                      ticket.id,
                      {
                        estado: nuevoEstado,
                        nivel:
                          nuevoEstado === 'Escalado (N2)' ? 'N2' : ticket.nivel,
                      },
                      {
                        autor: 'Sistema ITIL',
                        tipo: 'Sistema',
                        texto: `Estado actualizado a "${nuevoEstado}".`,
                      }
                    );
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                >
                  {ESTADOS_DISPONIBLES.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="drawer-problema"
                  className="mb-1.5 block text-xs font-medium text-slate-300"
                >
                  Problema Maestro / KEDB Vinculado
                </label>
                <select
                  id="drawer-problema"
                  value={ticket.problemaVinculadoId ?? ''}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    onActualizarTicket(
                      ticket.id,
                      { problemaVinculadoId: val },
                      {
                        autor: 'Sistema ITIL',
                        tipo: 'Sistema',
                        texto: val
                          ? `Incidente vinculado al registro de problema ${val}.`
                          : 'Desvinculado de registro de problema.',
                      }
                    );
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Sin problema vinculado</option>
                  {problemas.map((prb) => (
                    <option key={prb.id} value={prb.id}>
                      {prb.id} — {prb.titulo.slice(0, 48)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons: Escalar a N2, Reanudar SLA, Declarar Problema, Resolver */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/70 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                {ticket.nivel === 'N1' && ticket.estado !== 'Resuelto' && (
                  <button
                    type="button"
                    onClick={() => onEscalarN2(ticket.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
                  >
                    <i
                      className="fa-solid fa-arrow-up-right-from-square text-[11px]"
                      aria-hidden="true"
                    />
                    <span>Escalar a N2</span>
                  </button>
                )}

                {ticket.slaPausado && ticket.estado !== 'Resuelto' && (
                  <button
                    type="button"
                    onClick={() => onReanudarSla(ticket.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                  >
                    <i className="fa-solid fa-play text-[10px]" aria-hidden="true" />
                    <span>Reanudar SLA</span>
                  </button>
                )}

                {ticket.estado !== 'Resuelto' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onCerrar();
                        onAbrirDeclararProblema([ticket.id]);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3.5 py-2 text-xs font-medium text-amber-200 hover:bg-amber-900/40 transition-colors"
                    >
                      <i
                        className="fa-solid fa-triangle-exclamation text-[11px] text-amber-400"
                        aria-hidden="true"
                      />
                      <span>Declarar Problema</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMostrarSelectorKb((v) => !v)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-950/30 px-3.5 py-2 text-xs font-semibold text-blue-200 hover:bg-blue-900/40 transition-colors"
                    >
                      <i
                        className="fa-solid fa-book-open text-[11px] text-blue-400"
                        aria-hidden="true"
                      />
                      <span>Resolver usando KB</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onResolverTicket(ticket.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                    >
                      <i
                        className="fa-solid fa-check text-[11px]"
                        aria-hidden="true"
                      />
                      <span>Resolver Incidente</span>
                    </button>
                  </>
                )}
              </div>

              {ticket.nivel === 'N1' && ticket.estado !== 'Resuelto' && (
                <span className="text-[11px] text-slate-400">
                  Política al escalar:{' '}
                  <strong className="text-slate-200">
                    {politicaEscaladoSla === 'reiniciar'
                      ? 'Reiniciar SLA (OLA N2)'
                      : 'Pausar SLA hasta triaje N2'}
                  </strong>
                </span>
              )}
            </div>

            {/* Inline Knowledge Base (KEDB) Resolution Panel */}
            {mostrarSelectorKb && ticket.estado !== 'Resuelto' && (
              <div className="rounded-xl border border-blue-500/35 bg-[#0B0F17] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-blue-300">
                      <i
                        className="fa-solid fa-book-medical mr-1.5"
                        aria-hidden="true"
                      />
                      Aplicar Artículo de la Base de Conocimiento (KEDB)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {elegibleFcr
                        ? `Ventana FCR activa (${Math.max(
                            0,
                            180 - ticket.slaTranscurridoSeg
                          )}s restantes en N1 para cumplir < 3 min).`
                        : ticket.nivel !== 'N1'
                          ? 'El ticket está en N2: resolverá con KB pero no contará como FCR de Nivel 1.'
                          : 'Superados los 3 minutos simulados: resolverá con KB pero sin métrica FCR.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMostrarSelectorKb(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Ocultar
                  </button>
                </div>

                {articulosOrdenados.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No hay artículos disponibles en la Base de Conocimiento.
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {articulosOrdenados.map(
                        ({ articulo, coincidencias }) => {
                          const activo =
                            (articuloSeleccionado?.id ?? '') === articulo.id;
                          const esCorrecto = esArticuloKbCorrectoParaTicket(
                            ticket,
                            articulo
                          );
                          return (
                            <button
                              key={articulo.id}
                              type="button"
                              onClick={() =>
                                setArticuloKbSeleccionadoId(articulo.id)
                              }
                              className={`w-full rounded-lg border p-3 text-left text-xs transition-colors ${
                                activo
                                  ? 'border-blue-500 bg-blue-950/30'
                                  : 'border-slate-800 bg-[#111827] hover:border-slate-700'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-mono font-semibold text-blue-400">
                                  {articulo.id} · {articulo.categoria}
                                </span>
                                {esCorrecto ? (
                                  <span className="font-mono text-[11px] text-emerald-400">
                                    ✓ Coincide (FCR válido)
                                  </span>
                                ) : (
                                  <span className="font-mono text-[11px] text-slate-500">
                                    Sin coincidencia directa
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 font-semibold text-slate-100">
                                {articulo.titulo}
                              </p>
                              {coincidencias.length > 0 && (
                                <p className="mt-1 font-mono text-[10px] text-slate-400">
                                  Keywords: {coincidencias.join(', ')}
                                </p>
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>

                    {articuloSeleccionado && (
                      <div className="rounded-lg border border-slate-800 bg-[#111827] p-3 space-y-2 text-xs">
                        <p className="font-medium text-slate-300">
                          Procedimiento a ejecutar ({articuloSeleccionado.id}):
                        </p>
                        <p className="leading-relaxed text-slate-300">
                          {articuloSeleccionado.procedimiento}
                        </p>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onResolverConKb(ticket.id, articuloSeleccionado.id);
                              setMostrarSelectorKb(false);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                          >
                            <i
                              className="fa-solid fa-check text-[11px]"
                              aria-hidden="true"
                            />
                            <span>Confirmar Resolución usando KB</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* KEDB Workaround Helper if linked */}
          {problemaVinculado && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-blue-300">
                  <i className="fa-solid fa-book-open mr-1.5" aria-hidden="true" />
                  KEDB · {problemaVinculado.id}
                </span>
                <span className="text-slate-400">{problemaVinculado.estado}</span>
              </div>
              <p className="text-xs font-medium text-slate-200">
                Solución Temporal (Workaround) documentada:
              </p>
              <p className="text-xs leading-relaxed text-slate-300">
                {problemaVinculado.workaround ||
                  'Aún no se ha documentado un workaround en este problema.'}
              </p>
            </div>
          )}

          {/* Technical Notes Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-300">
              Bitácora Técnica N1 / N2 ({ticket.notasTecnicas.length})
            </h3>

            <form
              onSubmit={handleSubmitNota}
              className={rolActivo === 'usuario' ? 'hidden' : 'space-y-2.5'}
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={tipoNota}
                  onChange={(e) =>
                    setTipoNota(e.target.value as NotaTecnica['tipo'])
                  }
                  aria-label="Tipo de nota técnica"
                  className="rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Diagnóstico N2">Diagnóstico N2</option>
                  <option value="Solución Temporal">Solución Temporal</option>
                  <option value="Escalado">Escalado</option>
                </select>
                <input
                  type="text"
                  value={textoNota}
                  onChange={(e) => setTextoNota(e.target.value)}
                  placeholder="Añadir hallazgo técnico, comando ejecutado o workaround..."
                  className="flex-1 rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors whitespace-nowrap"
                >
                  Registrar
                </button>
              </div>
            </form>

            {ticket.notasTecnicas.length === 0 ? (
              <p className="text-xs text-slate-500">
                No hay notas registradas todavía en este incidente.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {ticket.notasTecnicas.map((nota) => (
                  <li
                    key={nota.id}
                    className="rounded-lg border border-slate-800 bg-[#111827] p-3 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-medium text-slate-200">
                        {nota.autor} · {nota.tipo}
                      </span>
                      <span className="font-mono">
                        {new Date(nota.fecha).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="mt-1.5 leading-relaxed text-slate-300">
                      {nota.texto}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          </div>

          {/* Right Lateral Column: Immutable Event Timeline (N2 & SDM Audit) */}
          <aside
            aria-label="Timeline lateral de auditoría del ticket"
            className={
              rolActivo === 'sdm' || rolActivo === 'n2'
                ? 'border-t border-slate-800 bg-[#0B0F17]/70 p-5 lg:col-span-5 lg:overflow-y-auto lg:border-l lg:border-t-0'
                : 'hidden'
            }
          >
            <HistoryTimeline
              historyLog={ticket.historyLog}
              titulo="Timeline de Auditoría"
              subtitulo="Registro cronológico inmutable (solo lectura)"
            />
          </aside>
        </div>
      </div>
    </div>
  );
};
