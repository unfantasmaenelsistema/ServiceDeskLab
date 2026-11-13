import React from 'react';
import {
  EvaluacionAlumno,
  Metricas,
  Problema,
  RolSimulador,
  Ticket,
  VistaActiva,
} from '../types/itsm';
import {
  EstadoTicketIndicador,
  PrioridadIndicador,
  SlaBarraProgreso,
} from './ItsmStatusHelpers';

interface DashboardViewProps {
  tickets: Ticket[];
  problemas: Problema[];
  metricas: Metricas;
  evaluacion: EvaluacionAlumno;
  rolActivo?: RolSimulador;
  simulacionMinutosAvanzados: number;
  escenarioEnCurso: {
    titulo: string;
    recibidos: number;
    total: number;
    ultimoMensaje: string;
  } | null;
  onAvanzarSla: (minutos: number) => void;
  onSimularIncidenteP1: () => void;
  onAbrirEscenarios: () => void;
  onDetenerEscenario: () => void;
  onExportarInforme: () => void;
  onSeleccionarTicket: (ticketId: string) => void;
  onEscalarN2: (ticketId: string) => void;
  onNavegar: (vista: VistaActiva, filtroCategoria?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tickets,
  problemas,
  metricas,
  evaluacion,
  rolActivo = 'sdm',
  simulacionMinutosAvanzados,
  escenarioEnCurso,
  onAvanzarSla,
  onSimularIncidenteP1,
  onAbrirEscenarios,
  onDetenerEscenario,
  onExportarInforme,
  onSeleccionarTicket,
  onEscalarN2,
  onNavegar,
}) => {
  const ticketsAbiertosOrdenados = tickets
    .filter((t) => t.estado !== 'Resuelto')
    .sort((a, b) => {
      if (a.slaIncumplido !== b.slaIncumplido) {
        return a.slaIncumplido ? -1 : 1;
      }
      const ratioA = a.slaTranscurridoSeg / Math.max(a.slaObjetivoSeg, 1);
      const ratioB = b.slaTranscurridoSeg / Math.max(b.slaObjetivoSeg, 1);
      return ratioB - ratioA;
    });

  const maxCatCantidad = Math.max(
    1,
    ...metricas.porCategoria.map((c) => c.cantidad)
  );

  // SVG Chart geometry for SLA Compliance Trend
  const chartW = 460;
  const chartH = 160;
  const padX = 36;
  const padY = 20;
  const plotW = chartW - padX * 2;
  const plotH = chartH - padY * 2;

  const puntosSla = metricas.historialSla.map((punto, idx) => {
    const x =
      padX +
      (idx / Math.max(1, metricas.historialSla.length - 1)) * plotW;
    const clampedPct = Math.max(40, Math.min(100, punto.cumplimientoPct));
    const y = padY + ((100 - clampedPct) / 60) * plotH;
    return { ...punto, x, y };
  });

  const linePath = puntosSla
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const areaPath =
    puntosSla.length > 0
      ? `${linePath} L ${puntosSla[puntosSla.length - 1].x.toFixed(1)} ${(
          padY + plotH
        ).toFixed(1)} L ${puntosSla[0].x.toFixed(1)} ${(
          padY + plotH
        ).toFixed(1)} Z`
      : '';

  const incidentesSinProblema = tickets.filter(
    (t) =>
      t.estado !== 'Resuelto' &&
      (t.prioridad === 'P1 - Crítica' || t.prioridad === 'P2 - Alta') &&
      !t.problemaVinculadoId
  );

  const nivelEvaluacion =
    evaluacion.puntuacion >= 130
      ? { label: 'Especialista N2 Destacado', color: 'text-emerald-400' }
      : evaluacion.puntuacion >= 90
        ? { label: 'Analista N2 Operativo', color: 'text-blue-400' }
        : { label: 'Requiere Refuerzo ITIL', color: 'text-amber-400' };

  const auditoriaGlobal = [
    ...tickets.flatMap((t) =>
      t.historyLog.map((ev) => ({
        ...ev,
        entidadId: t.id,
        entidadTipo: 'Ticket' as const,
      }))
    ),
    ...problemas.flatMap((p) =>
      p.historyLog.map((ev) => ({
        ...ev,
        entidadId: p.id,
        entidadTipo: 'Problema' as const,
      }))
    ),
  ]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 12);

  const mttrObjetivoMin = 30;
  const mttrCumpleMeta =
    metricas.ticketsResueltos === 0 || metricas.mttrMinutos <= mttrObjetivoMin;
  const mttrBarPct = Math.min(
    100,
    Math.round((metricas.mttrMinutos / Math.max(mttrObjetivoMin * 1.5, 1)) * 100)
  );
  const fcrBarPct = Math.min(100, Math.max(0, metricas.tasaFcrPct));

  return (
    <div className="space-y-6">
      {/* Educational Simulation Control Bar */}
      <section
        aria-label="Controles de simulación temporal, escenarios y exportación"
        className="flex flex-col gap-4 rounded-xl border border-slate-800/80 bg-[#111827] p-4 xl:flex-row xl:items-center xl:justify-between"
      >
        <div className="space-y-0.5">
          <h2 className="font-display text-sm font-semibold text-slate-100">
            Consola de Simulación Nivel 2
          </h2>
          <p className="text-xs text-slate-400">
            Tiempo simulado acumulado:{' '}
            <span className="font-mono tabular-nums text-slate-200">
              +{simulacionMinutosAvanzados} min
            </span>
            <span className="mx-2 text-slate-600" aria-hidden="true">
              ·
            </span>
            Cronómetro SLA activo y sincronizado en LocalStorage
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onAbrirEscenarios}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 whitespace-nowrap shrink-0"
          >
            <i className="fa-solid fa-clapperboard text-[11px]" aria-hidden="true" />
            <span>Cargar Escenario de Simulación</span>
          </button>

          {escenarioEnCurso && escenarioEnCurso.recibidos < escenarioEnCurso.total && (
            <button
              type="button"
              onClick={onDetenerEscenario}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 whitespace-nowrap shrink-0"
            >
              <i className="fa-solid fa-stop text-[10px]" aria-hidden="true" />
              <span>Detener ({escenarioEnCurso.recibidos}/{escenarioEnCurso.total})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onAvanzarSla(5)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#161E2E] px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap shrink-0"
          >
            <i className="fa-regular fa-clock text-blue-400" aria-hidden="true" />
            <span>Avanzar Reloj SLA (+5m)</span>
          </button>

          <button
            type="button"
            onClick={onSimularIncidenteP1}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-950/30 px-3.5 py-2 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0"
          >
            <i className="fa-solid fa-bolt text-amber-400" aria-hidden="true" />
            <span>Inyectar Incidente P1</span>
          </button>

          <button
            type="button"
            onClick={onExportarInforme}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-xs font-medium text-slate-100 transition-colors hover:border-blue-500/50 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap shrink-0"
          >
            <i className="fa-solid fa-print text-blue-400" aria-hidden="true" />
            <span>Exportar Informe (PDF/Imprimir)</span>
          </button>
        </div>
      </section>

      {/* Primary KPI Strip (4 columns) */}
      <section
        aria-label="Indicadores clave de rendimiento ITIL v4"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {/* KPI 1: Tickets Abiertos */}
        <article className="rounded-xl border border-slate-800/80 bg-[#111827] p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Tickets Abiertos</span>
            <i className="fa-solid fa-ticket text-blue-400" aria-hidden="true" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-slate-100">
              {metricas.ticketsAbiertos}
            </p>
            <span className="font-mono text-xs tabular-nums text-slate-400">
              de {metricas.ticketsTotales} totales
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800/70 pt-3 text-xs text-slate-400">
            <span className="font-mono tabular-nums text-slate-200">
              N1: {metricas.ticketsN1Abiertos}
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="font-mono tabular-nums text-blue-400">
              N2: {metricas.ticketsN2Abiertos}
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="font-mono tabular-nums text-emerald-400">
              FCR: {metricas.fcrCumplidos} ({metricas.tasaFcrPct}%)
            </span>
          </div>
        </article>

        {/* KPI 2: SLA Incumplidos */}
        <article className="rounded-xl border border-slate-800/80 bg-[#111827] p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>SLA Incumplidos</span>
            <i
              className={`fa-solid fa-stopwatch ${
                metricas.slaIncumplidos > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p
              className={`font-mono text-3xl font-semibold tracking-tight tabular-nums ${
                metricas.slaIncumplidos > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {metricas.slaIncumplidos}
            </p>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                metricas.slaIncumplidos > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              <i
                className={`fa-solid ${
                  metricas.slaIncumplidos > 0
                    ? 'fa-circle-exclamation'
                    : 'fa-circle-check'
                } text-[11px]`}
                aria-hidden="true"
              />
              <span>
                {metricas.slaIncumplidos > 0 ? 'Requiere atención' : 'Nominal'}
              </span>
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-slate-800/70 pt-3 text-xs text-slate-400">
            <span>
              Cumplimiento:{' '}
              <strong className="font-mono tabular-nums text-slate-200">
                {metricas.tasaCumplimientoSla}%
              </strong>
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="font-mono tabular-nums text-amber-400">
              En riesgo: {metricas.slaEnRiesgo}
            </span>
          </div>
        </article>

        {/* KPI 3: Problemas Activos */}
        <article className="rounded-xl border border-slate-800/80 bg-[#111827] p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Problemas Activos</span>
            <i
              className="fa-solid fa-triangle-exclamation text-amber-400"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-slate-100">
              {metricas.problemasActivos}
            </p>
            <button
              type="button"
              onClick={() => onNavegar('kb')}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
            >
              Ver KEDB ({metricas.articulosKb}) →
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-slate-800/70 pt-3 text-xs text-slate-400">
            <span className="font-mono tabular-nums text-blue-400 whitespace-nowrap">
              KEDB: {metricas.erroresConocidos} conocidos
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="font-mono tabular-nums text-slate-300 whitespace-nowrap">
              Total: {problemas.length}
            </span>
          </div>
        </article>

        {/* KPI 4: Evaluación / Puntuación del Alumno */}
        <article className="rounded-xl border border-slate-800/80 bg-[#111827] p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Puntuación ITIL v4</span>
            <i className="fa-solid fa-award text-amber-400" aria-hidden="true" />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-slate-100 whitespace-nowrap">
              {evaluacion.puntuacion}{' '}
              <span className="text-base font-normal text-slate-400">pts</span>
            </p>
            <span className={`text-right text-xs font-medium leading-tight ${nivelEvaluacion.color}`}>
              {nivelEvaluacion.label}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800/70 pt-3 text-xs text-slate-400">
            <span className="font-mono tabular-nums text-emerald-400">
              +{evaluacion.clasificacionesCorrectas} clasif.
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="font-mono tabular-nums text-blue-400">
              {evaluacion.rcasCompletados} RCA
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="font-mono tabular-nums text-emerald-300">
              {evaluacion.fcrsCumplidos ?? 0} FCR
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="font-mono tabular-nums text-red-400">
              -
              {evaluacion.penalizacionesSla +
                evaluacion.cierresSinCausaRaiz +
                (evaluacion.infraccionesSinRfc ?? 0)}{' '}
              faltas
            </span>
          </div>
        </article>
      </section>

      {/* Executive SDM KPIs: Dynamic MTTR, FCR Rate & CSAT */}
      <section
        aria-label="KPIs directivos SDM de MTTR, Tasa de FCR y CSAT"
        className={
          rolActivo === 'sdm'
            ? 'grid grid-cols-1 gap-4 lg:grid-cols-3'
            : 'hidden'
        }
      >
        <article className="rounded-xl border border-blue-500/30 bg-[#111827] p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-medium text-blue-300">
                KPI Directivo SDM · Resolución
              </span>
              <h2 className="mt-0.5 font-display text-sm font-semibold text-slate-100">
                MTTR (Tiempo Medio de Resolución)
              </h2>
            </div>
            <i
              className={`fa-solid fa-gauge-high text-base ${
                mttrCumpleMeta ? 'text-emerald-400' : 'text-amber-400'
              }`}
              aria-hidden="true"
            />
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-3xl font-bold tracking-tight tabular-nums text-slate-100">
              {metricas.ticketsResueltos > 0 ? `${metricas.mttrMinutos} min` : '0.0 min'}
            </p>
            <span className="text-xs text-slate-400 text-right">
              <strong className="font-mono tabular-nums text-slate-200">
                {metricas.ticketsResueltos}
              </strong>{' '}
              cierre(s) en sesión
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  mttrCumpleMeta ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${metricas.ticketsResueltos > 0 ? Math.max(8, mttrBarPct) : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Meta: ≤ {mttrObjetivoMin} min</span>
              <span className={mttrCumpleMeta ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                {metricas.ticketsResueltos === 0
                  ? 'Sin cierres aún'
                  : mttrCumpleMeta
                    ? 'Dentro de objetivo'
                    : 'Sobre objetivo'}
              </span>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-emerald-500/30 bg-[#111827] p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-medium text-emerald-300">
                KPI Directivo SDM · Nivel 1 &amp; KEDB
              </span>
              <h2 className="mt-0.5 font-display text-sm font-semibold text-slate-100">
                Tasa de FCR (Primer Contacto)
              </h2>
            </div>
            <i
              className="fa-solid fa-bolt-lightning text-base text-emerald-400"
              aria-hidden="true"
            />
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-3xl font-bold tracking-tight tabular-nums text-emerald-400">
              {metricas.tasaFcrPct}%
            </p>
            <span className="text-xs text-slate-400 text-right">
              <strong className="font-mono tabular-nums text-slate-200">
                {metricas.fcrCumplidos}
              </strong>{' '}
              / {metricas.ticketsResueltos} (&lt; 3 min)
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${fcrBarPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Benchmark ITIL: ≥ 70%</span>
              <span className="font-mono text-slate-300">
                KEDB: {metricas.articulosKb} art.
              </span>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-amber-500/30 bg-[#111827] p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-medium text-amber-300">
                KPI Directivo SDM · Experiencia
              </span>
              <h2 className="mt-0.5 font-display text-sm font-semibold text-slate-100">
                CSAT (Satisfacción de Usuario)
              </h2>
            </div>
            <i
              className="fa-solid fa-star text-base text-amber-400"
              aria-hidden="true"
            />
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-3xl font-bold tracking-tight tabular-nums text-amber-300">
              {metricas.csatTotalRespuestas > 0
                ? `${metricas.csatPromedio}/5`
                : '—/5'}
            </p>
            <span className="text-xs text-slate-400 text-right">
              <strong className="font-mono tabular-nums text-slate-200">
                {metricas.csatTotalRespuestas}
              </strong>{' '}
              encuesta(s) recibida(s)
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{
                  width: `${
                    metricas.csatTotalRespuestas > 0
                      ? Math.round((metricas.csatPromedio / 5) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Objetivo servicio: ≥ 4.2 / 5</span>
              <span className="text-slate-300">
                {metricas.csatTotalRespuestas > 0
                  ? metricas.csatPromedio >= 4.2
                    ? 'Satisfacción óptima'
                    : 'Revisar calidad de cierre'
                  : 'Valorable en Portal Usuario'}
              </span>
            </div>
          </div>
        </article>
      </section>

      {/* Main Analytical 2-Column Split */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left: Priority Queue + Student Evaluation Log */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          <section
            aria-label="Cola prioritaria de incidentes y riesgo SLA"
            className="flex flex-col rounded-xl border border-slate-800/80 bg-[#111827]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 px-5 py-4">
              <div>
                <h2 className="font-display text-sm font-semibold text-slate-100">
                  Cola Prioritaria y Riesgo de SLA
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Ordenado por urgencia de vencimiento · Clic en una fila para diagnosticar
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavegar('tickets')}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap shrink-0"
              >
                Abrir cola completa →
              </button>
            </div>

            {ticketsAbiertosOrdenados.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                <i
                  className="fa-solid fa-circle-check mb-3 text-2xl text-emerald-400"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-slate-200">
                  Todos los incidentes han sido resueltos
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Usa "Nuevo Incidente" o "Inyectar Incidente P1" para continuar practicando.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[11px] font-medium text-slate-400">
                      <th className="py-3 pl-5 pr-3">ID</th>
                      <th className="px-3 py-3">Incidente y CI</th>
                      <th className="px-3 py-3">Prioridad</th>
                      <th className="px-3 py-3">Estado</th>
                      <th className="px-3 py-3">SLA</th>
                      <th className="py-3 pl-3 pr-5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {ticketsAbiertosOrdenados.slice(0, 6).map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => onSeleccionarTicket(ticket.id)}
                        className="cursor-pointer transition-colors hover:bg-slate-800/40"
                      >
                        <td className="py-3 pl-5 pr-3 font-mono font-medium text-blue-400 whitespace-nowrap">
                          {ticket.id}
                        </td>
                        <td className="px-3 py-3 max-w-[240px]">
                          <p className="truncate font-medium text-slate-100">
                            {ticket.titulo}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-slate-400">
                            <span className="font-mono text-slate-300">
                              {ticket.nivel}
                            </span>
                            <span className="mx-1.5 text-slate-600" aria-hidden="true">
                              ·
                            </span>
                            <span className="font-mono">{ticket.ciAfectado}</span>
                            {ticket.problemaVinculadoId && (
                              <>
                                <span
                                  className="mx-1.5 text-slate-600"
                                  aria-hidden="true"
                                >
                                  ·
                                </span>
                                <span className="font-mono text-amber-300">
                                  {ticket.problemaVinculadoId}
                                </span>
                              </>
                            )}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <PrioridadIndicador prioridad={ticket.prioridad} />
                        </td>
                        <td className="px-3 py-3">
                          <EstadoTicketIndicador estado={ticket.estado} />
                        </td>
                        <td className="px-3 py-3">
                          <SlaBarraProgreso ticket={ticket} />
                        </td>
                        <td
                          className="py-3 pl-3 pr-5 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ticket.nivel === 'N1' ? (
                            <button
                              type="button"
                              onClick={() => onEscalarN2(ticket.id)}
                              className="rounded-md border border-slate-700 bg-slate-800/70 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:border-blue-500/50 hover:text-blue-300 transition-colors"
                            >
                              Escalar a N2
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSeleccionarTicket(ticket.id)}
                              className="rounded-md border border-slate-700 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                            >
                              Gestionar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Student Scoring & Feedback Ledger */}
          <section
            aria-label="Historial de evaluación y puntuación ITIL v4"
            className="rounded-xl border border-slate-800/80 bg-[#111827] p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-sm font-semibold text-slate-100">
                  Evaluación del Desempeño (Puntuación ITIL v4)
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  MTTR promedio:{' '}
                  <span className="font-mono tabular-nums text-slate-200">
                    {metricas.mttrMinutos} min
                  </span>{' '}
                  · Registro automático de aciertos y penalizaciones
                </p>
              </div>
              <span className="font-mono text-lg font-bold tabular-nums text-blue-400">
                {evaluacion.puntuacion} pts
              </span>
            </div>

            <ul className="divide-y divide-slate-800/60 text-xs">
              {evaluacion.historialEventos.slice(0, 5).map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] text-slate-400 mr-2">
                      {ev.referenciaId}
                    </span>
                    <span className="text-slate-200">{ev.concepto}</span>
                  </div>
                  <span
                    className={`font-mono font-semibold tabular-nums whitespace-nowrap ${
                      ev.delta > 0
                        ? 'text-emerald-400'
                        : ev.delta < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                    }`}
                  >
                    {ev.delta > 0 ? `+${ev.delta}` : ev.delta} pts
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right: SLA Trend Chart + Category Distribution + ITIL Guidance */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* SLA Trend SVG Chart */}
          <section
            aria-label="Tendencia de cumplimiento SLA por franja horaria"
            className="rounded-xl border border-slate-800/80 bg-[#111827] p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-sm font-semibold text-slate-100">
                  Tendencia de Cumplimiento SLA
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Evolución porcentual durante la jornada operativa
                </p>
              </div>
              <span className="font-mono text-sm font-semibold tabular-nums text-blue-400">
                {metricas.tasaCumplimientoSla}%
              </span>
            </div>

            <div className="mt-4">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full overflow-visible"
                role="img"
                aria-label="Gráfico de tendencia de cumplimiento SLA"
              >
                <defs>
                  <linearGradient id="slaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[100, 80, 60, 40].map((val) => {
                  const y = padY + ((100 - val) / 60) * plotH;
                  return (
                    <g key={val}>
                      <line
                        x1={padX}
                        y1={y}
                        x2={chartW - padX}
                        y2={y}
                        stroke="#1E293B"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={padX - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-slate-500 font-mono text-[10px]"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {areaPath && <path d={areaPath} fill="url(#slaGrad)" />}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {puntosSla.map((p) => (
                  <g key={p.franja}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="3.5"
                      fill="#0B0F17"
                      stroke="#60A5FA"
                      strokeWidth="2"
                    />
                    <text
                      x={p.x}
                      y={chartH - 2}
                      textAnchor="middle"
                      className="fill-slate-400 font-mono text-[10px]"
                    >
                      {p.franja}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </section>

          {/* Category Breakdown */}
          <section
            aria-label="Carga abierta por categoría de servicio"
            className="rounded-xl border border-slate-800/80 bg-[#111827] p-5"
          >
            <h2 className="font-display text-sm font-semibold text-slate-100">
              Carga Abierta por Categoría
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Selecciona una categoría para filtrar la cola de incidentes
            </p>

            <div className="mt-4 space-y-3">
              {metricas.porCategoria.length === 0 ? (
                <p className="text-xs text-slate-400">
                  Sin incidentes activos en este momento.
                </p>
              ) : (
                metricas.porCategoria.map((cat) => {
                  const pctWidth = Math.round(
                    (cat.cantidad / maxCatCantidad) * 100
                  );
                  return (
                    <button
                      key={cat.categoria}
                      type="button"
                      onClick={() => onNavegar('tickets', cat.categoria)}
                      className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                          {cat.categoria}
                        </span>
                        <span className="font-mono tabular-nums text-slate-400">
                          {cat.cantidad} activos
                          {cat.criticos > 0 && (
                            <span className="ml-1.5 text-amber-400">
                              ({cat.criticos} P1/P2)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full bg-blue-500 transition-all duration-200 group-hover:bg-blue-400"
                          style={{ width: `${pctWidth}%` }}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Educational ITIL v4 Contextual Callout */}
          <section
            aria-label="Recomendación metodológica ITIL v4"
            className="rounded-xl border border-slate-800/80 bg-[#111827] p-5"
          >
            <div className="flex items-start gap-3">
              <i
                className="fa-solid fa-graduation-cap mt-0.5 text-sm text-blue-400"
                aria-hidden="true"
              />
              <div className="space-y-1.5">
                <h3 className="font-display text-xs font-semibold text-slate-100">
                  Práctica ITIL v4 · Nivel 2
                </h3>
                <p className="text-xs leading-relaxed text-slate-300">
                  {metricas.slaIncumplidos > 0
                    ? `Tienes ${metricas.slaIncumplidos} incidente(s) con SLA vencido. Prioriza aplicar soluciones temporales (Workarounds) documentadas en la KEDB para restaurar el servicio antes de profundizar en el Análisis RCA.`
                    : incidentesSinProblema.length > 0
                      ? `Hay ${incidentesSinProblema.length} incidente(s) P1/P2 sin registro de Problema vinculado. Si el fallo es recurrente, vincúlalo en Gestión de Problemas para evitar futuros incumplimientos de SLA.`
                      : 'Operación estabilizada dentro de los acuerdos de nivel de servicio. Documenta los informes de cierre y exporta el folio A4 para auditoría.'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* SDM Global Immutable Audit Trail */}
      <section
        aria-label="Auditoría global inmutable de la sesión SDM"
        className={
          rolActivo === 'sdm'
            ? 'rounded-xl border border-slate-800/80 bg-[#111827] p-5 space-y-4'
            : 'hidden'
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="font-display text-sm font-semibold text-slate-100">
              <i
                className="fa-solid fa-clipboard-check mr-2 text-blue-400"
                aria-hidden="true"
              />
              Auditoría Global de Trazabilidad (SDM)
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Registro inmutable consolidado de acciones en Tickets y Problemas durante la sesión actual
            </p>
          </div>
          <span className="font-mono text-xs text-slate-400">
            Últimos {auditoriaGlobal.length} eventos
          </span>
        </div>

        {auditoriaGlobal.length === 0 ? (
          <p className="text-xs text-slate-400">
            No hay eventos auditables registrados todavía.
          </p>
        ) : (
          <ul className="divide-y divide-slate-800/60 text-xs">
            {auditoriaGlobal.map((ev) => (
              <li
                key={`${ev.entidadId}-${ev.id}`}
                className="flex flex-col gap-1.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-[#0B0F17] text-blue-400">
                    <i className={`${ev.icono} text-[11px]`} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {ev.entidadTipo === 'Ticket' ? (
                        <button
                          type="button"
                          onClick={() => onSeleccionarTicket(ev.entidadId)}
                          className="font-mono font-semibold text-blue-400 hover:text-blue-300"
                        >
                          {ev.entidadId}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onNavegar('problemas')}
                          className="font-mono font-semibold text-amber-300 hover:text-amber-200"
                        >
                          {ev.entidadId}
                        </button>
                      )}
                      <span className="font-medium text-slate-100">
                        {ev.accion}
                      </span>
                    </div>
                    {ev.detalle && (
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {ev.detalle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-8 sm:pl-0 shrink-0 text-[11px] text-slate-400">
                  <span>{ev.actor}</span>
                  <span className="font-mono text-slate-500">
                    {ev.timestampSimuladoLabel}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
