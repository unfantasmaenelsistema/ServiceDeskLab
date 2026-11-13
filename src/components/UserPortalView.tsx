import React, { useState } from 'react';
import { PrefillNuevoTicket, Ticket } from '../types/itsm';
import {
  EstadoTicketIndicador,
  PrioridadIndicador,
  SlaBarraProgreso,
} from './ItsmStatusHelpers';

interface UserPortalViewProps {
  tickets: Ticket[];
  onAbrirNuevoTicket: (prefill?: PrefillNuevoTicket) => void;
  onSeleccionarTicket: (ticketId: string) => void;
  onEnviarCsat: (
    ticketId: string,
    puntuacion: 1 | 2 | 3 | 4 | 5,
    comentario?: string
  ) => void;
}

const PLANTILLAS_RAPIDAS: {
  label: string;
  icon: string;
  prefill: PrefillNuevoTicket;
}[] = [
  {
    label: 'Error de token o acceso VPN',
    icon: 'fa-solid fa-shield-halved',
    prefill: {
      titulo: 'No puedo conectar a la VPN corporativa (token OTP inválido)',
      descripcion:
        'Al introducir el código MFA en Cisco AnyConnect aparece error de token desincronizado y no consigo acceder a la red interna.',
      categoria: 'Redes & Conectividad',
      ciAfectado: 'FW-PALO-MAD-01',
      impacto: 'Bajo',
      urgencia: 'Alta',
    },
  },
  {
    label: 'Cuenta bloqueada en Active Directory',
    icon: 'fa-solid fa-user-lock',
    prefill: {
      titulo: 'Cuenta bloqueada en Active Directory tras cambio de contraseña',
      descripcion:
        'Windows muestra "Su cuenta ha sido bloqueada" al iniciar sesión tras actualizar la clave en el teléfono corporativo.',
      categoria: 'IAM / Identidad',
      ciAfectado: 'DC-AD-PRIMARY-01',
      impacto: 'Bajo',
      urgencia: 'Media',
    },
  },
  {
    label: 'Lentitud tras parche de Windows',
    icon: 'fa-brands fa-windows',
    prefill: {
      titulo: 'Equipo muy lento tras actualización acumulativa de Windows',
      descripcion:
        'Después del reinicio de esta mañana el ordenador tarda en abrir aplicaciones y la barra de tareas responde con retraso.',
      categoria: 'Puesto de Trabajo',
      ciAfectado: 'WS-WIN11-FIN-04',
      impacto: 'Bajo',
      urgencia: 'Baja',
    },
  },
];

