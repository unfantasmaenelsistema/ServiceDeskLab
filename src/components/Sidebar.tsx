import React, { useRef, useState } from 'react';
import { Metricas, RolSimulador, VistaActiva } from '../types/itsm';

interface SidebarProps {
  vistaActiva: VistaActiva;
  rolActivo: RolSimulador;
  onCambiarVista: (vista: VistaActiva) => void;
  metricas: Metricas;
  onResetEstado: () => void;
  onExportarJson: () => void;
  onImportarJson: (file: File) => void;
  abiertoMovil: boolean;
  onCerrarMovil: () => void;
}

const ETIQUETAS_ROL: Record<RolSimulador, string> = {
  usuario: 'Portal de Autoservicio',
  n1: 'Mesa de Servicio N1',
  n2: 'Ingeniería N2/N3',
  sdm: 'Dirección & Auditoría SDM',
};

const VISTA_INICIAL_ROL: Record<RolSimulador, VistaActiva> = {
  usuario: 'portal',
  n1: 'tickets',
  n2: 'problemas',
  sdm: 'dashboard',
};

export const Sidebar: React.FC<SidebarProps> = ({
  vistaActiva,
  rolActivo,
  onCambiarVista,
  metricas,
  onResetEstado,
  onExportarJson,
  onImportarJson,
  abiertoMovil,
  onCerrarMovil,
}) => {
  const [confirmandoReset, setConfirmandoReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const navItems: {
    id: VistaActiva;
    label: string;
    icon: string;
    count?: number;
    roles: RolSimulador[];
  }[] = [
    {
      id: 'portal',
      label: 'Mis Tickets (Portal)',
      icon: 'fa-solid fa-user-check',
      roles: ['usuario'],
    },
    {
      id: 'dashboard',
      label: 'Dashboard (KPIs & Auditoría)',
      icon: 'fa-solid fa-gauge-high',
      roles: ['sdm'],
    },
    {
      id: 'tickets',
      label: 'Cola de Tickets (N1/N2)',
      icon: 'fa-solid fa-layer-group',
      count: metricas.ticketsAbiertos,
      roles: ['n1', 'sdm'],
    },
    {
      id: 'problemas',
      label: 'Gestión de Problemas',
      icon: 'fa-solid fa-triangle-exclamation',
      count: metricas.problemasActivos,
      roles: ['n2', 'sdm'],
    },
    {
      id: 'rca',
      label: 'Análisis RCA',
      icon: 'fa-solid fa-diagram-project',
      roles: ['n2', 'sdm'],
    },
    {
      id: 'cambios',
      label: 'Gestión de Cambios (RFC)',
      icon: 'fa-solid fa-code-branch',
      count: metricas.rfcsActivos,
      roles: ['n2', 'sdm'],
    },
    {
      id: 'cmdb',
      label: 'CMDB (Activos CI)',
      icon: 'fa-solid fa-server',
      roles: ['n2', 'sdm'],
    },
    {
      id: 'kb',
      label: 'Base Conocimiento (KEDB)',
      icon: 'fa-solid fa-book-open',
      count: metricas.articulosKb,
      roles: ['n1', 'sdm'],
    },
  ];

  const handleSelect = (vista: VistaActiva) => {
    onCambiarVista(vista);
    onCerrarMovil();
  };

  return (
    <>
      {abiertoMovil && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-[2px] lg:hidden"
          onClick={onCerrarMovil}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[284px] shrink-0 flex-col border-r border-slate-800/80 bg-[#0D131F] transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          abiertoMovil ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navegación principal de ServiceDeskLab"
      >
        {/* Brand Zone with User Logo (undistorted aspect-square object-contain) */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4">
          <button
            type="button"
            onClick={() => handleSelect(VISTA_INICIAL_ROL[rolActivo])}
            className="flex min-w-0 items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-700/80 bg-white p-0.5">
              <img
                src="./assets/logo.png"
                alt="Logo Un Fantasma en el Sistema"
                className="h-full w-full object-contain"
              />
            </span>
            <span className="truncate font-display text-base font-bold tracking-tight text-slate-100">
              ServiceDeskLab
            </span>
          </button>

          <button
            type="button"
            onClick={onCerrarMovil}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100 lg:hidden"
            aria-label="Cerrar menú lateral"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Links (role-conditioned via Tailwind hidden) */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-xs font-medium text-slate-500">
            {ETIQUETAS_ROL[rolActivo]}
          </p>
          {navItems.map((item) => {
            const activo = vistaActiva === item.id;
            const visible = item.roles.includes(rolActivo);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={activo ? 'page' : undefined}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  activo
                    ? 'bg-blue-600/15 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                } ${visible ? '' : 'hidden'}`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <i
                    className={`${item.icon} w-4 text-center text-sm ${
                      activo
                        ? 'text-blue-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.count === 'number' && (
                  <span
                    className={`ml-2 font-mono text-xs tabular-nums ${
                      activo ? 'text-blue-300' : 'text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Persistence, Reset & Author Link */}
        <div className="border-t border-slate-800/80 p-4 space-y-3">
          <div className={rolActivo === 'usuario' ? 'hidden' : 'space-y-3'}>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Almacenamiento</span>
                <span className="font-mono text-slate-300">LocalStorage</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Registros guardados</span>
                <span className="font-mono tabular-nums text-slate-300">
                  {metricas.ticketsTotales}T · {metricas.problemasActivos}P
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportarJson}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-2 text-[11px] font-medium text-slate-300 transition-colors hover:border-blue-500/40 hover:text-blue-300 whitespace-nowrap"
              >
                <i className="fa-solid fa-download text-[10px]" aria-hidden="true" />
                <span>Exportar JSON</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-2 text-[11px] font-medium text-slate-300 transition-colors hover:border-blue-500/40 hover:text-blue-300 whitespace-nowrap"
              >
                <i className="fa-solid fa-upload text-[10px]" aria-hidden="true" />
                <span>Importar JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                aria-label="Importar sesión ServiceDeskLab en formato JSON"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onImportarJson(file);
                    e.target.value = '';
                  }
                }}
              />
            </div>

            {!confirmandoReset ? (
              <button
                type="button"
                onClick={() => setConfirmandoReset(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <i className="fa-solid fa-rotate-left text-[11px]" aria-hidden="true" />
                <span className="whitespace-nowrap">Reiniciar Simulador</span>
              </button>
            ) : (
              <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-2.5 space-y-2">
                <p className="text-xs text-amber-200">
                  ¿Restaurar los 3 tickets y problemas iniciales?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetEstado();
                      setConfirmandoReset(false);
                    }}
                    className="flex-1 rounded-md bg-amber-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-amber-500 transition-colors whitespace-nowrap"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoReset(false)}
                    className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Brand / Web Link */}
          <a
            href="https://www.unfantasmaenelsistema.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-lg border border-slate-800/80 bg-[#0B0F17] px-3 py-2.5 transition-colors hover:border-slate-700 hover:bg-slate-900"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-0.5">
              <img
                src="./assets/logo.png"
                alt="Un Fantasma en el Sistema"
                className="h-full w-full object-contain"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                Un Fantasma en el Sistema
              </span>
              <span className="block truncate text-[11px] text-slate-400">
                unfantasmaenelsistema.com
              </span>
            </span>
            <i
              className="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-500 group-hover:text-blue-400"
              aria-hidden="true"
            />
          </a>
        </div>
      </aside>
    </>
  );
};
