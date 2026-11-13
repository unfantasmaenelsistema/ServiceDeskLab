import React, { useEffect, useState } from 'react';
import { InformeCierre, Problema, Ticket } from '../types/itsm';
import { PrioridadIndicador } from './ItsmStatusHelpers';

interface ClosureReportModalProps {
  ticket: Ticket | null;
  problemaVinculado: Problema | null;
  onCerrar: () => void;
  onConfirmarCierre: (ticketId: string, informe: InformeCierre) => void;
}

export const ClosureReportModal: React.FC<ClosureReportModalProps> = ({
  ticket,
  problemaVinculado,
  onCerrar,
  onConfirmarCierre,
}) => {
  const [workaround, setWorkaround] = useState('');
  const [solucionDefinitiva, setSolucionDefinitiva] = useState('');
  const [causaRaiz, setCausaRaiz] = useState('');
  const [errorForm, setErrorForm] = useState('');

  useEffect(() => {
    if (!ticket) return;
    setWorkaround(
      ticket.informeCierre?.workaround ||
        problemaVinculado?.workaround ||
        ''
    );
    setSolucionDefinitiva(ticket.informeCierre?.solucionDefinitiva || '');
    setCausaRaiz(
      ticket.informeCierre?.causaRaizDocumentada ||
        problemaVinculado?.causaRaiz ||
        ''
    );
    setErrorForm('');
  }, [ticket, problemaVinculado]);

  useEffect(() => {
    if (!ticket) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ticket, onCerrar]);

  if (!ticket) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (workaround.trim().length < 5) {
      setErrorForm(
        'El campo Workaround (Solución Temporal) es obligatorio (mín. 5 caracteres).'
      );
      return;
    }
    if (solucionDefinitiva.trim().length < 5) {
      setErrorForm(
        'El campo Solución Definitiva es obligatorio para cerrar una incidencia mayor (mín. 5 caracteres).'
      );
      return;
    }

    onConfirmarCierre(ticket.id, {
      workaround: workaround.trim(),
      solucionDefinitiva: solucionDefinitiva.trim(),
      causaRaizDocumentada: causaRaiz.trim() || undefined,
      fechaCierre: new Date().toISOString(),
    });
    onCerrar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-informe-cierre-titulo"
    >
      <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-[#111827] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-semibold text-blue-400">
                {ticket.id}
              </span>
              <span className="text-slate-600" aria-hidden="true">
                ·
              </span>
              <PrioridadIndicador prioridad={ticket.prioridad} />
            </div>
            <h2
              id="modal-informe-cierre-titulo"
              className="font-display text-base font-semibold text-slate-100"
            >
              Informe de Cierre Obligatorio (Incidencia Mayor)
            </h2>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Cancelar cierre"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <p className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3 text-xs text-slate-300">
            <strong className="text-slate-100">{ticket.titulo}</strong>
            <span className="mt-1 block text-slate-400">
              Por política ITIL v4, para cerrar incidencias de prioridad{' '}
              {ticket.prioridad} debes documentar el Workaround aplicado y la
              Solución Definitiva.
            </span>
          </p>

          <div>
            <label
              htmlFor="cierre-workaround"
              className="mb-1.5 block text-xs font-medium text-slate-200"
            >
              Workaround (Solución Temporal) *
            </label>
            <textarea
              id="cierre-workaround"
              rows={2}
              value={workaround}
              onChange={(e) => {
                setWorkaround(e.target.value);
                if (errorForm) setErrorForm('');
              }}
              placeholder="Ej. Failover hacia nodo secundario y reinicio controlado de sesiones..."
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="cierre-solucion"
              className="mb-1.5 block text-xs font-medium text-slate-200"
            >
              Solución Definitiva *
            </label>
            <textarea
              id="cierre-solucion"
              rows={3}
              value={solucionDefinitiva}
              onChange={(e) => {
                setSolucionDefinitiva(e.target.value);
                if (errorForm) setErrorForm('');
              }}
              placeholder="Ej. Aplicado parche de configuración RFC-4418 y validada estabilidad en producción..."
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="cierre-rca"
              className="mb-1.5 block text-xs font-medium text-slate-300"
            >
              Resumen de Causa Raíz (Recomendado en P1 Crítica)
            </label>
            <input
              id="cierre-rca"
              type="text"
              value={causaRaiz}
              onChange={(e) => setCausaRaiz(e.target.value)}
              placeholder="Documenta la causa raíz técnica identificada o vincula un Problema con RCA..."
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
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
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
            >
              <i className="fa-solid fa-check text-[11px]" aria-hidden="true" />
              <span>Registrar Informe y Cerrar Incidente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
