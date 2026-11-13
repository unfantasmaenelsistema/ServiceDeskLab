import React, { useMemo, useState } from 'react';
import {
  CMDB_CIS_SUGERIDOS,
  CMDB_TOPOLOGIA,
  CmdbCiMetadata,
} from '../data/serviceDeskStore';
import {
  PrefillNuevoTicket,
  Problema,
  SolicitudCambioRfc,
  Ticket,
} from '../types/itsm';

interface CmdbViewProps {
  tickets: Ticket[];
  problemas: Problema[];
  rfcs: SolicitudCambioRfc[];
  onSeleccionarTicket: (ticketId: string) => void;
  onIrAProblemas: () => void;
  onIrACambios: () => void;
  onCrearTicketEnCi: (prefill: PrefillNuevoTicket) => void;
}

interface RegistroCi {
  ci: string;
  categoria: string;
  metadata?: CmdbCiMetadata;
  dependientes: string[];
  ticketsAbiertos: Ticket[];
  ticketsTotales: number;
  problemasActivos: Problema[];
  rfcsAsociados: SolicitudCambioRfc[];
  estadoSalud: 'Crítico' | 'Degradado' | 'Nominal';
}

export const CmdbView: React.FC<CmdbViewProps> = ({
  tickets,
  problemas,
  rfcs,
  onSeleccionarTicket,
  onIrAProblemas,
  onIrACambios,
  onCrearTicketEnCi,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroSalud, setFiltroSalud] = useState<
    'Todos' | 'Crítico' | 'Degradado' | 'Nominal'
  >('Todos');

  const inventarioCmdb = useMemo<RegistroCi[]>(() => {
    const ciSet = new Set<string>(CMDB_CIS_SUGERIDOS);
    tickets.forEach((t) => t.ciAfectado && ciSet.add(t.ciAfectado));
    problemas.forEach((p) => p.ciAfectado && ciSet.add(p.ciAfectado));
    rfcs.forEach((r) => r.ciAfectado && ciSet.add(r.ciAfectado));

    const registros: RegistroCi[] = Array.from(ciSet).map((ci) => {
      const tks = tickets.filter((t) => t.ciAfectado === ci);
      const tksAbiertos = tks.filter((t) => t.estado !== 'Resuelto');
      const prbsActivos = problemas.filter(
        (p) => p.ciAfectado === ci && p.estado !== 'Resuelto'
      );
      const rfcsCi = rfcs.filter((r) => r.ciAfectado === ci);
      const metadata = CMDB_TOPOLOGIA[ci];

      const dependientes = Object.entries(CMDB_TOPOLOGIA)
        .filter(([, meta]) => meta.dependeDe.includes(ci))
        .map(([depCi]) => depCi);

      const tieneCritico =
        tksAbiertos.some(
          (t) => t.prioridad === 'P1 - Crítica' || t.slaIncumplido
        ) || prbsActivos.some((p) => p.prioridad === 'P1 - Crítica');
      const tieneDegradado = tksAbiertos.length > 0 || prbsActivos.length > 0;

      const estadoSalud: RegistroCi['estadoSalud'] = tieneCritico
        ? 'Crítico'
        : tieneDegradado
          ? 'Degradado'
          : 'Nominal';

      const categoria =
        tks[0]?.categoria ||
        problemas.find((p) => p.ciAfectado === ci)?.categoria ||
        metadata?.tipo ||
        'Infraestructura TI';

      return {
        ci,
        categoria,
        metadata,
        dependientes,
        ticketsAbiertos: tksAbiertos,
        ticketsTotales: tks.length,
        problemasActivos: prbsActivos,
        rfcsAsociados: rfcsCi,
        estadoSalud,
      };
    });

    const pesoSalud = { Crítico: 0, Degradado: 1, Nominal: 2 };
    return registros.sort(
      (a, b) =>
        pesoSalud[a.estadoSalud] - pesoSalud[b.estadoSalud] ||
        a.ci.localeCompare(b.ci)
    );
  }, [tickets, problemas, rfcs]);

  const resumenSalud = useMemo(
    () => ({
      total: inventarioCmdb.length,
      criticos: inventarioCmdb.filter((c) => c.estadoSalud === 'Crítico')
        .length,
      degradados: inventarioCmdb.filter((c) => c.estadoSalud === 'Degradado')
        .length,
      nominales: inventarioCmdb.filter((c) => c.estadoSalud === 'Nominal')
        .length,
    }),
    [inventarioCmdb]
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return inventarioCmdb.filter((item) => {
      if (filtroSalud !== 'Todos' && item.estadoSalud !== filtroSalud) {
        return false;
      }
      if (!q) return true;
      return (
        item.ci.toLowerCase().includes(q) ||
        item.categoria.toLowerCase().includes(q) ||
        item.estadoSalud.toLowerCase().includes(q) ||
        (item.metadata?.servicioNegocio.toLowerCase().includes(q) ?? false) ||
        (item.metadata?.propietario.toLowerCase().includes(q) ?? false)
      );
    });
  }, [inventarioCmdb, busqueda, filtroSalud]);

  return (
    <div className="space-y-5">
      {/* Health Summary Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article className="rounded-xl border border-slate-800/80 bg-[#111827] p-4">
          <span className="text-xs text-slate-400">CIs Registrados</span>
          <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-slate-100">
            {resumenSalud.total}
          </p>
        </article>
        <article className="rounded-xl border border-red-500/30 bg-[#111827] p-4">
          <span className="text-xs text-red-300">Estado Crítico</span>
          <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-red-400">
            {resumenSalud.criticos}
          </p>
        </article>
        <article className="rounded-xl border border-amber-500/30 bg-[#111827] p-4">
          <span className="text-xs text-amber-300">Degradados</span>
          <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-amber-400">
            {resumenSalud.degradados}
          </p>
        </article>
        <article className="rounded-xl border border-emerald-500/30 bg-[#111827] p-4">
          <span className="text-xs text-emerald-300">Nominales</span>
          <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-emerald-400">
            {resumenSalud.nominales}
          </p>
        </article>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-[#111827] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold text-slate-100">
            Base de Datos de Configuración (CMDB) &amp; Análisis de Impacto
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Topología de dependencias upstream/downstream, incidentes abiertos, problemas maestros y cambios RFC por CI
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-lg bg-[#0B0F17] p-1">
            {(['Todos', 'Crítico', 'Degradado', 'Nominal'] as const).map(
              (est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setFiltroSalud(est)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    filtroSalud === est
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {est}
                </button>
              )
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <i
              className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Filtrar CI, servicio o equipo..."
              aria-label="Filtrar CIs de la CMDB"
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] py-2 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* CI Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtrados.map((item) => {
          const colorSalud =
            item.estadoSalud === 'Crítico'
              ? 'text-red-400'
              : item.estadoSalud === 'Degradado'
                ? 'text-amber-400'
                : 'text-emerald-400';
          const iconoSalud =
            item.estadoSalud === 'Crítico'
              ? 'fa-circle-exclamation'
              : item.estadoSalud === 'Degradado'
                ? 'fa-triangle-exclamation'
                : 'fa-circle-check';

          return (
            <article
              key={item.ci}
              className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-[#111827] p-5 space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-blue-400">
                    {item.ci}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${colorSalud}`}
                  >
                    <i
                      className={`fa-solid ${iconoSalud} text-[11px]`}
                      aria-hidden="true"
                    />
                    <span>{item.estadoSalud}</span>
                  </span>
                </div>

                <div className="space-y-0.5 text-xs">
                  <p className="font-medium text-slate-200">
                    {item.metadata?.servicioNegocio ?? item.categoria}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {item.metadata
                      ? `${item.metadata.tipo} · ${item.metadata.propietario}`
                      : item.categoria}
                  </p>
                </div>

                {/* Topology Dependencies */}
                {item.metadata && (
                  <div className="rounded-lg border border-slate-800/80 bg-[#0B0F17] p-2.5 text-[11px] space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 shrink-0">Depende de:</span>
                      <span className="font-mono text-right text-slate-300">
                        {item.metadata.dependeDe.length > 0
                          ? item.metadata.dependeDe.join(', ')
                          : 'Infraestructura base'}
                      </span>
                    </div>
                    {item.dependientes.length > 0 && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-500 shrink-0">Impacta a:</span>
                        <span className="font-mono text-right text-amber-300">
                          {item.dependientes.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 border-y border-slate-800/70 py-2.5 text-xs">
                  <div>
                    <span className="block text-[11px] text-slate-400">
                      Incidencias
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-slate-100">
                      {item.ticketsAbiertos.length} ab. / {item.ticketsTotales}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">
                      Problemas
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-amber-300">
                      {item.problemasActivos.length} activos
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">
                      RFCs
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-blue-300">
                      {item.rfcsAsociados.length} reg.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                {item.ticketsAbiertos[0] ? (
                  <button
                    type="button"
                    onClick={() =>
                      onSeleccionarTicket(item.ticketsAbiertos[0].id)
                    }
                    className="font-mono font-medium text-blue-400 hover:text-blue-300"
                  >
                    Ver {item.ticketsAbiertos[0].id} →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onCrearTicketEnCi({
                        ciAfectado: item.ci,
                        categoria: item.categoria.includes('PostgreSQL')
                          ? 'Base de Datos'
                          : item.categoria.includes('Identity') ||
                              item.categoria.includes('Domain')
                            ? 'IAM / Identidad'
                            : item.categoria.includes('Firewall') ||
                                item.categoria.includes('Switch')
                              ? 'Redes & Conectividad'
                              : 'Infraestructura Cloud',
                        titulo: `Degradación detectada en ${item.ci}`,
                      })
                    }
                    className="font-medium text-slate-300 hover:text-blue-400 transition-colors"
                  >
                    + Reportar fallo en CI
                  </button>
                )}

                <div className="flex items-center gap-3">
                  {item.problemasActivos.length > 0 && (
                    <button
                      type="button"
                      onClick={onIrAProblemas}
                      className="font-medium text-amber-300 hover:text-amber-200"
                    >
                      Problemas
                    </button>
                  )}
                  {item.rfcsAsociados.length > 0 && (
                    <button
                      type="button"
                      onClick={onIrACambios}
                      className="font-medium text-blue-300 hover:text-blue-200"
                    >
                      Cambios
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
