import React, { useState } from 'react';
import {
  Problema,
  RfcEstado,
  RfcRiesgo,
  SolicitudCambioRfc,
} from '../types/itsm';

interface ChangeManagementViewProps {
  rfcs: SolicitudCambioRfc[];
  problemas: Problema[];
  onAbrirCrearRfc: (problema: Problema) => void;
  onSolicitarAprobacionCab: (rfcId: string) => void;
  onActualizarPlanesRfc: (
    rfcId: string,
    payload: {
      planImplementacion: string;
      planRollback: string;
      riesgo: RfcRiesgo;
    }
  ) => void;
  onImplementarRfc: (rfcId: string) => void;
}

function colorEstadoRfc(estado: RfcEstado): {
  text: string;
  icon: string;
} {
  switch (estado) {
    case 'Pendiente Aprobación CAB':
      return { text: 'text-amber-300', icon: 'fa-solid fa-hourglass-half' };
    case 'En Deliberación CAB':
      return { text: 'text-blue-300', icon: 'fa-solid fa-users-gear' };
    case 'Aprobado':
      return { text: 'text-emerald-400', icon: 'fa-solid fa-circle-check' };
    case 'Rechazado':
      return { text: 'text-red-400', icon: 'fa-solid fa-circle-xmark' };
    case 'Implementado':
      return { text: 'text-slate-300', icon: 'fa-solid fa-check-double' };
    default:
      return { text: 'text-slate-400', icon: 'fa-regular fa-file-lines' };
  }
}

function colorRiesgo(riesgo: RfcRiesgo): string {
  switch (riesgo) {
    case 'Crítico':
      return 'text-red-400';
    case 'Alto':
      return 'text-amber-400';
    case 'Medio':
      return 'text-blue-400';
    default:
      return 'text-emerald-400';
  }
}

