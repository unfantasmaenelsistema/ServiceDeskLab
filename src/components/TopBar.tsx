import React from 'react';
import { RolSimulador, VistaActiva } from '../types/itsm';

interface TopBarProps {
  vistaActiva: VistaActiva;
  rolActivo: RolSimulador;
  onCambiarRol: (rol: RolSimulador) => void;
  onAbrirMenuMovil: () => void;
  onAbrirNuevoTicket: () => void;
  onAbrirGuiaItil: () => void;
}

const TITULOS_VISTA: Record<VistaActiva, string> = {
  portal: 'Portal de Usuario',
  dashboard: 'Dashboard Directivo y Operativo',
  tickets: 'Cola de Tickets (N1/N2)',
  problemas: 'Gestión de Problemas y KEDB',
  rca: 'Laboratorio de Análisis RCA',
  cambios: 'Gestión de Cambios (RFC & CAB)',
  cmdb: 'CMDB · Activos de Configuración (CI)',
  kb: 'Base de Conocimiento (KEDB)',
};

const ROLES_DISPONIBLES: { id: RolSimulador; label: string }[] = [
  { id: 'usuario', label: 'Portal de Usuario' },
  { id: 'n1', label: 'Técnico N1' },
  { id: 'n2', label: 'Especialista N2/N3' },
  { id: 'sdm', label: 'Service Delivery Manager (SDM)' },
];

export const TopBar: React.FC<TopBarProps> = ({
  vistaActiva,
  rolActivo,
  onCambiarRol,
  onAbrirMenuMovil,
  onAbrirNuevoTicket,
  onAbrirGuiaItil,
}) => {
  return (
    <header className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-[#0D131F]/90 px-4 py-2 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onAbrirMenuMovil}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Abrir navegación"
        >
          <i className="fa-solid fa-bars" aria-hidden="true" />
        </button>

        <nav
          aria-label="Ruta de navegación"
          className="flex min-w-0 items-center gap-2 text-sm"
        >
          <span className="hidden text-slate-400 sm:inline whitespace-nowrap">
            ServiceDeskLab
          </span>
          <span className="hidden text-slate-600 sm:inline" aria-hidden="true">
            /
          </span>
          <h1 className="truncate font-display text-base font-semibold text-slate-100">
            {TITULOS_VISTA[vistaActiva]}
          </h1>
        </nav>
      </div>

      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2.5 sm:shrink-0">
        <button
          type="button"
          onClick={onAbrirGuiaItil}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#111827] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-blue-500/50 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap shrink-0"
        >
          <i
            className="fa-solid fa-graduation-cap text-xs text-blue-400"
            aria-hidden="true"
          />
          <span className="hidden sm:inline">Guía ITIL v4</span>
          <span className="sm:hidden">Guía</span>
        </button>

        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-700/80 bg-[#111827] px-2.5 py-1.5">
          <i
            className="fa-solid fa-user-shield text-xs text-blue-400"
            aria-hidden="true"
          />
          <label
            htmlFor="selector-rol-navbar"
            className="hidden text-[11px] font-medium text-slate-400 md:inline whitespace-nowrap"
          >
            Perfil activo:
          </label>
          <select
            id="selector-rol-navbar"
            value={rolActivo}
            onChange={(e) => onCambiarRol(e.target.value as RolSimulador)}
            aria-label="Seleccionar perfil de rol ITIL"
            className="min-w-0 max-w-[11rem] bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer sm:max-w-none"
          >
            {ROLES_DISPONIBLES.map((rol) => (
              <option
                key={rol.id}
                value={rol.id}
                className="bg-[#0D131F] text-slate-100"
              >
                {rol.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onAbrirNuevoTicket}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 whitespace-nowrap shrink-0"
        >
          <i className="fa-solid fa-plus text-[11px]" aria-hidden="true" />
          <span>Nuevo Ticket</span>
        </button>
      </div>
    </header>
  );
};
