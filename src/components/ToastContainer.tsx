import React from 'react';

export interface ToastMensaje {
  id: string;
  tipo: 'success' | 'warning' | 'error' | 'info';
  titulo: string;
  detalle?: string;
}

interface ToastContainerProps {
  toasts: ToastMensaje[];
  onDescartar: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDescartar,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notificaciones del sistema"
      className="no-print fixed bottom-4 right-4 z-[70] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const estilo =
          toast.tipo === 'success'
            ? {
                borde: 'border-emerald-500/50 bg-[#0D131F]',
                icono: 'fa-solid fa-circle-check text-emerald-400',
              }
            : toast.tipo === 'warning'
              ? {
                  borde: 'border-amber-500/50 bg-[#0D131F]',
                  icono: 'fa-solid fa-triangle-exclamation text-amber-400',
                }
              : toast.tipo === 'error'
                ? {
                    borde: 'border-red-500/60 bg-[#0D131F]',
                    icono: 'fa-solid fa-circle-exclamation text-red-400',
                  }
                : {
                    borde: 'border-blue-500/50 bg-[#0D131F]',
                    icono: 'fa-solid fa-circle-info text-blue-400',
                  };

        return (
          <div
            key={toast.id}
            role="status"
            className={`flex items-start gap-3 rounded-xl border p-3.5 shadow-2xl backdrop-blur-sm ${estilo.borde}`}
          >
            <i className={`${estilo.icono} mt-0.5 text-sm`} aria-hidden="true" />
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-semibold text-slate-100">{toast.titulo}</p>
              {toast.detalle && (
                <p className="mt-0.5 text-slate-400 leading-relaxed">
                  {toast.detalle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDescartar(toast.id)}
              aria-label="Cerrar notificación"
              className="text-slate-500 hover:text-slate-200 transition-colors"
            >
              <i className="fa-solid fa-xmark text-xs" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
