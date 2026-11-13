import React, { useEffect, useState } from 'react';
import { evaluarEstadoRca } from '../data/serviceDeskStore';
import { ServiceDeskGlobalState } from '../types/itsm';

interface ItilGuideModalProps {
  abierto: boolean;
  estado: ServiceDeskGlobalState;
  onCerrar: () => void;
}

export const ItilGuideModal: React.FC<ItilGuideModalProps> = ({
  abierto,
  estado,
  onCerrar,
}) => {
  const [tab, setTab] = useState<'checklist' | 'teoria'>('checklist');

  useEffect(() => {
    if (!abierto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const hitos = [
    {
      id: 'clasificar',
      titulo: 'Clasificar incidencia con Matriz Impacto × Urgencia',
      detalle: 'Crea un ticket nuevo evaluando correctamente su prioridad y SLA.',
      completado: estado.evaluacion.clasificacionesCorrectas > 0,
      practica: 'Gestión de Incidentes',
    },
    {
      id: 'fcr',
      titulo: 'Resolver en Nivel 1 con KEDB en < 3 min (FCR)',
      detalle:
        'Aplica un artículo coincidente de la Base de Conocimiento antes de 180s.',
      completado: estado.metricas.fcrCumplidos > 0,
      practica: 'Service Desk & KEDB',
    },
    {
      id: 'escalado',
      titulo: 'Escalar incidencia compleja a Nivel 2 (OLA)',
      detalle: 'Transfiere un ticket de N1 a un equipo especialista N2.',
      completado: estado.tickets.some((t) => t.nivel === 'N2'),
      practica: 'Escalamiento Funcional',
    },
    {
      id: 'problema',
      titulo: 'Declarar Problema Maestro o vincular incidencias recurrentes',
      detalle:
        'Agrupa múltiples tickets con síntomas comunes en un registro PRB.',
      completado: estado.tickets.some((t) => Boolean(t.problemaVinculadoId)),
      practica: 'Gestión de Problemas',
    },
    {
      id: 'rca',
      titulo: 'Completar Análisis de Causa Raíz (5 Porqués o Ishikawa 4M)',
      detalle:
        'Documenta la causa raíz antes de intentar cerrar un Problema P1/P2.',
      completado: estado.problemas.some((p) => evaluarEstadoRca(p).rcaValido),
      practica: 'Diagnóstico RCA',
    },
    {
      id: 'cab',
      titulo: 'Aprobar e implementar un RFC ante el comité CAB',
      detalle:
        'Define Plan de Implementación y Rollback para autorizar cambios en CMDB.',
      completado: estado.rfcs.some(
        (r) => r.estado === 'Aprobado' || r.estado === 'Implementado'
      ),
      practica: 'Change Enablement',
    },
    {
      id: 'kb-pub',
      titulo: 'Retroalimentar la KEDB desde un Problema N2 cerrado',
      detalle:
        'Publica automáticamente un artículo tras resolver un Problema con RCA válido.',
      completado: estado.articulosKb.some((a) => a.origen === 'Problema N2'),
      practica: 'Mejora Continua',
    },
    {
      id: 'csat',
      titulo: 'Registrar encuesta de satisfacción (CSAT) en Portal de Usuario',
      detalle:
        'Valora un ticket resuelto desde el rol Portal de Usuario.',
      completado: estado.metricas.csatTotalRespuestas > 0,
      practica: 'Experiencia de Usuario',
    },
  ];

  const completados = hitos.filter((h) => h.completado).length;
  const pct = Math.round((completados / hitos.length) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-guia-itil-titulo"
      onClick={onCerrar}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-800 bg-[#111827] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2
              id="modal-guia-itil-titulo"
              className="font-display text-base font-semibold text-slate-100"
            >
              <i
                className="fa-solid fa-graduation-cap mr-2 text-blue-400"
                aria-hidden="true"
              />
              Guía Práctica ITIL v4 &amp; Rúbrica del Laboratorio
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Referencia metodológica y progreso evaluado en tiempo real sobre tu sesión actual
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Cerrar guía ITIL v4"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3 bg-[#0D131F]/60">
          <div className="flex items-center gap-1 rounded-lg bg-[#0B0F17] p-1">
            <button
              type="button"
              onClick={() => setTab('checklist')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === 'checklist'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Rúbrica de Objetivos ({completados}/{hitos.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('teoria')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === 'teoria'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Conceptos Clave ITIL v4
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Progreso de sesión:</span>
            <span className="font-mono font-semibold text-blue-400">{pct}%</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {tab === 'checklist' ? (
            <>
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Completa los 8 hitos operativos alternando entre los roles{' '}
                  <strong className="text-slate-200">Portal de Usuario</strong>,{' '}
                  <strong className="text-slate-200">Técnico N1</strong>,{' '}
                  <strong className="text-slate-200">Especialista N2/N3</strong> y{' '}
                  <strong className="text-slate-200">SDM</strong>.
                </p>
              </div>

              <ul className="space-y-2.5">
                {hitos.map((h) => (
                  <li
                    key={h.id}
                    className={`flex items-start justify-between gap-3 rounded-lg border p-3.5 text-xs ${
                      h.completado
                        ? 'border-emerald-500/35 bg-emerald-950/15'
                        : 'border-slate-800 bg-[#0B0F17]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          h.completado
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        <i
                          className={`fa-solid ${
                            h.completado ? 'fa-check' : 'fa-circle-dot'
                          } text-[10px]`}
                          aria-hidden="true"
                        />
                      </span>
                      <div>
                        <p
                          className={`font-semibold ${
                            h.completado ? 'text-emerald-200' : 'text-slate-100'
                          }`}
                        >
                          {h.titulo}
                        </p>
                        <p className="mt-0.5 text-slate-400">{h.detalle}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                      {h.practica}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-xs">
              <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4 space-y-2">
                <h3 className="font-display text-sm font-semibold text-blue-300">
                  Incidente vs. Problema
                </h3>
                <p className="leading-relaxed text-slate-300">
                  Un <strong>Incidente</strong> busca restaurar el servicio normal lo antes posible (priorizando el SLA y aplicando un <em>Workaround</em> si hace falta). Un <strong>Problema</strong> investiga la <em>causa raíz</em> subyacente de uno o varios incidentes recurrentes mediante 5 Porqués o Ishikawa 4M.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4 space-y-2">
                <h3 className="font-display text-sm font-semibold text-amber-300">
                  Change Enablement (RFC &amp; CAB)
                </h3>
                <p className="leading-relaxed text-slate-300">
                  Cualquier cambio en producción sobre un CI crítico (CMDB) exige un <strong>RFC</strong> con Plan de Implementación y <strong>Plan de Rollback</strong>. Los cambios <em>Normales</em> requieren aprobación del Comité CAB antes de ejecutarse.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4 space-y-2">
                <h3 className="font-display text-sm font-semibold text-emerald-300">
                  SLA, OLA, FCR y MTTR
                </h3>
                <p className="leading-relaxed text-slate-300">
                  <strong>FCR (First Contact Resolution)</strong> mide incidencias resueltas en N1 en &lt; 3 min con KEDB. <strong>MTTR</strong> calcula el tiempo medio hasta el cierre. Al escalar a N2, se aplica política <strong>OLA</strong> (pausar o reiniciar SLA).
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4 space-y-2">
                <h3 className="font-display text-sm font-semibold text-slate-100">
                  Matriz Impacto × Urgencia y Trazabilidad
                </h3>
                <p className="leading-relaxed text-slate-300">
                  Alto×Alta = <strong>P1 Crítica (15m)</strong>; Alto×Media o Medio×Alta = <strong>P2 Alta (30m)</strong>; Medio×Media = <strong>P3 Media (60m)</strong>; Bajo×Baja = <strong>P4 Baja (120m)</strong>. Cada acción queda sellada en un <em>historyLog</em> inmutable para auditoría SDM.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
