import React, { useEffect, useState } from 'react';
import { evaluarEstadoRca, normalizarIshikawa } from '../data/serviceDeskStore';
import { IshikawaDiagrama, Problema } from '../types/itsm';

interface RcaToolsPanelProps {
  problema: Problema;
  onGuardarRca: (
    problemaId: string,
    payload: {
      analisis5Porques: string[];
      causaRaiz: string;
      workaround: string;
      ishikawa: IshikawaDiagrama;
    }
  ) => void;
}

export const RcaToolsPanel: React.FC<RcaToolsPanelProps> = ({
  problema,
  onGuardarRca,
}) => {
  const [porques, setPorques] = useState<string[]>([
    problema.analisis5Porques[0] ?? '',
    problema.analisis5Porques[1] ?? '',
    problema.analisis5Porques[2] ?? '',
    problema.analisis5Porques[3] ?? '',
    problema.analisis5Porques[4] ?? '',
  ]);
  const [causaRaiz, setCausaRaiz] = useState(problema.causaRaiz ?? '');
  const [workaround, setWorkaround] = useState(problema.workaround ?? '');
  const [ishikawa, setIshikawa] = useState<IshikawaDiagrama>(() =>
    normalizarIshikawa(problema.ishikawa)
  );
  const [nuevoFactor, setNuevoFactor] = useState<
    Record<keyof IshikawaDiagrama, string>
  >({
    maquina: '',
    metodo: '',
    material: '',
    manoDeObra: '',
  });
  const [guardadoOk, setGuardadoOk] = useState(false);

  // Sync local state when switching between problems
  useEffect(() => {
    setPorques([
      problema.analisis5Porques[0] ?? '',
      problema.analisis5Porques[1] ?? '',
      problema.analisis5Porques[2] ?? '',
      problema.analisis5Porques[3] ?? '',
      problema.analisis5Porques[4] ?? '',
    ]);
    setCausaRaiz(problema.causaRaiz ?? '');
    setWorkaround(problema.workaround ?? '');
    setIshikawa(normalizarIshikawa(problema.ishikawa));
    setGuardadoOk(false);
  }, [problema.id]);

  // Calculate how many cascading "Why" steps are unlocked
  let pasosVisibles = 1;
  for (let i = 0; i < 4; i++) {
    if (porques[i].trim().length >= 3) {
      pasosVisibles = i + 2;
    } else {
      break;
    }
  }
  // Ensure any previously filled later steps remain visible
  for (let i = 4; i >= 0; i--) {
    if (porques[i].trim().length > 0) {
      pasosVisibles = Math.max(pasosVisibles, i + 1);
      break;
    }
  }

  const estadoRca = evaluarEstadoRca({
    ...problema,
    analisis5Porques: porques,
    causaRaiz,
    workaround,
    ishikawa,
  });

  const persistirCambios = (
    nextPorques: string[],
    nextCausaRaiz: string,
    nextWorkaround: string,
    nextIshikawa: IshikawaDiagrama
  ) => {
    onGuardarRca(problema.id, {
      analisis5Porques: nextPorques,
      causaRaiz: nextCausaRaiz,
      workaround: nextWorkaround,
      ishikawa: nextIshikawa,
    });
    setGuardadoOk(true);
    window.setTimeout(() => setGuardadoOk(false), 2200);
  };

  const handleAgregarFactor = (rama: keyof IshikawaDiagrama) => {
    const val = nuevoFactor[rama].trim();
    if (!val) return;
    const nextIshikawa: IshikawaDiagrama = {
      ...ishikawa,
      [rama]: [...ishikawa[rama], val],
    };
    setIshikawa(nextIshikawa);
    setNuevoFactor((prev) => ({ ...prev, [rama]: '' }));
    persistirCambios(porques, causaRaiz, workaround, nextIshikawa);
  };

  const handleEliminarFactor = (rama: keyof IshikawaDiagrama, idx: number) => {
    const nextIshikawa: IshikawaDiagrama = {
      ...ishikawa,
      [rama]: ishikawa[rama].filter((_, i) => i !== idx),
    };
    setIshikawa(nextIshikawa);
    persistirCambios(porques, causaRaiz, workaround, nextIshikawa);
  };

  const handleGuardarFormulario = (e: React.FormEvent) => {
    e.preventDefault();
    persistirCambios(porques, causaRaiz, workaround, ishikawa);
  };

  const renderRamaIshikawa = (
    rama: keyof IshikawaDiagrama,
    titulo: string,
    subtitulo: string,
    icon: string,
    posicion: 'arriba' | 'abajo'
  ) => (
    <div className="flex flex-col">
      {posicion === 'abajo' && (
        <div className="hidden lg:flex justify-center">
          <div className="h-5 w-0.5 bg-slate-700" aria-hidden="true" />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between rounded-lg border border-slate-800 bg-[#0B0F17] p-3.5 space-y-2.5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
              <i className={`${icon} text-blue-400`} aria-hidden="true" />
              <span>{titulo}</span>
            </div>
            <span className="font-mono text-[10px] tabular-nums text-slate-400">
              {ishikawa[rama].length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">{subtitulo}</p>

          {ishikawa[rama].length === 0 ? (
            <p className="text-[11px] italic text-slate-500">
              Sin causas añadidas en {titulo}.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {ishikawa[rama].map((factor, idx) => (
                <li
                  key={idx}
                  className="flex items-start justify-between gap-2 rounded bg-[#111827] px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <span className="leading-snug">{factor}</span>
                  <button
                    type="button"
                    onClick={() => handleEliminarFactor(rama, idx)}
                    aria-label={`Eliminar causa ${factor}`}
                    className="mt-0.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-[10px]" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <input
            type="text"
            value={nuevoFactor[rama]}
            onChange={(e) =>
              setNuevoFactor((prev) => ({
                ...prev,
                [rama]: e.target.value,
              }))
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAgregarFactor(rama);
              }
            }}
            placeholder={`Añadir causa en ${titulo}...`}
            aria-label={`Añadir causa en ${titulo}`}
            className="min-w-0 flex-1 rounded-md border border-slate-800 bg-[#111827] px-2.5 py-1.5 text-[11px] text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleAgregarFactor(rama)}
            aria-label={`Agregar causa a ${titulo}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-200 hover:bg-blue-600 hover:border-blue-500 transition-colors"
          >
            <i className="fa-solid fa-plus text-[10px]" aria-hidden="true" />
          </button>
        </div>
      </div>

      {posicion === 'arriba' && (
        <div className="hidden lg:flex justify-center">
          <div className="h-5 w-0.5 bg-slate-700" aria-hidden="true" />
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleGuardarFormulario} className="space-y-5">
      {/* RCA Validation Gate Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#0B0F17] px-4 py-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span
            className={`inline-flex items-center gap-1.5 font-medium ${
              estadoRca.porquesOk ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <i
              className={`fa-solid ${
                estadoRca.porquesOk ? 'fa-circle-check' : 'fa-circle-dot'
              } text-[11px]`}
              aria-hidden="true"
            />
            <span>
              5 Porqués ({estadoRca.pasosPorques}/5 ·{' '}
              {estadoRca.tieneCausaRaiz ? 'Causa raíz lista' : 'Falta causa raíz'})
            </span>
          </span>

          <span className="text-slate-700" aria-hidden="true">
            |
          </span>

          <span
            className={`inline-flex items-center gap-1.5 font-medium ${
              estadoRca.ishikawaOk ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <i
              className={`fa-solid ${
                estadoRca.ishikawaOk ? 'fa-circle-check' : 'fa-circle-dot'
              } text-[11px]`}
              aria-hidden="true"
            />
            <span>Ishikawa 4M ({estadoRca.totalCausasIshikawa} causas)</span>
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 font-medium ${
            estadoRca.rcaValido ? 'text-emerald-400' : 'text-amber-300'
          }`}
        >
          <i
            className={`fa-solid ${
              estadoRca.rcaValido ? 'fa-shield-check' : 'fa-lock'
            } text-[11px]`}
            aria-hidden="true"
          />
          <span>
            {estadoRca.rcaValido
              ? 'Requisito RCA cumplido para cierre'
              : estadoRca.requiereRcaParaCerrar
                ? 'Obligatorio completar 1 herramienta RCA para cerrar'
                : 'RCA recomendado'}
          </span>
        </span>
      </div>

      {/* Tool 1: Cascading 5 Whys */}
      <section className="rounded-xl border border-slate-800/80 bg-[#0D131F] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-display text-sm font-semibold text-slate-100">
              1. Los 5 Porqués (Cascada Causal)
            </h4>
            <p className="mt-0.5 text-xs text-slate-400">
              Responde cada nivel para desbloquear dinámicamente el siguiente porqué hasta alcanzar la causa raíz
            </p>
          </div>
          <span className="font-mono text-xs text-blue-400 tabular-nums">
            Paso {Math.min(pasosVisibles, 5)} de 5
          </span>
        </div>

        <div className="space-y-3">
          {Array.from({ length: pasosVisibles }).map((_, idx) => {
            const preguntaContextual =
              idx === 0
                ? `¿Por qué ocurre: "${problema.titulo}"?`
                : `¿Por qué ocurre: "${porques[idx - 1].trim()}"?`;

            return (
              <div
                key={idx}
                className="relative flex items-start gap-3"
                style={{ paddingLeft: `${idx * 12}px` }}
              >
                <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-blue-500/40 bg-blue-950/40 font-mono text-[11px] font-semibold text-blue-300">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <label
                    htmlFor={`why-${problema.id}-${idx}`}
                    className="block text-xs font-medium text-slate-300"
                  >
                    {preguntaContextual}
                  </label>
                  <input
                    id={`why-${problema.id}-${idx}`}
                    type="text"
                    value={porques[idx]}
                    onChange={(e) => {
                      const copia = [...porques];
                      copia[idx] = e.target.value;
                      setPorques(copia);
                    }}
                    placeholder={`Respuesta técnica al porqué #${idx + 1} (mín. 3 caracteres para continuar)...`}
                    className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-slate-800/80 pt-4 md:grid-cols-2">
          <div>
            <label
              htmlFor={`causa-raiz-${problema.id}`}
              className="mb-1.5 block text-xs font-medium text-slate-200"
            >
              Causa Raíz Definitiva (Conclusión)
            </label>
            <textarea
              id={`causa-raiz-${problema.id}`}
              rows={2}
              value={causaRaiz}
              onChange={(e) => setCausaRaiz(e.target.value)}
              placeholder="Resume la causa raíz técnica u organizativa verificada..."
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor={`workaround-${problema.id}`}
              className="mb-1.5 block text-xs font-medium text-slate-200"
            >
              Solución Temporal (Workaround KEDB)
            </label>
            <textarea
              id={`workaround-${problema.id}`}
              rows={2}
              value={workaround}
              onChange={(e) => setWorkaround(e.target.value)}
              placeholder="Pasos de mitigación temporal para restaurar el servicio..."
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Tool 2: Simplified Interactive Fishbone / Ishikawa 4M Diagram (CSS Grid + Flexbox) */}
      <section className="rounded-xl border border-slate-800/80 bg-[#0D131F] p-5 space-y-4">
        <div>
          <h4 className="font-display text-sm font-semibold text-slate-100">
            2. Diagrama de Ishikawa — Espina de Pescado (4M)
          </h4>
          <p className="mt-0.5 text-xs text-slate-400">
            Añade causas raíz contribuyentes en Máquina, Método, Material y Mano de obra apuntando al problema central
          </p>
        </div>

        {/* Fishbone Layout: Top 2M -> Central Spine -> Head <- Bottom 2M */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="flex-1 space-y-2 lg:space-y-0">
            {/* Top 2 Bones */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {renderRamaIshikawa(
                'maquina',
                'Máquina',
                'Hardware, software, redes y servidores',
                'fa-solid fa-microchip',
                'arriba'
              )}
              {renderRamaIshikawa(
                'metodo',
                'Método',
                'Procesos, cambios RFC y procedimientos',
                'fa-solid fa-gears',
                'arriba'
              )}
            </div>

            {/* Central Horizontal Spine */}
            <div className="hidden lg:flex items-center">
              <div className="h-1 flex-1 rounded-l-full bg-gradient-to-r from-slate-700 via-blue-500/70 to-blue-500" />
              <i
                className="fa-solid fa-caret-right -ml-1 text-lg text-blue-400"
                aria-hidden="true"
              />
            </div>

            {/* Bottom 2 Bones */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {renderRamaIshikawa(
                'material',
                'Material',
                'Configuraciones, datos, scripts y parches',
                'fa-solid fa-cubes',
                'abajo'
              )}
              {renderRamaIshikawa(
                'manoDeObra',
                'Mano de obra / Personas',
                'Equipos, capacitación y validaciones humanas',
                'fa-solid fa-users',
                'abajo'
              )}
            </div>
          </div>

          {/* Fish Head (Central Problem Target) */}
          <div className="flex shrink-0 items-center lg:w-56">
            <div className="flex w-full flex-col justify-center rounded-xl border border-blue-500/40 bg-blue-950/25 p-4 text-left space-y-1.5">
              <span className="font-mono text-[11px] font-semibold text-blue-400">
                PROBLEMA CENTRAL
              </span>
              <span className="font-mono text-xs font-bold text-slate-100">
                {problema.id}
              </span>
              <p className="text-xs leading-snug text-slate-200">
                {problema.titulo}
              </p>
              <span className="font-mono text-[11px] text-slate-400">
                CI: {problema.ciAfectado}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Save Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <span className="text-xs text-emerald-400" role="status">
          {guardadoOk && (
            <>
              <i className="fa-solid fa-circle-check mr-1.5" aria-hidden="true" />
              Análisis RCA guardado en LocalStorage
            </>
          )}
        </span>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          Guardar Análisis RCA
        </button>
      </div>
    </form>
  );
};
