import React, { useEffect } from 'react';
import { normalizarIshikawa } from '../data/serviceDeskStore';
import { Metricas, Problema, Ticket } from '../types/itsm';
import { formatearTiempoSla } from './ItsmStatusHelpers';

export type ContextoReporte =
  | { tipo: 'general' }
  | { tipo: 'ticket'; ticketId: string }
  | { tipo: 'problema'; problemaId: string };

interface PrintableReportModalProps {
  contexto: ContextoReporte | null;
  tickets: Ticket[];
  problemas: Problema[];
  metricas: Metricas;
  onCerrar: () => void;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  contexto,
  tickets,
  problemas,
  metricas,
  onCerrar,
}) => {
  useEffect(() => {
    if (!contexto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [contexto, onCerrar]);

  if (!contexto) return null;

  const ticketUnico =
    contexto.tipo === 'ticket'
      ? tickets.find((t) => t.id === contexto.ticketId) ?? null
      : null;

  const problemaUnico =
    contexto.tipo === 'problema'
      ? problemas.find((p) => p.id === contexto.problemaId) ?? null
      : ticketUnico?.problemaVinculadoId
        ? problemas.find((p) => p.id === ticketUnico.problemaVinculadoId) ?? null
        : null;

  const ticketsListado =
    contexto.tipo === 'ticket' && ticketUnico
      ? [ticketUnico]
      : contexto.tipo === 'problema' && problemaUnico
        ? tickets.filter((t) => t.problemaVinculadoId === problemaUnico.id)
        : tickets;

  const problemasListado =
    contexto.tipo === 'problema' && problemaUnico
      ? [problemaUnico]
      : ticketUnico && problemaUnico
        ? [problemaUnico]
        : contexto.tipo === 'general'
          ? problemas
          : [];

  const fechaGeneracion = new Date().toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const tituloInforme =
    contexto.tipo === 'ticket' && ticketUnico
      ? `Informe Post-Incidente · ${ticketUnico.id}`
      : contexto.tipo === 'problema' && problemaUnico
        ? `Informe de Problema y RCA · ${problemaUnico.id}`
        : 'Informe Operativo ITIL v4 — ServiceDeskLab';

  return (
    <div
      className="print-folio-container fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Vista previa de informe formato A4"
    >
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#111827] px-5 py-3">
        <div className="text-xs text-slate-300">
          <span className="font-semibold text-slate-100">
            Vista previa formato folio (A4)
          </span>
          <span className="mx-2 text-slate-600" aria-hidden="true">
            ·
          </span>
          <span>Listo para exportar a PDF o imprimir</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            <i className="fa-solid fa-print text-[11px]" aria-hidden="true" />
            <span>Imprimir / Guardar PDF</span>
          </button>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* A4 Folio Sheet */}
      <div className="print-folio-sheet mx-auto min-h-[297mm] w-full max-w-[210mm] rounded-sm bg-white p-8 text-slate-900 shadow-2xl sm:p-12">
        {/* Folio Header */}
        <header className="flex items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
          <div className="flex items-center gap-3.5">
            <img
              src="./assets/aistudio/icono_81a3db5b.png"
              alt="Logo ServiceDeskLab"
              className="h-12 w-12 object-contain"
            />
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                ServiceDeskLab · Gestión de Servicios ITIL v4
              </p>
              <h1 className="font-display text-xl font-bold text-slate-900">
                {tituloInforme}
              </h1>
            </div>
          </div>

          <div className="text-right font-mono text-[11px] text-slate-600">
            <p>Fecha: {fechaGeneracion}</p>
            <p>Nivel: Soporte N2 / Problem Mgmt</p>
          </div>
        </header>

        {/* Section 1: Summary */}
        <section className="mt-6 space-y-3">
          <h2 className="border-b border-slate-300 pb-1 font-display text-sm font-bold uppercase tracking-wide text-slate-800">
            1. Resumen Operativo
          </h2>

          {ticketUnico ? (
            <div className="grid grid-cols-2 gap-3 rounded border border-slate-200 bg-slate-50 p-4 text-xs sm:grid-cols-3">
              <div>
                <span className="block text-slate-500">ID / Canal</span>
                <strong className="font-mono text-slate-900">
                  {ticketUnico.id} · {ticketUnico.canalEntrada}
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Prioridad ITIL</span>
                <strong className="font-mono text-slate-900">
                  {ticketUnico.prioridad}
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Estado Actual</span>
                <strong className="text-slate-900">{ticketUnico.estado}</strong>
              </div>
              <div>
                <span className="block text-slate-500">CI Afectado</span>
                <strong className="font-mono text-slate-900">
                  {ticketUnico.ciAfectado}
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Categoría</span>
                <strong className="text-slate-900">{ticketUnico.categoria}</strong>
              </div>
              <div>
                <span className="block text-slate-500">Equipo Asignado</span>
                <strong className="text-slate-900">{ticketUnico.asignadoA}</strong>
              </div>
              <div className="col-span-2 sm:col-span-3 pt-1">
                <span className="block text-slate-500">Título y Descripción</span>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {ticketUnico.titulo}
                </p>
                <p className="mt-1 text-slate-700">{ticketUnico.descripcion}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 rounded border border-slate-200 bg-slate-50 p-4 text-xs">
              <div>
                <span className="block text-slate-500">Tickets Totales</span>
                <strong className="font-mono text-base text-slate-900">
                  {metricas.ticketsTotales}
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Abiertos (N1/N2)</span>
                <strong className="font-mono text-base text-slate-900">
                  {metricas.ticketsAbiertos} ({metricas.ticketsN1Abiertos}/
                  {metricas.ticketsN2Abiertos})
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Cumplimiento SLA</span>
                <strong className="font-mono text-base text-slate-900">
                  {metricas.tasaCumplimientoSla}%
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Problemas / KEDB</span>
                <strong className="font-mono text-base text-slate-900">
                  {metricas.problemasActivos} / {metricas.erroresConocidos}
                </strong>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: SLA Compliance Matrix */}
        <section className="mt-6 space-y-2.5">
          <h2 className="border-b border-slate-300 pb-1 font-display text-sm font-bold uppercase tracking-wide text-slate-800">
            2. Matriz de Acuerdos de Nivel de Servicio (SLA Cumplidos / Incumplidos)
          </h2>

          {ticketsListado.length === 0 ? (
            <p className="text-xs text-slate-600">
              No hay incidentes asociados en este alcance.
            </p>
          ) : (
            <table className="w-full border-collapse border border-slate-300 text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-semibold text-slate-700">
                  <th className="border border-slate-300 px-2.5 py-2">ID</th>
                  <th className="border border-slate-300 px-2.5 py-2">Incidente</th>
                  <th className="border border-slate-300 px-2.5 py-2">Prioridad</th>
                  <th className="border border-slate-300 px-2.5 py-2">Objetivo</th>
                  <th className="border border-slate-300 px-2.5 py-2">Consumido</th>
                  <th className="border border-slate-300 px-2.5 py-2">Estado SLA</th>
                </tr>
              </thead>
              <tbody>
                {ticketsListado.map((t) => {
                  const estadoSla = t.slaIncumplido
                    ? 'INCUMPLIDO'
                    : t.slaPausado
                      ? 'PAUSADO'
                      : t.estado === 'Resuelto'
                        ? 'CUMPLIDO'
                        : 'EN TIEMPO';
                  return (
                    <tr key={t.id}>
                      <td className="border border-slate-300 px-2.5 py-1.5 font-mono font-semibold">
                        {t.id}
                      </td>
                      <td className="border border-slate-300 px-2.5 py-1.5">
                        {t.titulo}
                      </td>
                      <td className="border border-slate-300 px-2.5 py-1.5 font-mono">
                        {t.prioridad}
                      </td>
                      <td className="border border-slate-300 px-2.5 py-1.5 font-mono">
                        {t.slaObjetivoMin} min
                      </td>
                      <td className="border border-slate-300 px-2.5 py-1.5 font-mono">
                        {formatearTiempoSla(t.slaTranscurridoSeg)}
                      </td>
                      <td
                        className={`border border-slate-300 px-2.5 py-1.5 font-mono font-semibold ${
                          t.slaIncumplido
                            ? 'text-red-700'
                            : t.estado === 'Resuelto'
                              ? 'text-emerald-700'
                              : 'text-slate-800'
                        }`}
                      >
                        {estadoSla}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* Section 3: RCA Analysis */}
        <section className="mt-6 space-y-3">
          <h2 className="border-b border-slate-300 pb-1 font-display text-sm font-bold uppercase tracking-wide text-slate-800">
            3. Análisis de Causa Raíz (RCA — 5 Porqués e Ishikawa 4M)
          </h2>

          {problemasListado.length === 0 ? (
            <p className="text-xs text-slate-600">
              Este incidente no tiene un Problema maestro con análisis RCA vinculado.
            </p>
          ) : (
            <div className="space-y-4">
              {problemasListado.map((p) => {
                const ish = normalizarIshikawa(p.ishikawa);
                const porques = p.analisis5Porques.filter((x) => x.trim());
                return (
                  <div
                    key={p.id}
                    className="rounded border border-slate-300 p-3.5 text-xs space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <span className="font-mono font-bold text-slate-900">
                        {p.id} · {p.titulo}
                      </span>
                      <span className="font-mono text-[11px] text-slate-600">
                        {p.estado} · {p.ciAfectado}
                      </span>
                    </div>

                    <div>
                      <strong className="text-slate-700">Causa Raíz:</strong>{' '}
                      <span className="text-slate-900">
                        {p.causaRaiz || 'Pendiente de documentación.'}
                      </span>
                    </div>

                    {porques.length > 0 && (
                      <div>
                        <strong className="block text-slate-700">
                          Cadena de Los 5 Porqués:
                        </strong>
                        <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-slate-800">
                          {porques.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div>
                        <strong>Máquina:</strong>{' '}
                        {ish.maquina.join('; ') || '—'}
                      </div>
                      <div>
                        <strong>Método:</strong> {ish.metodo.join('; ') || '—'}
                      </div>
                      <div>
                        <strong>Material:</strong>{' '}
                        {ish.material.join('; ') || '—'}
                      </div>
                      <div>
                        <strong>Mano de obra:</strong>{' '}
                        {ish.manoDeObra.join('; ') || '—'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 4: Applied Solution & Closure Report */}
        <section className="mt-6 space-y-2.5">
          <h2 className="border-b border-slate-300 pb-1 font-display text-sm font-bold uppercase tracking-wide text-slate-800">
            4. Solución Aplicada e Informe de Cierre
          </h2>

          {ticketUnico?.informeCierre ? (
            <div className="rounded border border-slate-300 bg-slate-50 p-3.5 text-xs space-y-2">
              <p>
                <strong>Workaround (Solución Temporal):</strong>{' '}
                {ticketUnico.informeCierre.workaround}
              </p>
              <p>
                <strong>Solución Definitiva:</strong>{' '}
                {ticketUnico.informeCierre.solucionDefinitiva}
              </p>
              {ticketUnico.informeCierre.causaRaizDocumentada && (
                <p>
                  <strong>Causa Raíz Documentada en Cierre:</strong>{' '}
                  {ticketUnico.informeCierre.causaRaizDocumentada}
                </p>
              )}
            </div>
          ) : problemaUnico ? (
            <div className="rounded border border-slate-300 bg-slate-50 p-3.5 text-xs space-y-2">
              <p>
                <strong>Workaround (Solución Temporal KEDB):</strong>{' '}
                {problemaUnico.workaround || 'No registrado.'}
              </p>
              <p>
                <strong>Solución Definitiva:</strong>{' '}
                {problemaUnico.solucionDefinitiva ||
                  problemaUnico.informeCierre?.solucionDefinitiva ||
                  'En curso / Pendiente de cierre definitivo.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {tickets
                .filter((t) => t.informeCierre)
                .map((t) => (
                  <div
                    key={t.id}
                    className="rounded border border-slate-300 bg-slate-50 p-3"
                  >
                    <p className="font-mono font-semibold text-slate-900">
                      {t.id} — {t.titulo}
                    </p>
                    <p className="mt-1">
                      <strong>Workaround:</strong> {t.informeCierre?.workaround}
                    </p>
                    <p>
                      <strong>Solución Definitiva:</strong>{' '}
                      {t.informeCierre?.solucionDefinitiva}
                    </p>
                  </div>
                ))}
              {tickets.every((t) => !t.informeCierre) &&
                problemas.every((p) => !p.solucionDefinitiva && !p.workaround) && (
                  <p className="text-slate-600">
                    No se han registrado informes de cierre definitivos todavía.
                  </p>
                )}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-10 flex items-center justify-between border-t border-slate-300 pt-3 text-[10px] text-slate-500">
          <span>ServiceDeskLab · Simulador Educativo ITIL v4 Nivel 2</span>
          <span>https://www.unfantasmaenelsistema.com/</span>
        </footer>
      </div>
    </div>
  );
};
