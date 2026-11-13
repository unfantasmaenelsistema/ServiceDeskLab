import React, { useEffect, useMemo, useState } from 'react';
import {
  buscarArticulosKbRelevantes,
  calcularPrioridadITIL,
} from '../data/serviceDeskStore';
import {
  ArticuloKb,
  CanalEntrada,
  ImpactoNivel,
  PrefillNuevoTicket,
  Ticket,
  TicketNivel,
  UrgenciaNivel,
} from '../types/itsm';

interface NewTicketModalProps {
  abierto: boolean;
  articulosKb: ArticuloKb[];
  prefill?: PrefillNuevoTicket | null;
  onCerrar: () => void;
  onCrearTicket: (
    nuevo: Omit<Ticket, 'id' | 'creadoEn' | 'notasTecnicas' | 'historyLog'>
  ) => void;
}

const CATEGORIAS = [
  'IAM / Identidad',
  'Base de Datos',
  'Redes & Conectividad',
  'Infraestructura Cloud',
  'Seguridad & Certificados',
  'Sistemas Linux',
  'Puesto de Trabajo',
];

const CANALES: { id: CanalEntrada; label: string; icon: string }[] = [
  { id: 'Portal de Usuario', label: 'Portal Web', icon: 'fa-solid fa-globe' },
  { id: 'Teléfono', label: 'Teléfono N1', icon: 'fa-solid fa-phone' },
  {
    id: 'Monitorización',
    label: 'Monitorización',
    icon: 'fa-solid fa-wave-square',
  },
  {
    id: 'Correo Corporativo',
    label: 'Correo',
    icon: 'fa-regular fa-envelope',
  },
];

