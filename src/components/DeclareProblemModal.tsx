import React, { useEffect, useState } from 'react';
import { Ticket, TicketPrioridad } from '../types/itsm';
import { PrioridadIndicador } from './ItsmStatusHelpers';

interface DeclareProblemModalProps {
  abierto: boolean;
  tickets: Ticket[];
  idsIniciales: string[];
  onCerrar: () => void;
  onDeclararProblema: (payload: {
    titulo: string;
    descripcion: string;
    categoria: string;
    ciAfectado: string;
    prioridad: TicketPrioridad;
    workaround: string;
    ticketsIds: string[];
  }) => void;
}

export const DeclareProblemModal: React.FC<DeclareProblemModalProps> = ({
  abierto,
  tickets,
  idsIniciales,
  onCerrar,
  onDeclararProblema,
}) => {
  const [seleccionados, setSeleccionados] = useState<string[]>(idsIniciales);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Redes & Conectividad');
  const [ciAfectado, setCiAfectado] = useState('FW-PALO-MAD-01');
  const [prioridad, setPrioridad] = useState<TicketPrioridad>('P2 - Alta');
  const [workaround, setWorkaround] = useState('');
  const [errorForm, setErrorForm] = useState('');

  useEffect(() => {
    if (!abierto) return;
    setSeleccionados(idsIniciales);
    const primerTicket =
      tickets.find((t) => idsIniciales.includes(t.id)) ??
      tickets.find((t) => t.estado !== 'Resuelto');
    if (primerTicket) {
      setTitulo(
        idsIniciales.length > 1
          ? `Incidente recurrente (${idsIniciales.length} reportes): ${primerTicket.titulo}`
          : `Problema raíz asociado a: ${primerTicket.titulo}`
      );
      setCategoria(primerTicket.categoria);
      setCiAfectado(primerTicket.ciAfectado);
      setPrioridad(primerTicket.prioridad);
      setDescripcion(
        `Agrupación de incidencias con sintomatología común sobre ${primerTicket.ciAfectado} (${primerTicket.categoria}).`
      );
    }
    setWorkaround('');
    setErrorForm('');
  }, [abierto, idsIniciales, tickets]);

  useEffect(() => {
    if (!abierto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const ticketsAbiertos = tickets.filter((t) => t.estado !== 'Resuelto');

  const toggleTicket = (id: string) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (errorForm) setErrorForm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (seleccionados.length === 0) {
      setErrorForm('Selecciona al menos un incidente para vincular al Problema.');
      return;
    }
    if (titulo.trim().length < 5) {
      setErrorForm('Ingresa un título descriptivo para el Problema maestro.');
      return;
    }

    onDeclararProblema({
      titulo: titulo.trim(),
      descripcion:
        descripcion.trim() ||
        'Problema maestro declarado desde la cola de incidentes por sintomatología coincidente.',
      categoria,
      ciAfectado: ciAfectado.trim() || 'CI-COMUN-01',
      prioridad,
      workaround: workaround.trim(),
      ticketsIds: seleccionados,
    });
    onCerrar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-declarar-problema-titulo"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-800 bg-[#111827] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2
              id="modal-declarar-problema-titulo"
              className="font-display text-base font-semibold text-slate-100"
            >
              Declarar Problema Maestro (Problem Management)
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Agrupa múltiples incidencias con síntomas comunes bajo un único registro de Problema
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label="Cerrar modal"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label
              htmlFor="dp-titulo"
              className="mb-1.5 block text-xs font-medium text-slate-300"
            >
              Título del Problema Maestro
            </label>
            <input
              id="dp-titulo"
              type="text"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (errorForm) setErrorForm('');
              }}
              placeholder="Ej. Fallo generalizado de túneles VPN en delegación Madrid"
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="dp-cat"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Categoría
              </label>
              <input
                id="dp-cat"
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="dp-ci"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                CI Principal (CMDB)
              </label>
              <input
                id="dp-ci"
                type="text"
                value={ciAfectado}
                onChange={(e) => setCiAfectado(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 font-mono text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="dp-prio"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Prioridad
              </label>
              <select
                id="dp-prio"
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
              htmlFor="dp-desc"
              className="mb-1.5 block text-xs font-medium text-slate-300"
            >
              Descripción de la sintomatología común
            </label>
            <textarea
              id="dp-desc"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="dp-wa"
              className="mb-1.5 block text-xs font-medium text-slate-300"
            >
              Solución Temporal / Workaround inicial (opcional)
            </label>
            <input
              id="dp-wa"
              type="text"
              value={workaround}
              onChange={(e) => setWorkaround(e.target.value)}
              placeholder="Si ya existe una mitigación temporal, documéntala aquí para el KEDB..."
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Child Tickets Multi-Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">
                Incidencias hijas a vincular ({seleccionados.length}{' '}
                seleccionada{seleccionados.length === 1 ? '' : 's'})
              </span>
              <span className="text-[11px] text-slate-400">
                Marca todos los tickets con síntomas relacionados
              </span>
            </div>

            <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-slate-800 bg-[#0B0F17] p-2.5">
              {ticketsAbiertos.length === 0 ? (
                <p className="p-2 text-xs text-slate-500">
                  No hay incidentes abiertos disponibles para vincular.
                </p>
              ) : (
                ticketsAbiertos.map((t) => {
                  const marcado = seleccionados.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-xs transition-colors ${
                        marcado
                          ? 'border-blue-500/50 bg-blue-950/25'
                          : 'border-slate-800/80 bg-[#111827]/60 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() => toggleTicket(t.id)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono font-semibold text-blue-400">
                            {t.id} · {t.ciAfectado}
                          </span>
                          <PrioridadIndicador prioridad={t.prioridad} />
                        </div>
                        <p className="mt-0.5 truncate text-slate-200">
                          {t.titulo}
                        </p>
                        {t.problemaVinculadoId && (
                          <p className="mt-0.5 font-mono text-[10px] text-amber-300">
                            Actualmente vinculado a {t.problemaVinculadoId} (se reasignará)
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })
              )}
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
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
            >
              <i
                className="fa-solid fa-triangle-exclamation text-[11px]"
                aria-hidden="true"
              />
              <span>Crear Problema y Vincular ({seleccionados.length})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
