import React, { useEffect, useState } from 'react';
import { ESCENARIOS_SIMULACION } from '../data/scenarios';
import { EscenarioSimulacion } from '../types/itsm';
import { PrioridadIndicador } from './ItsmStatusHelpers';

interface ScenarioModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onIniciarEscenario: (
    escenario: EscenarioSimulacion,
    limpiarColaPrevia: boolean
  ) => void;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  abierto,
  onCerrar,
  onIniciarEscenario,
}) => {
  const [seleccionadoId, setSeleccionadoId] = useState<string>(
    ESCENARIOS_SIMULACION[0].id
  );
  const [limpiarColaPrevia, setLimpiarColaPrevia] = useState<boolean>(false);

  useEffect(() => {
    if (!abierto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const escenarioActivo =
    ESCENARIOS_SIMULACION.find((e) => e.id === seleccionadoId) ??
    ESCENARIOS_SIMULACION[0];

  const handleLanzar = () => {
    onIniciarEscenario(escenarioActivo, limpiarColaPrevia);
    onCerrar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-escenario-titulo"
      onClick={onCerrar}
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-800 bg-[#111827] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-4">
          <div>
            <h2
              id="modal-escenario-titulo"
              className="font-display text-base font-semibold text-slate-100"
            >
              Cargar Escenario de Simulación en Tiempo Real
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Selecciona un caso práctico de clase: las llamadas y alertas irán entrando progresivamente en la cola
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Cerrar selector de escenarios"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            role="radiogroup"
            aria-label="Escenarios predefinidos de ciberseguridad y sistemas"
          >
            {ESCENARIOS_SIMULACION.map((esc) => {
              const activo = esc.id === seleccionadoId;
              return (
                <button
                  key={esc.id}
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  onClick={() => setSeleccionadoId(esc.id)}
                  className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    activo
                      ? 'border-blue-500 bg-blue-950/25'
                      : 'border-slate-800 bg-[#0B0F17] hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-mono text-slate-400">
                        {esc.categoriaPrincipal}
                      </span>
                      <PrioridadIndicador prioridad={esc.severidadEsperada} />
                    </div>
                    <h3 className="font-display text-sm font-semibold text-slate-100">
                      {esc.titulo}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-400">
                      {esc.subtitulo}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 font-mono text-[11px] text-slate-300 tabular-nums">
                    <span>{esc.tickets.length} llamadas / alertas</span>
                    <span>~{esc.duracionTotalSeg}s despliegue</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Scenario Briefing */}
          <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
              <i className="fa-solid fa-graduation-cap" aria-hidden="true" />
              <span>Objetivo didáctico del escenario</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              {escenarioActivo.objetivoDidactico}
            </p>
          </div>

          {/* Queue Mode Option */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 bg-[#0B0F17] p-3.5 text-xs text-slate-300 hover:border-slate-700">
            <input
              type="checkbox"
              checked={limpiarColaPrevia}
              onChange={(e) => setLimpiarColaPrevia(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <strong className="block text-slate-100">
                Vaciar cola actual antes de iniciar el escenario
              </strong>
              <span className="text-slate-400">
                Recomendado al iniciar una práctica evaluable en clase para trabajar únicamente sobre este caso.
              </span>
            </span>
          </label>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleLanzar}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <i className="fa-solid fa-play text-[11px]" aria-hidden="true" />
              <span>
                Iniciar Escenario ({escenarioActivo.tickets.length} eventos en vivo)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