export const UserPortalView: React.FC<UserPortalViewProps> = ({
  tickets,
  onAbrirNuevoTicket,
  onSeleccionarTicket,
  onEnviarCsat,
}) => {
  const [csatDraft, setCsatDraft] = useState<
    Record<string, { score: 1 | 2 | 3 | 4 | 5; comentario: string }>
  >({});

  const misTickets = tickets.filter(
    (t) => t.creadoPorUsuario || t.canalEntrada === 'Portal de Usuario'
  );
  const abiertos = misTickets.filter((t) => t.estado !== 'Resuelto').length;
  const resueltos = misTickets.filter((t) => t.estado === 'Resuelto').length;
  const ticketsParaValorar = misTickets.filter(
    (t) => t.estado === 'Resuelto' && !t.csatPuntuacion
  );

  return (
    <div className="space-y-6">
      {/* User Self-Service Banner */}
      <section className="flex flex-col gap-4 rounded-xl border border-slate-800/80 bg-[#111827] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-lg font-semibold text-slate-100">
            Portal de Autoservicio de Usuario Final
          </h2>
          <p className="text-xs leading-relaxed text-slate-400">
            Reporta nuevas incidencias al Service Desk, utiliza plantillas rápidas o valora la atención recibida en tus tickets resueltos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onAbrirNuevoTicket()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 whitespace-nowrap shrink-0"
        >
          <i className="fa-solid fa-plus text-[11px]" aria-hidden="true" />
          <span>Nuevo Ticket</span>
        </button>
      </section>

      {/* Quick Issue Templates */}
      <section
        aria-label="Plantillas rápidas de reporte"
        className="rounded-xl border border-slate-800/80 bg-[#111827] p-4 space-y-3"
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">
            <i className="fa-solid fa-wand-magic-sparkles mr-1.5 text-blue-400" aria-hidden="true" />
            Atajos de Solicitud Frecuente
          </span>
          <span className="text-[11px] text-slate-400">
            Pre-rellena el formulario para simular la entrada real de usuarios
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
          {PLANTILLAS_RAPIDAS.map((tpl) => (
            <button
              key={tpl.label}
              type="button"
              onClick={() => onAbrirNuevoTicket(tpl.prefill)}
              className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0B0F17] px-3.5 py-2.5 text-left text-xs text-slate-200 transition-colors hover:border-blue-500/50 hover:bg-slate-900"
            >
              <i className={`${tpl.icon} text-blue-400`} aria-hidden="true" />
              <span className="font-medium truncate">{tpl.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-800/80 bg-[#111827] p-4">
          <span className="text-xs text-slate-400">Mis Tickets Registrados</span>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-slate-100">
            {misTickets.length}
          </p>
        </article>
        <article className="rounded-xl border border-slate-800/80 bg-[#111827] p-4">
          <span className="text-xs text-slate-400">En Curso</span>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-blue-400">
            {abiertos}
          </p>
        </article>
        <article className="rounded-xl border border-slate-800/80 bg-[#111827] p-4">
          <span className="text-xs text-slate-400">Resueltos</span>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-emerald-400">
            {resueltos}
          </p>
        </article>
      </div>

      {/* CSAT Feedback Cards for Resolved Tickets */}
      {ticketsParaValorar.length > 0 && (
        <section
          aria-label="Encuesta de satisfacción CSAT pendiente"
          className="rounded-xl border border-emerald-500/35 bg-emerald-950/15 p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-emerald-300">
              <i className="fa-solid fa-star mr-1.5" aria-hidden="true" />
              Valora tu atención (Encuesta CSAT)
            </h3>
            <span className="font-mono text-xs text-slate-400">
              {ticketsParaValorar.length} pendiente(s)
            </span>
          </div>
          <div className="space-y-3">
            {ticketsParaValorar.map((t) => {
              const draft = csatDraft[t.id] ?? { score: 5, comentario: '' };
              return (
                <div
                  key={t.id}
                  className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-[#0B0F17] p-3.5 text-xs lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 space-y-0.5">
                    <span className="font-mono font-semibold text-blue-400">
                      {t.id}
                    </span>
                    <p className="truncate font-medium text-slate-100">
                      {t.titulo}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div
                      className="flex items-center gap-1"
                      role="group"
                      aria-label={`Puntuación CSAT para ${t.id}`}
                    >
                      {([1, 2, 3, 4, 5] as const).map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setCsatDraft((prev) => ({
                              ...prev,
                              [t.id]: { ...draft, score: star },
                            }))
                          }
                          aria-label={`${star} estrellas`}
                          className={`px-1 text-sm transition-colors ${
                            star <= draft.score
                              ? 'text-amber-400'
                              : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          <i className="fa-solid fa-star" aria-hidden="true" />
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={draft.comentario}
                      onChange={(e) =>
                        setCsatDraft((prev) => ({
                          ...prev,
                          [t.id]: { ...draft, comentario: e.target.value },
                        }))
                      }
                      placeholder="Comentario breve (opcional)..."
                      aria-label={`Comentario CSAT para ${t.id}`}
                      className="rounded-md border border-slate-700 bg-[#111827] px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        onEnviarCsat(t.id, draft.score, draft.comentario.trim())
                      }
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors whitespace-nowrap"
                    >
                      Enviar Valoración
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* User's Tickets Table */}
      <section className="rounded-xl border border-slate-800/80 bg-[#111827]">
        <div className="border-b border-slate-800/80 px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-slate-100">
            Estado de Mis Incidencias ({misTickets.length})
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Haz clic en cualquiera de tus tickets para consultar su progreso y notas de solución
          </p>
        </div>

        {misTickets.length === 0 ? (
          <div className="px-6 py-12 text-center space-y-3">
            <i
              className="fa-regular fa-inbox text-2xl text-slate-500"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-slate-200">
              Aún no has enviado tickets desde el Portal de Usuario
            </p>
            <button
              type="button"
              onClick={() => onAbrirNuevoTicket()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Crear mi primer ticket
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-[11px] font-medium text-slate-400">
                  <th className="py-3 pl-5 pr-3">ID</th>
                  <th className="px-3 py-3">Asunto</th>
                  <th className="px-3 py-3">Prioridad</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3">Atención</th>
                  <th className="px-3 py-3">CSAT</th>
                  <th className="py-3 pl-3 pr-5 text-right">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {misTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onSeleccionarTicket(t.id)}
                    className="cursor-pointer transition-colors hover:bg-slate-800/40"
                  >
                    <td className="py-3.5 pl-5 pr-3 font-mono font-semibold text-blue-400 whitespace-nowrap">
                      {t.id}
                    </td>
                    <td className="px-3 py-3.5 max-w-[300px]">
                      <p className="truncate font-medium text-slate-100">
                        {t.titulo}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {t.categoria} · {t.solicitante}
                      </p>
                    </td>
                    <td className="px-3 py-3.5">
                      <PrioridadIndicador prioridad={t.prioridad} />
                    </td>
                    <td className="px-3 py-3.5">
                      <EstadoTicketIndicador estado={t.estado} />
                    </td>
                    <td className="px-3 py-3.5 text-slate-300 whitespace-nowrap">
                      {t.asignadoA}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {t.csatPuntuacion ? (
                        <span className="font-mono text-amber-400">
                          ★ {t.csatPuntuacion}/5
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 pl-3 pr-5 text-right">
                      <div className="inline-block">
                        <SlaBarraProgreso ticket={t} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
