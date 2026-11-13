import React, { useState } from 'react';
import {
  CMDB_CIS_SUGERIDOS,
  evaluarEstadoRca,
  evaluarRfcParaProblema,
} from '../data/serviceDeskStore';
import {
  IshikawaDiagrama,
  Problema,
  ProblemaEstado,
  SolicitudCambioRfc,
  Ticket,
  TicketPrioridad,
} from '../types/itsm';
import { HistoryTimeline } from './HistoryTimeline';
import {
  EstadoProblemaIndicador,
  EstadoTicketIndicador,
  PrioridadIndicador,
  SlaBarraProgreso,
} from './ItsmStatusHelpers';
import { RcaToolsPanel } from './RcaToolsPanel';

interface ProblemManagementViewProps {
  problemas: Problema[];
  tickets: Ticket[];
  rfcs: SolicitudCambioRfc[];
  onCrearProblema: (nuevo: {
    titulo: string;
    descripcion: string;
    categoria: string;
    ciAfectado: string;
    prioridad: TicketPrioridad;
    workaround: string;
  }) => void;
  onMitigarOCerrarProblema: (payload: {
    problemaId: string;
    nuevoEstado: 'Error Conocido (KEDB)' | 'Resuelto';
    workaround: string;
    solucionDefinitiva: string;
    cerrarHijasMasivamente: boolean;
    publicarEnKb?: boolean;
  }) => void;
  onGuardarRca: (
    problemaId: string,
    payload: {
      analisis5Porques: string[];
      causaRaiz: string;
      workaround: string;
      ishikawa: IshikawaDiagrama;
    }
  ) => void;
  onDesvincularTicket: (ticketId: string) => void;
  onVincularTicket: (ticketId: string, problemaId: string) => void;
  onAsociarCiProblema: (problemaId: string, nuevoCi: string) => void;
  onSeleccionarTicket: (ticketId: string) => void;
  onAbrirRca: (problemaId: string) => void;
  onCrearRfcParaProblema: (problema: Problema) => void;
  onIrACambios: () => void;
  onRegistrarInfraccionSinRfc: (problemaId: string) => void;
  onExportarInforme: (problemaId: string) => void;
}