export const ChangeManagementView: React.FC<ChangeManagementViewProps> = ({
  rfcs,
  problemas,
  onAbrirCrearRfc,
  onSolicitarAprobacionCab,
  onActualizarPlanesRfc,
  onImplementarRfc,
}) => {
  const [filtroEstado, setFiltroEstado] = useState<'todos' | RfcEstado>('todos');
  const [editandoRfcId, setEditandoRfcId] = useState<string | null>(null);
  const [editImpl, setEditImpl] = useState('');
  const [editRollback, setEditRollback] = useState('');
  const [editRiesgo, setEditRiesgo] = useState<RfcRiesgo>('Medio');
  const [errorEdit, setErrorEdit] = useState('');

  const rfcsFiltrados = rfcs.filter(
    (r) => filtroEstado === 'todos' || r.estado === filtroEstado
  );

  const iniciarEdicion = (rfc: SolicitudCambioRfc) => {
    setEditandoRfcId(rfc.id);
    setEditImpl(rfc.planImplementacion);
    setEditRollback(rfc.planRollback);
    setEditRiesgo(rfc.riesgo);
    setErrorEdit('');
  };

  const guardarRevision = (rfcId: string) => {
    if (editImpl.trim().length < 20 || editRollback.trim().length < 20) {
      setErrorEdit(
        'Tanto el Plan de Implementación como el Plan de Rollback deben tener al menos 20 caracteres.'
      );
      return;
    }
    onActualizarPlanesRfc(rfcId, {
      planImplementacion: editImpl.trim(),
      planRollback: editRollback.trim(),
      riesgo: editRiesgo,
    });
    setEditandoRfcId(null);
    setErrorEdit('');
  };

  return (
    <div className="space-y-6">
      {/* Toolbar & Quick Create from Problem */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-[#111827] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#0B0F17] p-1">
          {(
            [
              'todos',
              'Pendiente Aprobación CAB',
              'Aprobado',
              'Rechazado',
              'Implementado',
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
              {est === 'todos' ? 'Todos los RFC' : est}
            </button>
          ))}
        </div>

        {problemas.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              defaultValue=""
              aria-label="Crear RFC a partir de un Problema"
              onChange={(e) => {
                const prb = problemas.find((p) => p.id === e.target.value);
                if (prb) {
                  onAbrirCrearRfc(prb);
                  e.target.value = '';
                }
              }}
              className="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="">+ Nuevo RFC desde Problema...</option>
              {problemas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} ({p.prioridad}) — {p.titulo.slice(0, 42)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* CAB Governance Overview Banner */}
      <div className="rounded-xl border border-slate-800/80 bg-[#111827] p-4 text-xs text-slate-300 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <i
            className="fa-solid fa-users-gear mt-0.5 text-sm text-blue-400"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-slate-100">
              Simulador Change Advisory Board (CAB) · ITIL v4 Change Enablement
            </p>
            <p className="text-slate-400">
              Los cambios de tipo <strong className="text-slate-200">Normal</strong> pausan su ejecución hasta que solicites aprobación CAB. El comité evalúa el nivel de Riesgo y el rigor del Plan de Implementación y Marcha Atrás (Rollback).
            </p>
          </div>
        </div>
        <span className="font-mono text-xs text-slate-400 whitespace-nowrap shrink-0">
          Total RFCs: <strong className="text-slate-100">{rfcs.length}</strong>
        </span>
      </div>

      {/* RFC Cards */}
      {rfcsFiltrados.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#111827] px-6 py-12 text-center">
          <i
            className="fa-solid fa-code-branch mb-2 text-2xl text-slate-500"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-slate-200">
            No hay peticiones de cambio (RFC) en este filtro
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Crea un RFC desde cualquier Problema en Gestión de Problemas o usando el selector superior.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rfcsFiltrados.map((rfc) => {
            const estCfg = colorEstadoRfc(rfc.estado);
            const problemaOrigen = problemas.find(
              (p) => p.id === rfc.problemaId
            );
            const enDeliberacion = rfc.estado === 'En Deliberación CAB';
            const enEdicion = editandoRfcId === rfc.id;

            return (
              <article
                key={rfc.id}
                className="rounded-xl border border-slate-800/80 bg-[#111827] p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-blue-400">
                        {rfc.id}
                      </span>
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-mono text-slate-300">
                        Tipo: {rfc.tipo}
                      </span>
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      <span className={`font-mono font-semibold ${colorRiesgo(rfc.riesgo)}`}>
                        Riesgo {rfc.riesgo}
                      </span>
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      <span className={`inline-flex items-center gap-1.5 font-medium ${estCfg.text}`}>
                        <i
                          className={`${estCfg.icon} text-[11px] ${enDeliberacion ? 'motion-safe:animate-spin' : ''}`}
                          aria-hidden="true"
                        />
                        <span>{rfc.estado}</span>
                      </span>
                    </div>

                    <h3 className="font-display text-base font-semibold text-slate-100">
                      {rfc.titulo}
                    </h3>

                    <p className="text-xs text-slate-400">
                      Problema vinculado:{' '}
                      <span className="font-mono text-amber-300">
                        {rfc.problemaId}
                      </span>
                      {problemaOrigen && ` (${problemaOrigen.prioridad})`}
                      <span className="mx-2 text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      CI CMDB:{' '}
                      <span className="font-mono text-slate-200">
                        {rfc.ciAfectado}
                      </span>
                      <span className="mx-2 text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      Ventana: {rfc.ventanaMantenimiento}
                    </p>
                  </div>

                  {/* Lifecycle Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {rfc.estado === 'Pendiente Aprobación CAB' && (
                      <button
                        type="button"
                        onClick={() => onSolicitarAprobacionCab(rfc.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap"
                      >
                        <i className="fa-solid fa-gavel text-[11px]" aria-hidden="true" />
                        <span>
                          {rfc.tipo === 'Emergencia'
                            ? 'Solicitar Aprobación ECAB'
                            : 'Solicitar Aprobación CAB'}
                        </span>
                      </button>
                    )}

                    {enDeliberacion && (
                      <span
                        role="status"
                        aria-live="polite"
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-950/30 px-3.5 py-2 text-xs font-medium text-blue-300"
                      >
                        <i
                          className="fa-solid fa-spinner motion-safe:animate-spin text-[11px]"
                          aria-hidden="true"
                        />
                        <span>Comité CAB deliberando...</span>
                      </span>
                    )}

                    {rfc.estado === 'Rechazado' && !enEdicion && (
                      <button
                        type="button"
                        onClick={() => iniciarEdicion(rfc)}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-950/30 px-3.5 py-2 text-xs font-medium text-blue-300 hover:bg-blue-900/40 transition-colors whitespace-nowrap"
                      >
                        <i className="fa-solid fa-pen text-[11px]" aria-hidden="true" />
                        <span>Revisar Plan y Reenviar al CAB</span>
                      </button>
                    )}

                    {rfc.estado === 'Aprobado' && (
                      <button
                        type="button"
                        onClick={() => onImplementarRfc(rfc.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 whitespace-nowrap"
                      >
                        <i className="fa-solid fa-rocket text-[11px]" aria-hidden="true" />
                        <span>Ejecutar Cambio en CMDB</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* CAB Committee Decision Feedback */}
                {rfc.cabComentario && (
                  <div
                    role="status"
                    className={`rounded-lg border p-3.5 text-xs ${
                      rfc.estado === 'Rechazado'
                        ? 'border-red-500/40 bg-red-950/20 text-red-200'
                        : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                    }`}
                  >
                    <p className="font-semibold">
                      <i
                        className={`fa-solid ${
                          rfc.estado === 'Rechazado'
                            ? 'fa-triangle-exclamation'
                            : 'fa-stamp'
                        } mr-1.5`}
                        aria-hidden="true"
                      />
                      Dictamen del Comité CAB
                    </p>
                    <p className="mt-1 leading-relaxed">{rfc.cabComentario}</p>
                  </div>
                )}

                {/* Implementation & Rollback Plans (View or Revision Mode) */}
                {enEdicion ? (
                  <div className="rounded-xl border border-blue-500/40 bg-[#0B0F17] p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <strong className="text-blue-300">
                        Revisión de Planes para Reevaluación CAB · {rfc.id}
                      </strong>
                      <select
                        value={editRiesgo}
                        onChange={(e) =>
                          setEditRiesgo(e.target.value as RfcRiesgo)
                        }
                        aria-label="Ajustar nivel de riesgo"
                        className="rounded border border-slate-700 bg-[#111827] px-2.5 py-1 text-xs text-slate-100"
                      >
                        <option value="Bajo">Riesgo Bajo</option>
                        <option value="Medio">Riesgo Medio</option>
                        <option value="Alto">Riesgo Alto</option>
                        <option value="Crítico">Riesgo Crítico</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] text-slate-300">
                          Plan de Implementación *
                        </label>
                        <textarea
                          rows={3}
                          value={editImpl}
                          onChange={(e) => setEditImpl(e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-[#111827] p-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] text-amber-200">
                          Plan de Marcha Atrás (Rollback) *
                        </label>
                        <textarea
                          rows={3}
                          value={editRollback}
                          onChange={(e) => setEditRollback(e.target.value)}
                          className="w-full rounded-lg border border-amber-500/40 bg-[#111827] p-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>
                    {errorEdit && (
                      <p className="text-xs text-red-400" role="alert">
                        {errorEdit}
                      </p>
                    )}
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditandoRfcId(null)}
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => guardarRevision(rfc.id)}
                        className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                      >
                        Guardar y Devolver a Pendiente CAB
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 border-t border-slate-800/70 pt-4 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3.5">
                      <span className="block text-[11px] font-semibold text-slate-400">
                        Plan de Implementación
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-slate-200">
                        {rfc.planImplementacion}
                      </p>
                    </div>
                    <div className="rounded-lg border border-amber-500/25 bg-[#0B0F17] p-3.5">
                      <span className="block text-[11px] font-semibold text-amber-300">
                        Plan de Marcha Atrás (Rollback)
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-slate-200">
                        {rfc.planRollback}
                      </p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
