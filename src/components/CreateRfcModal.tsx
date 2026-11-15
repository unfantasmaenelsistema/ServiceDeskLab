import React, { useEffect, useState } from 'react';
import {
  Problema,
  RfcRiesgo,
  RfcTipo,
} from '../types/itsm';

interface CreateRfcModalProps {
  problema: Problema | null;
  onCerrar: () => void;
  onCrearRfc: (payload: {
    problemaId: string;
    ciAfectado: string;
    titulo: string;
    tipo: RfcTipo;
    riesgo: RfcRiesgo;
    planImplementacion: string;
    planRollback: string;
    ventanaMantenimiento: string;
  }) => void;
}

export const CreateRfcModal: React.FC<CreateRfcModalProps> = ({
  problema,
  onCerrar,
  onCrearRfc,
}) => {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<RfcTipo>('Normal');
  const [riesgo, setRiesgo] = useState<RfcRiesgo>('Medio');
  const [ciAfectado, setCiAfectado] = useState('');
  const [ventanaMantenimiento, setVentanaMantenimiento] = useState(
    'Viernes 22:00 - 23:30 UTC'
  );
  const [planImplementacion, setPlanImplementacion] = useState('');
  const [planRollback, setPlanRollback] = useState('');
  const [errorForm, setErrorForm] = useState('');

  useEffect(() => {
    if (!problema) return;
    setTitulo(`Cambio en producción para resolver ${problema.id}: ${problema.ciAfectado}`);
    setTipo(
      problema.prioridad === 'P1 - Crítica' || problema.prioridad === 'P2 - Alta'
        ? 'Normal'
        : 'Estándar'
    );
    setRiesgo(
      problema.prioridad === 'P1 - Crítica'
        ? 'Alto'
        : problema.prioridad === 'P2 - Alta'
          ? 'Medio'
          : 'Bajo'
    );
    setCiAfectado(problema.ciAfectado);
    setVentanaMantenimiento(
      problema.prioridad === 'P1 - Crítica'
        ? 'Ventana controlada hoy 23:00 - 00:30 UTC'
        : 'Domingo 02:00 - 04:00 UTC'
    );
    setPlanImplementacion(
      problema.solucionDefinitiva || problema.causaRaiz
        ? `Aplicar remediación definitiva sobre ${problema.ciAfectado} (${problema.solucionDefinitiva || problema.causaRaiz}) y validar métricas post-despliegue.`
        : ''
    );
    setPlanRollback('');
    setErrorForm('');
  }, [problema]);

  useEffect(() => {
    if (!problema) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [problema, onCerrar]);

  if (!problema) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titulo.trim().length < 8) {
      setErrorForm('El título del RFC debe tener al menos 8 caracteres.');
      return;
    }
    if (ciAfectado.trim().length < 3) {
      setErrorForm('Especifica el CI de la CMDB afectado por el cambio.');
      return;
    }
    if (planImplementacion.trim().length < 20) {
      setErrorForm(
        'El Plan de Implementación es obligatorio y debe detallar los pasos técnicos (mín. 20 caracteres).'
      );
      return;
    }
    if (planRollback.trim().length < 20) {
      setErrorForm(
        'El Plan de Marcha Atrás (Rollback) es obligatorio por política ITIL v4 (mín. 20 caracteres).'
      );
      return;
    }
    if (tipo === 'Estándar' && riesgo !== 'Bajo') {
      setErrorForm(
        'Un cambio Estándar está preautorizado solo si es de riesgo Bajo y repetible. Con este riesgo, tramítalo como Normal (CAB) o Emergencia (ECAB).'
      );
      return;
    }

    onCrearRfc({
      problemaId: problema.id,
      ciAfectado: ciAfectado.trim(),
      titulo: titulo.trim(),
      tipo,
      riesgo,
      planImplementacion: planImplementacion.trim(),
      planRollback: planRollback.trim(),
      ventanaMantenimiento:
        ventanaMantenimiento.trim() || 'Ventana programada N2',
    });
    onCerrar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-crear-rfc-titulo"
      onClick={onCerrar}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-800 bg-[#111827] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-4">
          <div className="space-y-1">
            <span className="font-mono text-xs font-semibold text-blue-400">
              Change Enablement · Vinculado a {problema.id}
            </span>
            <h2
              id="modal-crear-rfc-titulo"
              className="font-display text-base font-semibold text-slate-100"
            >
              Crear Petición de Cambio (RFC - Request For Change)
            </h2>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Cerrar formulario de RFC"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3 text-xs text-slate-300">
            <strong className="text-slate-100">Problema origen:</strong>{' '}
            {problema.titulo}
            <p className="mt-1 text-[11px] text-slate-400">
              {tipo === 'Normal'
                ? 'Un cambio Normal quedará pausado en estado "Pendiente Aprobación CAB" hasta que solicites revisión del comité.'
                : tipo === 'Estándar'
                  ? 'Un cambio Estándar solo está preautorizado por catálogo si es de riesgo Bajo y cuenta con Rollback verificado.'
                  : 'Un cambio de Emergencia no pasa por el CAB ordinario, pero necesita la aprobación del ECAB (comité de emergencia) antes de implementarse.'}
            </p>
          </div>

          <div>
            <label
              htmlFor="rfc-titulo"
              className="mb-1.5 block text-xs font-medium text-slate-200"
            >
              Título del Cambio (RFC) *
            </label>
            <input
              id="rfc-titulo"
              type="text"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (errorForm) setErrorForm('');
              }}
              placeholder="Ej. Creación de índice compuesto CONCURRENTLY en facturas_detalle"
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="rfc-tipo"
                className="mb-1.5 block text-xs font-medium text-slate-200"
              >
                Tipo de Cambio *
              </label>
              <select
                id="rfc-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as RfcTipo)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="Estándar">Estándar (preaprobado, solo riesgo Bajo)</option>
                <option value="Normal">Normal (Requiere CAB)</option>
                <option value="Emergencia">Emergencia (ECAB)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="rfc-riesgo"
                className="mb-1.5 block text-xs font-medium text-slate-200"
              >
                Nivel de Riesgo *
              </label>
              <select
                id="rfc-riesgo"
                value={riesgo}
                onChange={(e) => setRiesgo(e.target.value as RfcRiesgo)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="Bajo">Bajo</option>
                <option value="Medio">Medio</option>
                <option value="Alto">Alto</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="rfc-ci"
                className="mb-1.5 block text-xs font-medium text-slate-200"
              >
                CI en CMDB *
              </label>
              <input
                id="rfc-ci"
                type="text"
                value={ciAfectado}
                onChange={(e) => setCiAfectado(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 font-mono text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="rfc-ventana"
                className="mb-1.5 block text-xs font-medium text-slate-200"
              >
                Ventana de Cambio
              </label>
              <input
                id="rfc-ventana"
                type="text"
                value={ventanaMantenimiento}
                onChange={(e) => setVentanaMantenimiento(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <label
                htmlFor="rfc-implementacion"
                className="font-medium text-slate-200"
              >
                Plan de Implementación *
              </label>
              <span className="font-mono text-[11px] text-slate-400">
                {planImplementacion.trim().length}/20 mín.
              </span>
            </div>
            <textarea
              id="rfc-implementacion"
              rows={3}
              value={planImplementacion}
              onChange={(e) => {
                setPlanImplementacion(e.target.value);
                if (errorForm) setErrorForm('');
              }}
              placeholder="Detalla pasos secuenciales, backup previo, pruebas de humo y criterios de validación..."
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <label
                htmlFor="rfc-rollback"
                className="font-medium text-amber-200"
              >
                Plan de Marcha Atrás (Rollback) * (Obligatorio)
              </label>
              <span className="font-mono text-[11px] text-slate-400">
                {planRollback.trim().length}/20 mín.
              </span>
            </div>
            <textarea
              id="rfc-rollback"
              rows={3}
              value={planRollback}
              onChange={(e) => {
                setPlanRollback(e.target.value);
                if (errorForm) setErrorForm('');
              }}
              placeholder="Describe cómo revertir el cambio (snapshot, DROP INDEX, restauración de config) si fallan las pruebas post-cambio..."
              className="w-full rounded-lg border border-amber-500/40 bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
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

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              <i className="fa-solid fa-code-branch text-[11px]" aria-hidden="true" />
              <span>Registrar RFC en Gestión de Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