export const ProblemManagementView: React.FC<ProblemManagementViewProps> = ({
  problemas,
  tickets,
  rfcs,
  onCrearProblema,
  onMitigarOCerrarProblema,
  onGuardarRca,
  onDesvincularTicket,
  onVincularTicket,
  onAsociarCiProblema,
  onSeleccionarTicket,
  onAbrirRca,
  onCrearRfcParaProblema,
  onIrACambios,
  onRegistrarInfraccionSinRfc,
  onExportarInforme,
}) => {
  const [filtroEstado, setFiltroEstado] = useState<'todos' | ProblemaEstado>(
    'todos'
  );
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Infraestructura Cloud');
  const [ciAfectado, setCiAfectado] = useState('GW-KONG-PROD');
  const [prioridad, setPrioridad] = useState<TicketPrioridad>('P2 - Alta');
  const [workaround, setWorkaround] = useState('');
  const [errorForm, setErrorForm] = useState('');

  const [tabPorProblema, setTabPorProblema] = useState<
    Record<string, 'resumen' | 'rca'>
  >({});
  const [bloqueoRcaId, setBloqueoRcaId] = useState<string | null>(null);
  const [bloqueoRfcId, setBloqueoRfcId] = useState<string | null>(null);
  const [ciDraftPorProblema, setCiDraftPorProblema] = useState<
    Record<string, string>
  >({});

  // Inline mitigation / closure confirmation state requiring Workaround + Solución Definitiva
  const [accionActiva, setAccionActiva] = useState<{
    problemaId: string;
    modo: 'Error Conocido (KEDB)' | 'Resuelto';
    workaround: string;
    solucionDefinitiva: string;
    publicarEnKb: boolean;
    error: string;
  } | null>(null);

  const problemasFiltrados = problemas.filter(
    (p) => filtroEstado === 'todos' || p.estado === filtroEstado
  );

  const ticketsHuerfanos = tickets.filter(
    (t) => t.estado !== 'Resuelto' && !t.problemaVinculadoId
  );

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    if (titulo.trim().length < 5) {
      setErrorForm('Ingresa un título de problema de al menos 5 caracteres.');
      return;
    }
    onCrearProblema({
      titulo: titulo.trim(),
      descripcion:
        descripcion.trim() ||
        'Problema registrado para investigación de causa raíz y documentación en KEDB.',
      categoria,
      ciAfectado: ciAfectado.trim() || 'CI-PROD-01',
      prioridad,
      workaround: workaround.trim(),
    });
    setTitulo('');
    setDescripcion('');
    setWorkaround('');
    setErrorForm('');
    setMostrarFormulario(false);
  };

  const handleIntentarCerrar = (prb: Problema) => {
    const rcaStatus = evaluarEstadoRca(prb);
    if (rcaStatus.requiereRcaParaCerrar && !rcaStatus.rcaValido) {
      setAccionActiva(null);
      setBloqueoRfcId(null);
      setBloqueoRcaId(prb.id);
      return;
    }

    const rfcStatus = evaluarRfcParaProblema(prb, rfcs);
    if (
      rfcStatus.requiereRfcParaCerrar &&
      !rfcStatus.tieneRfcAprobadoOImplementado
    ) {
      setAccionActiva(null);
      setBloqueoRcaId(null);
      setBloqueoRfcId(prb.id);
      onRegistrarInfraccionSinRfc(prb.id);
      return;
    }

    setBloqueoRcaId(null);
    setBloqueoRfcId(null);
    setAccionActiva({
      problemaId: prb.id,
      modo: 'Resuelto',
      workaround: prb.workaround || '',
      solucionDefinitiva: prb.solucionDefinitiva || prb.causaRaiz || '',
      publicarEnKb: rcaStatus.rcaValido,
      error: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-[#111827] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#0B0F17] p-1">
          {(
            [
              'todos',
              'Investigación',
              'Causa Raíz Identificada',
              'Error Conocido (KEDB)',
              'Resuelto',
            ] as const
          ).map((est) => (
            <button
              key={est}
              type="button"
              onClick={() => setFiltroEstado(est)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                filtroEstado === est
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {est === 'todos' ? 'Todos' : est}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMostrarFormulario((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#161E2E] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <i
            className={`fa-solid ${mostrarFormulario ? 'fa-xmark' : 'fa-plus'} text-[11px]`}
            aria-hidden="true"
          />
          <span>
            {mostrarFormulario ? 'Cerrar Formulario' : 'Registrar Problema'}
          </span>
        </button>
      </div>

      {/* Inline Creation Form */}
      {mostrarFormulario && (
        <form
          onSubmit={handleCrear}
          className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4"
        >
          <h2 className="font-display text-sm font-semibold text-slate-100">
            Nuevo Registro de Problema (ITIL v4 Problem Management)
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="prb-titulo"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Título del Problema
              </label>
              <input
                id="prb-titulo"
                type="text"
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  if (errorForm) setErrorForm('');
                }}
                placeholder="Ej. Fuga de descriptores de archivo en balanceador Kong tras despliegue v3.18"
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="prb-ci"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                CI Afectado
              </label>
              <input
                id="prb-ci"
                type="text"
                value={ciAfectado}
                onChange={(e) => setCiAfectado(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 font-mono text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="prb-cat"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Categoría
              </label>
              <input
                id="prb-cat"
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="prb-prio"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Prioridad
              </label>
              <select
                id="prb-prio"
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as TicketPrioridad)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="P1 - Crítica">P1 - Crítica</option>
                <option value="P2 - Alta">P2 - Alta</option>
                <option value="P3 - Media">P3 - Media</option>
                <option value="P4 - Baja">P4 - Baja</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="prb-desc"
              className="mb-1.5 block text-xs font-medium text-slate-300"
            >
              Descripción técnica y patrón de recurrencia
            </label>
            <textarea
              id="prb-desc"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="prb-wa"
              className="mb-1.5 block text-xs font-medium text-slate-300"
            >
              Solución Temporal / Workaround inicial (opcional)
            </label>
            <input
              id="prb-wa"
              type="text"
              value={workaround}
              onChange={(e) => setWorkaround(e.target.value)}
              placeholder="Ej. Reiniciar worker de ingress cada 4 horas mientras se corrige límite ulimit"
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {errorForm && (
            <p className="text-xs text-red-400" role="alert">
              {errorForm}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Guardar Problema
            </button>
          </div>
        </form>
      )}

      {/* Master Problems with Embedded RCA Tab & Validation Gate */}
      <div className="space-y-5">
        {problemasFiltrados.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#111827] px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-200">
              No hay registros de problemas en esta fase
            </p>
          </div>
        ) : (
          problemasFiltrados.map((prb) => {
            const vinculados = tickets.filter(
              (t) => t.problemaVinculadoId === prb.id
            );
            const hijasAbiertas = vinculados.filter(
              (t) => t.estado !== 'Resuelto'
            );
            const enConfirmacion = accionActiva?.problemaId === prb.id;
            const tabActual = tabPorProblema[prb.id] ?? 'resumen';
            const rcaStatus = evaluarEstadoRca(prb);
            const rfcStatus = evaluarRfcParaProblema(prb, rfcs);
            const bloqueado = bloqueoRcaId === prb.id;
            const bloqueadoRfc = bloqueoRfcId === prb.id;

            return (
              <article
                key={prb.id}
                className="rounded-xl border border-slate-800/80 bg-[#111827] p-5 space-y-4"
              >
                {/* Master Problem Header */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-blue-400">
                        {prb.id} · Problema Maestro
                      </span>
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      <PrioridadIndicador prioridad={prb.prioridad} />
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      <EstadoProblemaIndicador estado={prb.estado} />
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-mono text-slate-300">
                        {prb.ciAfectado}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-semibold text-slate-100">
                      {prb.titulo}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Responsable: {prb.responsable} · Incidencias vinculadas:{' '}
                      <strong className="font-mono tabular-nums text-slate-200">
                        {vinculados.length}
                      </strong>{' '}
                      (
                      <span className="font-mono tabular-nums text-amber-300">
                        {hijasAbiertas.length} abiertas
                      </span>
                      )
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {prb.estado !== 'Error Conocido (KEDB)' &&
                      prb.estado !== 'Resuelto' && (
                        <button
                          type="button"
                          onClick={() => {
                            setBloqueoRcaId(null);
                            setAccionActiva({
                              problemaId: prb.id,
                              modo: 'Error Conocido (KEDB)',
                              workaround: prb.workaround || '',
                              solucionDefinitiva: prb.solucionDefinitiva || '',
                              publicarEnKb: false,
                              error: '',
                            });
                          }}
                          className="rounded-lg border border-blue-500/40 bg-blue-950/30 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-900/40 transition-colors whitespace-nowrap"
                        >
                          Mitigar (KEDB)
                        </button>
                      )}

                    {prb.estado !== 'Resuelto' && (
                      <button
                        type="button"
                        onClick={() => handleIntentarCerrar(prb)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/40 transition-colors whitespace-nowrap"
                      >
                        {((rcaStatus.requiereRcaParaCerrar &&
                          !rcaStatus.rcaValido) ||
                          (rfcStatus.requiereRfcParaCerrar &&
                            !rfcStatus.tieneRfcAprobadoOImplementado)) && (
                          <i
                            className="fa-solid fa-lock text-[10px] text-amber-300"
                            aria-hidden="true"
                          />
                        )}
                        <span>Cerrar Problema</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onCrearRfcParaProblema(prb)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-900/40 transition-colors whitespace-nowrap"
                    >
                      <i
                        className="fa-solid fa-code-branch text-[11px] text-amber-400"
                        aria-hidden="true"
                      />
                      <span>Crear RFC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onExportarInforme(prb.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      <i className="fa-solid fa-file-pdf text-[11px] text-blue-400" aria-hidden="true" />
                      <span>Exportar Informe (PDF/Imprimir)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onAbrirRca(prb.id)}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                      Laboratorio RCA →
                    </button>
                  </div>
                </div>

                {/* Per-Problem Tabs: Resumen vs RCA */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-800/80 py-2.5">
                  <div
                    className="flex items-center gap-1 rounded-lg bg-[#0B0F17] p-1"
                    role="tablist"
                    aria-label={`Secciones del problema ${prb.id}`}
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tabActual === 'resumen'}
                      onClick={() =>
                        setTabPorProblema((prev) => ({
                          ...prev,
                          [prb.id]: 'resumen',
                        }))
                      }
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                        tabActual === 'resumen'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      Resumen e Incidencias
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tabActual === 'rca'}
                      onClick={() => {
                        setBloqueoRcaId(null);
                        setTabPorProblema((prev) => ({
                          ...prev,
                          [prb.id]: 'rca',
                        }));
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                        tabActual === 'rca'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      <i
                        className="fa-solid fa-diagram-project text-[11px]"
                        aria-hidden="true"
                      />
                      <span>RCA</span>
                      <span
                        className={`font-mono text-[10px] ${
                          rcaStatus.rcaValido
                            ? 'text-emerald-300'
                            : 'text-amber-300'
                        }`}
                      >
                        {rcaStatus.rcaValido ? '✓' : '!'}
                      </span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {rcaStatus.rcaValido
                      ? 'RCA documentado (5 Porqués / Ishikawa)'
                      : rcaStatus.requiereRcaParaCerrar
                        ? 'Prioridad Alta/Crítica: RCA obligatorio antes de cerrar'
                        : 'RCA opcional para prioridad Media/Baja'}
                  </span>
                </div>

                {/* RCA Validation Gate Alert */}
                {bloqueado && (
                  <div
                    role="alert"
                    className="flex flex-col gap-3 rounded-xl border border-red-500/50 bg-red-950/25 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-red-300">
                        <i
                          className="fa-solid fa-shield-halved mr-1.5"
                          aria-hidden="true"
                        />
                        Cierre bloqueado por política ITIL v4
                      </p>
                      <p className="text-xs text-slate-200">
                        No puedes cerrar un Problema de prioridad{' '}
                        <strong>{prb.prioridad}</strong> sin haber completado al
                        menos una herramienta en la pestaña <strong>RCA</strong>{' '}
                        (Los 5 Porqués con causa raíz, o al menos 1 causa en el
                        Diagrama de Ishikawa 4M).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBloqueoRcaId(null);
                        setTabPorProblema((prev) => ({
                          ...prev,
                          [prb.id]: 'rca',
                        }));
                      }}
                      className="shrink-0 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors whitespace-nowrap"
                    >
                      Completar RCA ahora →
                    </button>
                  </div>
                )}

                {/* RFC / CMDB Governance Gate Alert (P1 without Approved/Implemented RFC) */}
                {bloqueadoRfc && (
                  <div
                    role="alert"
                    className="flex flex-col gap-3 rounded-xl border border-red-500/60 bg-red-950/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-red-300">
                        <i
                          className="fa-solid fa-triangle-exclamation mr-1.5"
                          aria-hidden="true"
                        />
                        Penalización ITIL (-35 pts): Cambio en CMDB sin RFC aprobado
                      </p>
                      <p className="text-xs text-slate-200">
                        Intentar cerrar un Problema crítico (<strong>P1 - Crítica</strong>) modificando la CMDB ({prb.ciAfectado}) sin un <strong>RFC aprobado o implementado</strong> viola Change Enablement.{' '}
                        {rfcStatus.rfcsVinculados.length > 0
                          ? `Tienes ${rfcStatus.rfcsVinculados.length} RFC vinculado(s) pendiente(s) de aprobación CAB.`
                          : 'Crea un RFC con Plan de Rollback obligatorio y solicítalo al CAB.'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {rfcStatus.rfcsVinculados.length > 0 ? (
                        <button
                          type="button"
                          onClick={onIrACambios}
                          className="rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition-colors whitespace-nowrap"
                        >
                          Gestionar Aprobación CAB →
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setBloqueoRfcId(null);
                            onCrearRfcParaProblema(prb);
                          }}
                          className="rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition-colors whitespace-nowrap"
                        >
                          Crear RFC ahora →
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Linked RFC Summary Strip */}
                {rfcStatus.rfcsVinculados.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#0B0F17] px-3.5 py-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <i
                        className="fa-solid fa-code-branch text-blue-400"
                        aria-hidden="true"
                      />
                      <span className="text-slate-400">RFCs asociados:</span>
                      {rfcStatus.rfcsVinculados.map((r) => (
                        <span
                          key={r.id}
                          className="font-mono text-slate-200"
                        >
                          <strong className="text-blue-400">{r.id}</strong> (
                          {r.tipo} ·{' '}
                          <span
                            className={
                              r.estado === 'Aprobado' ||
                              r.estado === 'Implementado'
                                ? 'text-emerald-400'
                                : r.estado === 'Rechazado'
                                  ? 'text-red-400'
                                  : 'text-amber-300'
                            }
                          >
                            {r.estado}
                          </span>
                          )
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={onIrACambios}
                      className="text-[11px] font-medium text-blue-400 hover:text-blue-300 whitespace-nowrap"
                    >
                      Ir a Gestión de Cambios →
                    </button>
                  </div>
                )}

                {/* Inline Informe de Cierre / Mass Closure Panel */}
                {enConfirmacion && accionActiva && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-amber-200">
                        {accionActiva.modo === 'Resuelto'
                          ? `Informe de Cierre Obligatorio · ${prb.id}`
                          : `Mitigar Problema ${prb.id} como Error Conocido (KEDB)`}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setAccionActiva(null)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`wa-cierre-${prb.id}`}
                          className="mb-1 block text-[11px] font-medium text-slate-300"
                        >
                          Workaround (Solución Temporal) *
                        </label>
                        <input
                          id={`wa-cierre-${prb.id}`}
                          type="text"
                          value={accionActiva.workaround}
                          onChange={(e) =>
                            setAccionActiva({
                              ...accionActiva,
                              workaround: e.target.value,
                              error: '',
                            })
                          }
                          placeholder="Mitigación temporal aplicada para restaurar servicio..."
                          className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {accionActiva.modo === 'Resuelto' && (
                        <div>
                          <label
                            htmlFor={`sol-cierre-${prb.id}`}
                            className="mb-1 block text-[11px] font-medium text-slate-300"
                          >
                            Solución Definitiva *
                          </label>
                          <input
                            id={`sol-cierre-${prb.id}`}
                            type="text"
                            value={accionActiva.solucionDefinitiva}
                            onChange={(e) =>
                              setAccionActiva({
                                ...accionActiva,
                                solucionDefinitiva: e.target.value,
                                error: '',
                              })
                            }
                            placeholder="Cambio o parche permanente que elimina la causa raíz..."
                            className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {accionActiva.modo === 'Resuelto' && rcaStatus.rcaValido && (
                      <label className="flex items-start gap-2.5 rounded-lg border border-blue-500/30 bg-[#0B0F17] p-3 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accionActiva.publicarEnKb}
                          onChange={(e) =>
                            setAccionActiva({
                              ...accionActiva,
                              publicarEnKb: e.target.checked,
                            })
                          }
                          className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="space-y-0.5">
                          <span className="block font-semibold text-blue-300">
                            ¿Publicar solución en la Base de Conocimiento (KEDB)?
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            Generará automáticamente un artículo KEDB con el síntoma, palabras clave del problema y el procedimiento de resolución para futuros FCR en N1.
                          </span>
                        </span>
                      </label>
                    )}

                    {accionActiva.error && (
                      <p className="text-xs text-red-400" role="alert">
                        <i
                          className="fa-solid fa-circle-exclamation mr-1.5"
                          aria-hidden="true"
                        />
                        {accionActiva.error}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <span className="text-xs text-slate-300">
                        {hijasAbiertas.length > 0
                          ? `Hay ${hijasAbiertas.length} incidencia(s) hija(s) abierta(s) vinculada(s) a este Problema.`
                          : 'Todas las incidencias vinculadas ya están resueltas.'}
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        {(() => {
                          const validarYEjecutar = (cerrarHijas: boolean) => {
                            if (accionActiva.workaround.trim().length < 5) {
                              setAccionActiva({
                                ...accionActiva,
                                error:
                                  'El campo Workaround (Solución Temporal) es obligatorio (mín. 5 caracteres).',
                              });
                              return;
                            }
                            if (
                              accionActiva.modo === 'Resuelto' &&
                              accionActiva.solucionDefinitiva.trim().length < 5
                            ) {
                              setAccionActiva({
                                ...accionActiva,
                                error:
                                  'El campo Solución Definitiva es obligatorio para cerrar el Problema (mín. 5 caracteres).',
                              });
                              return;
                            }
                            onMitigarOCerrarProblema({
                              problemaId: prb.id,
                              nuevoEstado: accionActiva.modo,
                              workaround: accionActiva.workaround.trim(),
                              solucionDefinitiva:
                                accionActiva.solucionDefinitiva.trim(),
                              cerrarHijasMasivamente: cerrarHijas,
                              publicarEnKb:
                                accionActiva.modo === 'Resuelto' &&
                                rcaStatus.rcaValido &&
                                accionActiva.publicarEnKb,
                            });
                            setAccionActiva(null);
                          };

                          return (
                            <>
                              {hijasAbiertas.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => validarYEjecutar(true)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors whitespace-nowrap"
                                >
                                  <i
                                    className="fa-solid fa-check-double text-[11px]"
                                    aria-hidden="true"
                                  />
                                  <span>
                                    Cerrar masivamente {hijasAbiertas.length}{' '}
                                    hija(s) y{' '}
                                    {accionActiva.modo === 'Resuelto'
                                      ? 'Cerrar Problema'
                                      : 'Mitigar'}
                                  </span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => validarYEjecutar(false)}
                                className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
                              >
                                {hijasAbiertas.length > 0
                                  ? 'Solo actualizar Problema'
                                  : 'Confirmar Cierre'}
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2-Column Problem Detail + Lateral Immutable Timeline */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                  <div className="space-y-4 xl:col-span-8">
                {/* Tab Content */}
                {tabActual === 'rca' ? (
                  <RcaToolsPanel problema={prb} onGuardarRca={onGuardarRca} />
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs leading-relaxed text-slate-300">
                      {prb.descripcion}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-[#0B0F17] p-3 text-xs">
                      <span className="font-medium text-slate-400">
                        CI en CMDB:
                      </span>
                      <input
                        type="text"
                        list={`cmdb-prb-list-${prb.id}`}
                        aria-label={`CI afectado del problema ${prb.id}`}
                        value={ciDraftPorProblema[prb.id] ?? prb.ciAfectado}
                        onChange={(e) =>
                          setCiDraftPorProblema((prev) => ({
                            ...prev,
                            [prb.id]: e.target.value,
                          }))
                        }
                        className="min-w-[180px] flex-1 rounded-md border border-slate-700 bg-[#111827] px-2.5 py-1 font-mono text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                      />
                      <datalist id={`cmdb-prb-list-${prb.id}`}>
                        {CMDB_CIS_SUGERIDOS.map((ci) => (
                          <option key={ci} value={ci} />
                        ))}
                      </datalist>
                      {(ciDraftPorProblema[prb.id] ?? prb.ciAfectado).trim() &&
                        (ciDraftPorProblema[prb.id] ?? prb.ciAfectado).trim() !==
                          prb.ciAfectado && (
                          <button
                            type="button"
                            onClick={() => {
                              const nuevo = (
                                ciDraftPorProblema[prb.id] ?? prb.ciAfectado
                              )
                                .trim()
                                .toUpperCase();
                              onAsociarCiProblema(prb.id, nuevo);
                              setCiDraftPorProblema((prev) => ({
                                ...prev,
                                [prb.id]: nuevo,
                              }));
                            }}
                            className="rounded-md bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-500 transition-colors whitespace-nowrap"
                          >
                            Asociar CI
                          </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 border-t border-slate-800/70 pt-4 md:grid-cols-2">
                      <div>
                        <span className="block text-[11px] font-medium text-slate-400">
                          Solución Temporal (Workaround KEDB)
                        </span>
                        <p className="mt-1 text-xs leading-relaxed text-slate-200">
                          {prb.workaround ||
                            'Sin workaround documentado. Investiga mitigación temporal en la pestaña RCA.'}
                        </p>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-400">
                          Causa Raíz Documentada
                        </span>
                        <p className="mt-1 text-xs leading-relaxed text-slate-200">
                          {prb.causaRaiz ||
                            'Pendiente de determinación de causa raíz en la pestaña RCA.'}
                        </p>
                      </div>
                    </div>

                    {/* Underlying Child Incidents Section */}
                    <div className="border-t border-slate-800/70 pt-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-200">
                          Incidencias Subyacentes Vinculadas ({vinculados.length})
                        </h4>

                        {ticketsHuerfanos.length > 0 &&
                          prb.estado !== 'Resuelto' && (
                            <div className="flex items-center gap-2">
                              <select
                                defaultValue=""
                                aria-label={`Vincular incidencia abierta a ${prb.id}`}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    onVincularTicket(e.target.value, prb.id);
                                    e.target.value = '';
                                  }
                                }}
                                className="rounded-lg border border-slate-700 bg-[#0B0F17] px-2.5 py-1.5 text-[11px] text-slate-200 focus:border-blue-500 focus:outline-none"
                              >
                                <option value="">
                                  + Vincular incidencia abierta...
                                </option>
                                {ticketsHuerfanos.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.id} — {t.titulo.slice(0, 46)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                      </div>

                      {vinculados.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No hay incidencias vinculadas a este Problema maestro todavía.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#0B0F17]">
                          <table className="w-full border-collapse text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-800 text-[11px] font-medium text-slate-400">
                                <th className="py-2.5 pl-3.5 pr-2">ID</th>
                                <th className="px-2 py-2.5">Incidencia Hija</th>
                                <th className="px-2 py-2.5">Nivel</th>
                                <th className="px-2 py-2.5">Estado</th>
                                <th className="px-2 py-2.5">SLA</th>
                                <th className="py-2.5 pl-2 pr-3.5 text-right">
                                  Acciones
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {vinculados.map((t) => (
                                <tr
                                  key={t.id}
                                  className="transition-colors hover:bg-slate-800/30"
                                >
                                  <td className="py-2.5 pl-3.5 pr-2 font-mono font-medium text-blue-400 whitespace-nowrap">
                                    {t.id}
                                  </td>
                                  <td className="px-2 py-2.5 max-w-[165px]">
                                    <p className="truncate font-medium text-slate-200">
                                      {t.titulo}
                                    </p>
                                  </td>
                                  <td className="px-2 py-2.5 font-mono text-slate-300 whitespace-nowrap">
                                    {t.nivel}
                                  </td>
                                  <td className="px-2 py-2.5">
                                    <EstadoTicketIndicador estado={t.estado} />
                                  </td>
                                  <td className="px-2 py-2.5">
                                    <SlaBarraProgreso ticket={t} />
                                  </td>
                                  <td className="py-2.5 pl-2 pr-3.5 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => onSeleccionarTicket(t.id)}
                                        className="text-[11px] font-medium text-blue-400 hover:text-blue-300"
                                      >
                                        Ver
                                      </button>
                                      {t.estado !== 'Resuelto' && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onDesvincularTicket(t.id)
                                          }
                                          className="text-[11px] text-slate-400 hover:text-red-400"
                                        >
                                          Desvincular
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                  </div>

                  {/* Right Lateral Timeline Column for Problem Audit */}
                  <aside
                    aria-label={`Timeline de auditoría del problema ${prb.id}`}
                    className="rounded-xl border border-slate-800/80 bg-[#0B0F17]/70 p-4 xl:col-span-4 max-h-[540px] overflow-y-auto"
                  >
                    <HistoryTimeline
                      historyLog={prb.historyLog}
                      titulo={`Timeline · ${prb.id}`}
                      subtitulo="Registro inmutable de acciones del problema"
                    />
                  </aside>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