const IMPACTOS: ImpactoNivel[] = ['Alto', 'Medio', 'Bajo'];
const URGENCIAS: UrgenciaNivel[] = ['Alta', 'Media', 'Baja'];

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  abierto,
  articulosKb,
  prefill = null,
  onCerrar,
  onCrearTicket,
}) => {
  const [canalEntrada, setCanalEntrada] =
    useState<CanalEntrada>('Portal de Usuario');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [ciAfectado, setCiAfectado] = useState('APP-ERP-PROD-01');
  const [solicitante, setSolicitante] = useState('Operaciones TI');
  const [impacto, setImpacto] = useState<ImpactoNivel>('Alto');
  const [urgencia, setUrgencia] = useState<UrgenciaNivel>('Alta');
  const [nivel, setNivel] = useState<TicketNivel>('N1');
  const [errorForm, setErrorForm] = useState('');

  useEffect(() => {
    if (!abierto) return;
    if (prefill) {
      if (prefill.titulo !== undefined) setTitulo(prefill.titulo);
      if (prefill.descripcion !== undefined) setDescripcion(prefill.descripcion);
      if (prefill.categoria) setCategoria(prefill.categoria);
      if (prefill.ciAfectado) setCiAfectado(prefill.ciAfectado);
      if (prefill.impacto) setImpacto(prefill.impacto);
      if (prefill.urgencia) setUrgencia(prefill.urgencia);
      setNivel('N1');
      setCanalEntrada('Portal de Usuario');
      setErrorForm('');
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [abierto, prefill, onCerrar]);

  const sugerenciasKb = useMemo(() => {
    const consulta = `${titulo} ${descripcion}`.trim();
    if (consulta.length < 2) return [];
    return buscarArticulosKbRelevantes(consulta, articulosKb, categoria).slice(
      0,
      4
    );
  }, [titulo, descripcion, articulosKb, categoria]);

  if (!abierto) return null;

  const { prioridad, slaObjetivoMin, slaObjetivoSeg } = calcularPrioridadITIL(
    impacto,
    urgencia
  );

  const formatearLimiteSla = (mins: number) => {
    if (mins >= 60) {
      const hrs = mins / 60;
      return `${hrs} ${hrs === 1 ? 'hora' : 'horas'} (${mins} min)`;
    }
    return `${mins} min`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titulo.trim().length < 5) {
      setErrorForm('Ingresa un resumen descriptivo de al menos 5 caracteres.');
      return;
    }

    onCrearTicket({
      titulo: titulo.trim(),
      descripcion:
        descripcion.trim() ||
        `Incidente recibido por ${canalEntrada} para diagnóstico y atención dentro del SLA.`,
      canalEntrada,
      estado: nivel === 'N2' ? 'Escalado (N2)' : 'Nuevo',
      nivel,
      prioridad,
      impacto,
      urgencia,
      categoria,
      ciAfectado: ciAfectado.trim() || 'CI-GEN-01',
      solicitante: solicitante.trim() || 'Usuario Corporativo',
      asignadoA: nivel === 'N2' ? 'Especialista Guardia N2' : 'Mesa N1',
      slaObjetivoMin,
      slaTranscurridoMin: 0,
      slaObjetivoSeg,
      slaTranscurridoSeg: 0,
      slaPausado: false,
      slaIncumplido: false,
      problemaVinculadoId: null,
    });

    setTitulo('');
    setDescripcion('');
    setErrorForm('');
    onCerrar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-nuevo-ticket-titulo"
    >
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-slate-800 bg-[#111827] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2
              id="modal-nuevo-ticket-titulo"
              className="font-display text-base font-semibold text-slate-100"
            >
              Registrar Nuevo Ticket ITIL v4
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Simula el ingreso por portal o teléfono con cálculo automático de matriz SLA y búsqueda KEDB en vivo
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label="Cerrar ventana"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-800 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          <form onSubmit={handleSubmit} className="space-y-4 p-6 lg:col-span-8">
          {/* Canal de Entrada */}
          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-300">
              Canal de Entrada
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CANALES.map((c) => {
                const activo = canalEntrada === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCanalEntrada(c.id)}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                      activo
                        ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                        : 'border-slate-700 bg-[#0B0F17] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <i className={`${c.icon} text-[11px]`} aria-hidden="true" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="ticket-titulo"
              className="mb-1.5 block text-xs font-medium text-slate-300"
            >
              Resumen del incidente
            </label>
            <input
              id="ticket-titulo"
              type="text"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (errorForm) setErrorForm('');
              }}
              placeholder="Ej. Error 503 en pasarela de pagos tras actualización de balanceador"
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="ticket-desc"
              className="mb-1.5 block text-xs font-medium text-slate-300"
            >
              Descripción y síntomas iniciales
            </label>
            <textarea
              id="ticket-desc"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe usuarios afectados, mensajes de error o pruebas preliminares..."
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="ticket-impacto"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Impacto
              </label>
              <select
                id="ticket-impacto"
                value={impacto}
                onChange={(e) => setImpacto(e.target.value as ImpactoNivel)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="Alto">Alto (Organización)</option>
                <option value="Medio">Medio (Departamento)</option>
                <option value="Bajo">Bajo (Usuario individual)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="ticket-urgencia"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Urgencia
              </label>
              <select
                id="ticket-urgencia"
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value as UrgenciaNivel)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="Alta">Alta (Servicio detenido)</option>
                <option value="Media">Media (Degradado)</option>
                <option value="Baja">Baja (Con alternativa)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="ticket-nivel"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Asignación Inicial
              </label>
              <select
                id="ticket-nivel"
                value={nivel}
                onChange={(e) => setNivel(e.target.value as TicketNivel)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="N1">Nivel 1 (Service Desk)</option>
                <option value="N2">Nivel 2 (Especialista)</option>
              </select>
            </div>
          </div>

          {/* Interactive Visual ITIL Priority Matrix */}
          <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-slate-300">
                Matriz de Prioridad ITIL (Impacto × Urgencia)
              </span>
              <div className="flex items-center gap-2 font-mono tabular-nums">
                <span className="font-semibold text-slate-100">{prioridad}</span>
                <span className="text-slate-600" aria-hidden="true">
                  ·
                </span>
                <span className="text-blue-400">
                  SLA: {formatearLimiteSla(slaObjetivoMin)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-center font-mono text-[11px]">
                <thead>
                  <tr className="text-slate-400">
                    <th className="py-1.5 pr-2 text-left font-sans font-medium">
                      Imp. \ Urg.
                    </th>
                    {URGENCIAS.map((u) => (
                      <th key={u} className="px-2 py-1.5 font-medium">
                        {u}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {IMPACTOS.map((imp) => (
                    <tr key={imp} className="border-t border-slate-800/80">
                      <td className="py-1.5 pr-2 text-left font-sans font-medium text-slate-400">
                        {imp}
                      </td>
                      {URGENCIAS.map((urg) => {
                        const celda = calcularPrioridadITIL(imp, urg);
                        const seleccionada =
                          imp === impacto && urg === urgencia;
                        return (
                          <td key={urg} className="p-1">
                            <button
                              type="button"
                              onClick={() => {
                                setImpacto(imp);
                                setUrgencia(urg);
                              }}
                              className={`w-full rounded px-2 py-1 transition-colors ${
                                seleccionada
                                  ? 'bg-blue-600 font-semibold text-white'
                                  : 'bg-slate-900/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {celda.prioridad.split(' - ')[0]} ({celda.slaObjetivoMin}m)
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="ticket-categoria"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Categoría
              </label>
              <select
                id="ticket-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="ticket-ci"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                CI Afectado (CMDB)
              </label>
              <input
                id="ticket-ci"
                type="text"
                value={ciAfectado}
                onChange={(e) => setCiAfectado(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 font-mono text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="ticket-solicitante"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Solicitante
              </label>
              <input
                id="ticket-solicitante"
                type="text"
                value={solicitante}
                onChange={(e) => setSolicitante(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {errorForm && (
            <p className="text-xs text-red-400" role="alert">
              <i
                className="fa-solid fa-circle-exclamation mr-1.5"
                aria-hidden="true"
              />
              {errorForm}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Crear Ticket en Cola
            </button>
          </div>
        </form>

          {/* Real-Time KEDB Suggestion Side Panel */}
          <aside
            aria-label="Sugerencias de la Base de Conocimiento KEDB en tiempo real"
            className="flex flex-col justify-between bg-[#0B0F17]/70 p-5 lg:col-span-4 space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-xs font-semibold text-blue-300">
                  <i className="fa-solid fa-book-open mr-1.5" aria-hidden="true" />
                  Sugerencias KEDB en vivo
                </h3>
                <span className="font-mono text-[11px] text-slate-400">
                  {sugerenciasKb.length} coincidencia(s)
                </span>
              </div>

              {titulo.trim().length < 2 ? (
                <div className="rounded-lg border border-slate-800 bg-[#111827] p-3.5 text-xs text-slate-400 space-y-1.5">
                  <p className="font-medium text-slate-200">
                    Búsqueda automática por palabras clave
                  </p>
                  <p className="leading-relaxed">
                    Al escribir el resumen (ej. <span className="font-mono text-slate-300">vpn</span>, <span className="font-mono text-slate-300">token</span>, <span className="font-mono text-slate-300">ad</span>, <span className="font-mono text-slate-300">bloqueo</span>, <span className="font-mono text-slate-300">windows</span>), aparecerán aquí artículos KEDB para lograr <strong>FCR</strong> en N1 (&lt; 3 min).
                  </p>
                </div>
              ) : sugerenciasKb.length === 0 ? (
                <div className="rounded-lg border border-slate-800 bg-[#111827] p-3.5 text-xs text-slate-400">
                  No hay artículos KEDB que coincidan con las palabras clave actuales. Si es un caso nuevo, regístralo para triaje.
                </div>
              ) : (
                <div className="space-y-2.5" aria-live="polite">
                  {sugerenciasKb.map(({ articulo, coincidencias }) => (
                    <article
                      key={articulo.id}
                      className="rounded-lg border border-blue-500/30 bg-[#111827] p-3 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-semibold text-blue-400">
                          {articulo.id}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {articulo.categoria}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-100 leading-snug">
                        {articulo.titulo}
                      </h4>
                      <p className="text-[11px] leading-relaxed text-slate-300">
                        {articulo.procedimiento}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-2">
                        <span className="font-mono text-[10px] text-emerald-400 truncate">
                          Match: {coincidencias.join(', ')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCategoria(articulo.categoria);
                            setNivel('N1');
                          }}
                          className="text-[11px] font-medium text-blue-400 hover:text-blue-300 whitespace-nowrap"
                        >
                          Aplicar cat. N1
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <p className="border-t border-slate-800 pt-3 text-[11px] leading-relaxed text-slate-400">
              Consejo ITIL v4: Crea el ticket en <strong>Nivel 1</strong> y usa{' '}
              <strong className="text-slate-200">"Resolver usando KB"</strong> en menos de 3 min simulados para sumar <strong>FCR cumplido</strong>.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};
