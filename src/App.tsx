import { useCallback, useEffect, useRef, useState } from 'react';
import { CmdbView } from './components/CmdbView';
import { ChangeManagementView } from './components/ChangeManagementView';
import { ClosureReportModal } from './components/ClosureReportModal';
import { CreateRfcModal } from './components/CreateRfcModal';
import { DashboardView } from './components/DashboardView';
import { DeclareProblemModal } from './components/DeclareProblemModal';
import { ItilGuideModal } from './components/ItilGuideModal';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { NewTicketModal } from './components/NewTicketModal';
import {
  ContextoReporte,
  PrintableReportModal,
} from './components/PrintableReportModal';
import { ProblemManagementView } from './components/ProblemManagementView';
import { RcaAnalysisView } from './components/RcaAnalysisView';
import { ScenarioModal } from './components/ScenarioModal';
import { Sidebar } from './components/Sidebar';
import { TicketDrawer } from './components/TicketDrawer';
import { TicketQueueView } from './components/TicketQueueView';
import { ToastContainer, ToastMensaje } from './components/ToastContainer';
import { TopBar } from './components/TopBar';
import { UserPortalView } from './components/UserPortalView';
import {
  asignarEquipoN2PorCategoria,
  calcularPrioridadITIL,
  cargarEstadoLocalStorage,
  crearEstadoInicial,
  crearEventoHistorial,
  crearIshikawaVacio,
  esArticuloKbCorrectoParaTicket,
  evaluarClasificacionMatriz,
  evaluarEstadoRca,
  evaluarRfcParaProblema,
  extraerKeywordsDeProblema,
  guardarEstadoLocalStorage,
  recalcularMetricas,
  registrarEventoEvaluacion,
  simularDecisionCab,
  validarEImportarEstadoJson,
} from './data/serviceDeskStore';
import {
  ArticuloKb,
  EscenarioSimulacion,
  EvaluacionAlumno,
  HistoryLogEntry,
  InformeCierre,
  IshikawaDiagrama,
  NotaTecnica,
  PoliticaEscaladoSla,
  PrefillNuevoTicket,
  Problema,
  RfcRiesgo,
  RfcTipo,
  RolSimulador,
  ServiceDeskGlobalState,
  SolicitudCambioRfc,
  Ticket,
  TicketPrioridad,
  VelocidadSimulacion,
  VistaActiva,
} from './types/itsm';

const VISTAS_POR_ROL: Record<RolSimulador, VistaActiva[]> = {
  usuario: ['portal'],
  n1: ['tickets', 'kb'],
  n2: ['problemas', 'rca', 'cambios', 'cmdb'],
  sdm: ['dashboard', 'tickets', 'problemas', 'rca', 'cambios', 'cmdb', 'kb'],
};

function vistaInicialParaRol(rol: RolSimulador): VistaActiva {
  return VISTAS_POR_ROL[rol][0];
}

function puedeVerVista(rol: RolSimulador, vista: VistaActiva): boolean {
  return VISTAS_POR_ROL[rol].includes(vista);
}

const PLANTILLAS_P1 = [
  {
    titulo:
      'Pérdida de quórum en clúster Redis de sesiones afectando carrito de compras',
    descripcion:
      'Nodos sentinel reportan split-brain en zona eu-west-1b tras microcorte de red. El 40% de las sesiones activas caducan inmediatamente.',
    categoria: 'Infraestructura Cloud',
    ciAfectado: 'CACHE-REDIS-PROD-01',
    solicitante: 'Monitorización Datadog',
  },
  {
    titulo:
      'Error ORA-12516 en listener Oracle ERP bloqueando emisión de albaranes',
    descripcion:
      'El servicio de logística no puede confirmar despachos desde almacén central por agotamiento de procesos TNS.',
    categoria: 'Base de Datos',
    ciAfectado: 'DB-ORA-ERP-01',
    solicitante: 'Centro Logístico Sur',
  },
  {
    titulo:
      'No hay acceso a la VPN corporativa en delegación Madrid (error IKE_TIMEOUT)',
    descripcion:
      'Múltiples usuarios remotos reportan corte inmediato tras validar segundo factor en gateway Madrid.',
    categoria: 'Redes & Conectividad',
    ciAfectado: 'FW-PALO-MAD-01',
    solicitante: 'NOC Corporativo',
  },
];

export default function App() {
  const [estado, setEstado] = useState<ServiceDeskGlobalState>(() =>
    cargarEstadoLocalStorage()
  );
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>(() =>
    vistaInicialParaRol(estado.rolActivo)
  );
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [ticketSeleccionadoId, setTicketSeleccionadoId] = useState<string | null>(
    null
  );
  const [drawerAbrirKb, setDrawerAbrirKb] = useState(false);
  const [problemaRcaId, setProblemaRcaId] = useState<string>(
    () => cargarEstadoLocalStorage().problemas[0]?.id ?? 'PRB-0108'
  );
  const [modalNuevoTicketAbierto, setModalNuevoTicketAbierto] = useState(false);
  const [prefillNuevoTicket, setPrefillNuevoTicket] =
    useState<PrefillNuevoTicket | null>(null);
  const [modalGuiaItilAbierto, setModalGuiaItilAbierto] = useState(false);
  const [toasts, setToasts] = useState<ToastMensaje[]>([]);
  const [modalEscenariosAbierto, setModalEscenariosAbierto] = useState(false);
  const [problemaParaRfc, setProblemaParaRfc] = useState<Problema | null>(null);
  const [modalDeclararProblemaIds, setModalDeclararProblemaIds] = useState<
    string[] | null
  >(null);
  const [ticketParaCierreMayorId, setTicketParaCierreMayorId] = useState<
    string | null
  >(null);
  const [reporteContexto, setReporteContexto] =
    useState<ContextoReporte | null>(null);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [escenarioEnCurso, setEscenarioEnCurso] = useState<{
    titulo: string;
    recibidos: number;
    total: number;
    ultimoMensaje: string;
  } | null>(null);
  const timersEscenarioRef = useRef<number[]>([]);
  const timersCabRef = useRef<number[]>([]);

  const limpiarTimersEscenario = useCallback(() => {
    timersEscenarioRef.current.forEach((id) => window.clearTimeout(id));
    timersEscenarioRef.current = [];
  }, []);

  const limpiarTimersCab = useCallback(() => {
    timersCabRef.current.forEach((id) => window.clearTimeout(id));
    timersCabRef.current = [];
  }, []);

  const lanzarToast = useCallback(
    (
      tipo: ToastMensaje['tipo'],
      titulo: string,
      detalle?: string
    ) => {
      const id = `TOAST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, tipo, titulo, detalle }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  useEffect(() => {
    return () => {
      limpiarTimersEscenario();
      limpiarTimersCab();
    };
  }, [limpiarTimersEscenario, limpiarTimersCab]);

  // Sync every state update cleanly to LocalStorage & window.ServiceDeskLabState
  useEffect(() => {
    guardarEstadoLocalStorage(estado);
  }, [estado]);

  // Real-time SLA Countdown Engine with automatic SLA breach penalty
  useEffect(() => {
    if (estado.velocidadSimulacion === 0) return;

    const timer = window.setInterval(() => {
      setEstado((prev) => {
        if (prev.velocidadSimulacion === 0) return prev;
        const hayActivos = prev.tickets.some(
          (t) => t.estado !== 'Resuelto' && !t.slaPausado
        );
        if (!hayActivos) return prev;

        const deltaSeg = prev.velocidadSimulacion;
        let evalActual = prev.evaluacion;

        const ticketsActualizados = prev.tickets.map((t) => {
          if (t.estado === 'Resuelto' || t.slaPausado) return t;
          const transcurridoSeg = t.slaTranscurridoSeg + deltaSeg;
          const incumplido = transcurridoSeg > t.slaObjetivoSeg;
          let historyLog = t.historyLog;
          if (!t.slaIncumplido && incumplido) {
            evalActual = registrarEventoEvaluacion(evalActual, {
              delta: -15,
              concepto: `SLA vencido en incidente ${t.prioridad}`,
              referenciaId: t.id,
              tipo: 'sla_vencido',
            });
            historyLog = [
              ...t.historyLog,
              crearEventoHistorial({
                tipo: 'sla_incumplido',
                actor: 'Monitor SLA',
                accion: `SLA incumplido (objetivo ${t.slaObjetivoMin} min)`,
                detalle: `Tiempo transcurrido: ${Math.floor(transcurridoSeg / 60)}m ${transcurridoSeg % 60}s sin resolución.`,
                simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
              }),
            ];
          }
          return {
            ...t,
            slaTranscurridoSeg: transcurridoSeg,
            slaTranscurridoMin: Math.floor(transcurridoSeg / 60),
            slaIncumplido: incumplido,
            historyLog,
          };
        });

        const metricas = recalcularMetricas(
          ticketsActualizados,
          prev.problemas,
          prev.simulacionMinutosAvanzados,
          prev.rfcs,
          prev.articulosKb
        );

        return {
          ...prev,
          tickets: ticketsActualizados,
          evaluacion: evalActual,
          metricas,
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [estado.velocidadSimulacion]);

  const actualizarEstado = useCallback(
    (
      updater: (prev: ServiceDeskGlobalState) => {
        tickets: Ticket[];
        problemas: Problema[];
        rfcs?: SolicitudCambioRfc[];
        articulosKb?: ArticuloKb[];
        evaluacion?: EvaluacionAlumno;
        simulacionMinutosAvanzados?: number;
        velocidadSimulacion?: VelocidadSimulacion;
        politicaEscaladoSla?: PoliticaEscaladoSla;
        rolActivo?: RolSimulador;
      }
    ) => {
      setEstado((prev) => {
        const next = updater(prev);
        const mins =
          next.simulacionMinutosAvanzados ?? prev.simulacionMinutosAvanzados;
        const vel = next.velocidadSimulacion ?? prev.velocidadSimulacion;
        const pol = next.politicaEscaladoSla ?? prev.politicaEscaladoSla;
        const rol = next.rolActivo ?? prev.rolActivo;
        const evalFinal = next.evaluacion ?? prev.evaluacion;
        const rfcsFinal = next.rfcs ?? prev.rfcs;
        const kbFinal = next.articulosKb ?? prev.articulosKb;
        const metricas = recalcularMetricas(
          next.tickets,
          next.problemas,
          mins,
          rfcsFinal,
          kbFinal
        );
        return {
          ...prev,
          tickets: next.tickets,
          problemas: next.problemas,
          rfcs: rfcsFinal,
          articulosKb: kbFinal,
          evaluacion: evalFinal,
          simulacionMinutosAvanzados: mins,
          velocidadSimulacion: vel,
          politicaEscaladoSla: pol,
          rolActivo: rol,
          metricas,
        };
      });
    },
    []
  );

  const handleAvanzarSla = (minutos: number) => {
    const deltaSeg = minutos * 60;
    actualizarEstado((prev) => {
      let evalActual = prev.evaluacion;
      const ticketsActualizados = prev.tickets.map((t) => {
        if (t.estado === 'Resuelto' || t.slaPausado) return t;
        const transcurridoSeg = t.slaTranscurridoSeg + deltaSeg;
        const incumplido = transcurridoSeg > t.slaObjetivoSeg;
        let historyLog = t.historyLog;
        if (!t.slaIncumplido && incumplido) {
          evalActual = registrarEventoEvaluacion(evalActual, {
            delta: -15,
            concepto: `SLA vencido en incidente ${t.prioridad}`,
            referenciaId: t.id,
            tipo: 'sla_vencido',
          });
          historyLog = [
            ...t.historyLog,
            crearEventoHistorial({
              tipo: 'sla_incumplido',
              actor: 'Monitor SLA',
              accion: `SLA incumplido al avanzar reloj (+${minutos}m)`,
              detalle: `Superado objetivo de ${t.slaObjetivoMin} min (${t.prioridad}).`,
              simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados + minutos,
            }),
          ];
        }
        return {
          ...t,
          slaTranscurridoSeg: transcurridoSeg,
          slaTranscurridoMin: Math.floor(transcurridoSeg / 60),
          slaIncumplido: incumplido,
          historyLog,
        };
      });
      return {
        tickets: ticketsActualizados,
        problemas: prev.problemas,
        evaluacion: evalActual,
        simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados + minutos,
      };
    });
  };

  const handleCambiarVelocidad = (velocidad: VelocidadSimulacion) => {
    actualizarEstado((prev) => ({
      tickets: prev.tickets,
      problemas: prev.problemas,
      velocidadSimulacion: velocidad,
    }));
  };

  const handleCambiarPoliticaEscalado = (politica: PoliticaEscaladoSla) => {
    actualizarEstado((prev) => ({
      tickets: prev.tickets,
      problemas: prev.problemas,
      politicaEscaladoSla: politica,
    }));
  };

  const handleCrearTicket = (
    nuevo: Omit<
      Ticket,
      'id' | 'creadoEn' | 'notasTecnicas' | 'slaPausado' | 'historyLog'
    > & {
      slaPausado?: boolean;
    },
    evaluarMatriz = true
  ) => {
    actualizarEstado((prev) => {
      const maxNum = prev.tickets.reduce((max, t) => {
        const parsed = parseInt(t.id.replace('INC-', ''), 10);
        return Number.isNaN(parsed) ? max : Math.max(max, parsed);
      }, 2040);
      const id = `INC-${maxNum + 1}`;
      const creado: Ticket = {
        ...nuevo,
        slaPausado: Boolean(nuevo.slaPausado),
        creadoPorUsuario:
          nuevo.creadoPorUsuario ?? prev.rolActivo === 'usuario',
        id,
        creadoEn: new Date().toISOString(),
        notasTecnicas: [
          {
            id: `NT-${Date.now()}`,
            autor: 'Sistema ITIL',
            fecha: new Date().toISOString(),
            tipo: 'Sistema',
            texto: `Ticket ${id} recibido vía ${nuevo.canalEntrada} y clasificado como ${nuevo.prioridad} (SLA ${nuevo.slaObjetivoMin} min).`,
          },
        ],
        historyLog: [
          crearEventoHistorial({
            tipo: 'creacion',
            actor: nuevo.solicitante || 'Mesa N1',
            accion: `Ticket creado vía ${nuevo.canalEntrada} · ${nuevo.prioridad}`,
            detalle: `Asignado a ${nuevo.asignadoA} · CI: ${nuevo.ciAfectado} · SLA: ${nuevo.slaObjetivoMin} min.`,
            simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
          }),
        ],
      };

      let evalActual = prev.evaluacion;
      if (evaluarMatriz) {
        const resMatriz = evaluarClasificacionMatriz({
          titulo: nuevo.titulo,
          descripcion: nuevo.descripcion,
          categoria: nuevo.categoria,
          prioridad: nuevo.prioridad,
        });
        evalActual = registrarEventoEvaluacion(evalActual, {
          delta: resMatriz.delta,
          concepto: resMatriz.motivo,
          referenciaId: id,
          tipo: 'clasificacion',
        });
      }

      return {
        tickets: [creado, ...prev.tickets],
        problemas: prev.problemas,
        evaluacion: evalActual,
      };
    });
  };

  const handleSimularIncidenteP1 = () => {
    const idx = estado.tickets.length % PLANTILLAS_P1.length;
    const tpl = PLANTILLAS_P1[idx];
    handleCrearTicket(
      {
        titulo: tpl.titulo,
        descripcion: tpl.descripcion,
        canalEntrada: 'Monitorización',
        estado: 'Escalado (N2)',
        nivel: 'N2',
        prioridad: 'P1 - Crítica',
        impacto: 'Alto',
        urgencia: 'Alta',
        categoria: tpl.categoria,
        ciAfectado: tpl.ciAfectado,
        solicitante: tpl.solicitante,
        asignadoA: asignarEquipoN2PorCategoria(tpl.categoria),
        slaObjetivoMin: 15,
        slaTranscurridoMin: 0,
        slaObjetivoSeg: 15 * 60,
        slaTranscurridoSeg: 0,
        slaPausado: false,
        slaIncumplido: false,
        problemaVinculadoId: null,
      },
      false
    );
  };

  const handleEscalarN2 = (ticketId: string) => {
    actualizarEstado((prev) => {
      const politica = prev.politicaEscaladoSla;
      return {
        tickets: prev.tickets.map((t) => {
          if (t.id !== ticketId) return t;
          const equipoN2 = asignarEquipoN2PorCategoria(t.categoria);
          const reiniciar = politica === 'reiniciar';
          return {
            ...t,
            nivel: 'N2',
            estado: 'Escalado (N2)',
            asignadoA: equipoN2,
            slaTranscurridoSeg: reiniciar ? 0 : t.slaTranscurridoSeg,
            slaTranscurridoMin: reiniciar ? 0 : t.slaTranscurridoMin,
            slaIncumplido: reiniciar ? false : t.slaIncumplido,
            slaPausado: !reiniciar,
            notasTecnicas: [
              ...t.notasTecnicas,
              {
                id: `NT-${Date.now()}`,
                autor: t.asignadoA,
                fecha: new Date().toISOString(),
                tipo: 'Escalado',
                texto: reiniciar
                  ? `Escalado a ${equipoN2}. Política aplicada: cronómetro SLA reiniciado por transferencia OLA N2.`
                  : `Escalado a ${equipoN2}. Política aplicada: cronómetro SLA pausado hasta inicio de triaje N2.`,
              },
            ],
            historyLog: [
              ...t.historyLog,
              crearEventoHistorial({
                tipo: 'escalado_n2',
                actor: t.asignadoA,
                accion: `Escalado de N1 a ${equipoN2}`,
                detalle: reiniciar
                  ? 'Estado actualizado a Escalado (N2) · SLA reiniciado por política OLA.'
                  : 'Estado actualizado a Escalado (N2) · SLA pausado hasta triaje N2.',
                simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
              }),
            ],
          };
        }),
        problemas: prev.problemas,
      };
    });
  };

  const handleReanudarSla = (ticketId: string) => {
    actualizarEstado((prev) => ({
      tickets: prev.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              slaPausado: false,
              notasTecnicas: [
                ...t.notasTecnicas,
                {
                  id: `NT-${Date.now()}`,
                  autor: t.asignadoA,
                  fecha: new Date().toISOString(),
                  tipo: 'Sistema',
                  texto: 'Triaje N2 iniciado: cronómetro SLA reanudado.',
                },
              ],
              historyLog: [
                ...t.historyLog,
                crearEventoHistorial({
                  tipo: 'sla_reanudado',
                  actor: t.asignadoA,
                  accion: 'Cronómetro SLA reanudado',
                  detalle: 'Inicio efectivo de diagnóstico en Nivel 2.',
                  simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                }),
              ],
            }
          : t
      ),
      problemas: prev.problemas,
    }));
  };

  const ejecutarCierreTicket = (ticketId: string, informe?: InformeCierre) => {
    actualizarEstado((prev) => {
      const target = prev.tickets.find((t) => t.id === ticketId);
      if (!target || target.estado === 'Resuelto') {
        return { tickets: prev.tickets, problemas: prev.problemas };
      }

      let evalActual = prev.evaluacion;
      const prbVinculado = prev.problemas.find(
        (p) => p.id === target.problemaVinculadoId
      );

      // SLA reward if resolved on time
      if (!target.slaIncumplido) {
        evalActual = registrarEventoEvaluacion(evalActual, {
          delta: 15,
          concepto: `Incidente resuelto dentro de SLA (${target.prioridad})`,
          referenciaId: target.id,
          tipo: 'sla_cumplido',
        });
      }

      // Penalty if P1 Critical ticket closed without documented root cause
      if (target.prioridad === 'P1 - Crítica') {
        const tieneCausaRaiz = Boolean(
          informe?.causaRaizDocumentada?.trim() ||
            prbVinculado?.causaRaiz?.trim() ||
            (prbVinculado && evaluarEstadoRca(prbVinculado).rcaValido)
        );
        if (!tieneCausaRaiz) {
          evalActual = registrarEventoEvaluacion(evalActual, {
            delta: -25,
            concepto: 'Cierre de ticket P1 Crítica sin documentar causa raíz',
            referenciaId: target.id,
            tipo: 'cierre_sin_rca',
          });
        } else {
          evalActual = registrarEventoEvaluacion(evalActual, {
            delta: 15,
            concepto: 'Cierre de ticket P1 Crítica con causa raíz documentada',
            referenciaId: target.id,
            tipo: 'rca_completo',
          });
        }
      }

      return {
        tickets: prev.tickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                estado: 'Resuelto',
                slaPausado: false,
                informeCierre: informe ?? t.informeCierre,
                notasTecnicas: [
                  ...t.notasTecnicas,
                  {
                    id: `NT-${Date.now()}`,
                    autor: t.asignadoA,
                    fecha: new Date().toISOString(),
                    tipo: 'Sistema',
                    texto: informe
                      ? `Incidente resuelto con Informe de Cierre. Workaround: "${informe.workaround}". Solución definitiva: "${informe.solucionDefinitiva}".`
                      : 'Incidente resuelto y cronómetro SLA detenido.',
                  },
                ],
                historyLog: [
                  ...t.historyLog,
                  crearEventoHistorial({
                    tipo: 'cierre',
                    actor: t.asignadoA,
                    accion: 'Incidente resuelto y cerrado',
                    detalle: informe
                      ? `Workaround: ${informe.workaround} · Solución: ${informe.solucionDefinitiva}`
                      : `Estado cambiado de "${t.estado}" a "Resuelto" dentro de flujo estándar.`,
                    simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                  }),
                ],
              }
            : t
        ),
        problemas: prev.problemas,
        evaluacion: evalActual,
      };
    });
  };

  // Intercepts P1 / P2 resolution to require Closure Report (Workaround + Solución Definitiva)
  const handleSolicitarResolucionTicket = (ticketId: string) => {
    const ticket = estado.tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.estado === 'Resuelto') return;

    const esIncidenciaMayor =
      ticket.prioridad === 'P1 - Crítica' || ticket.prioridad === 'P2 - Alta';
    if (esIncidenciaMayor) {
      setTicketParaCierreMayorId(ticketId);
      return;
    }

    ejecutarCierreTicket(ticketId);
  };

  const handleResolverConKb = (ticketId: string, articuloId: string) => {
    actualizarEstado((prev) => {
      const target = prev.tickets.find((t) => t.id === ticketId);
      const articulo = prev.articulosKb.find((a) => a.id === articuloId);
      if (!target || !articulo || target.estado === 'Resuelto') {
        return { tickets: prev.tickets, problemas: prev.problemas };
      }

      const articuloCorrecto = esArticuloKbCorrectoParaTicket(target, articulo);
      const enNivel1 = target.nivel === 'N1';
      const enTiempoFcr = target.slaTranscurridoSeg < 180;
      const fcrCumplido = enNivel1 && enTiempoFcr && articuloCorrecto;

      let evalActual = prev.evaluacion;
      if (fcrCumplido) {
        evalActual = registrarEventoEvaluacion(evalActual, {
          delta: 25,
          concepto: `FCR cumplido en N1 (< 3 min) usando ${articulo.id}`,
          referenciaId: target.id,
          tipo: 'fcr_cumplido',
        });
      } else if (!target.slaIncumplido) {
        evalActual = registrarEventoEvaluacion(evalActual, {
          delta: 15,
          concepto: `Incidente resuelto con KEDB dentro de SLA (${target.prioridad})`,
          referenciaId: target.id,
          tipo: 'sla_cumplido',
        });
      }

      const motivoNoFcr = !enNivel1
        ? 'ticket ya escalado a N2'
        : !enTiempoFcr
          ? 'superó el umbral FCR de 3 min simulados'
          : !articuloCorrecto
            ? 'el artículo seleccionado no coincide con la sintomatología del incidente'
            : '';

      const notaTexto = fcrCumplido
        ? `FCR CUMPLIDO: Resuelto en N1 en ${Math.floor(
            target.slaTranscurridoSeg / 60
          )}m ${String(target.slaTranscurridoSeg % 60).padStart(
            2,
            '0'
          )}s aplicando ${articulo.id} ("${articulo.titulo}").`
        : `Incidente resuelto consultando ${articulo.id} ("${articulo.titulo}"). FCR no contabilizado (${motivoNoFcr}).`;

      return {
        tickets: prev.tickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                estado: 'Resuelto' as const,
                slaPausado: false,
                fcrCumplido,
                kbAplicadoId: articulo.id,
                informeCierre: t.informeCierre ?? {
                  workaround: `Aplicado procedimiento KEDB ${articulo.id}`,
                  solucionDefinitiva: articulo.procedimiento,
                  fechaCierre: new Date().toISOString(),
                },
                notasTecnicas: [
                  ...t.notasTecnicas,
                  {
                    id: `NT-${Date.now()}`,
                    autor: t.asignadoA,
                    fecha: new Date().toISOString(),
                    tipo: 'Sistema' as const,
                    texto: notaTexto,
                  },
                ],
                historyLog: [
                  ...t.historyLog,
                  crearEventoHistorial({
                    tipo: 'kb_aplicado',
                    actor: t.asignadoA,
                    accion: fcrCumplido
                      ? `Resuelto con ${articulo.id} (FCR Cumplido < 3 min)`
                      : `Resuelto consultando artículo ${articulo.id}`,
                    detalle: articulo.titulo,
                    simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                  }),
                  crearEventoHistorial({
                    tipo: 'cierre',
                    actor: t.asignadoA,
                    accion: 'Ticket cerrado mediante Base de Conocimiento (KEDB)',
                    detalle: `Estado cambiado de "${t.estado}" a "Resuelto".`,
                    simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                  }),
                ],
              }
            : t
        ),
        problemas: prev.problemas,
        articulosKb: prev.articulosKb.map((a) =>
          a.id === articulo.id
            ? { ...a, usosFcr: a.usosFcr + (fcrCumplido ? 1 : 0) }
            : a
        ),
        evaluacion: evalActual,
      };
    });
  };

  const handleCrearArticuloKb = (nuevo: {
    titulo: string;
    categoria: string;
    keywords: string[];
    sintoma: string;
    procedimiento: string;
  }) => {
    actualizarEstado((prev) => {
      const maxNum = prev.articulosKb.reduce((max, a) => {
        const parsed = parseInt(a.id.replace('KB-', ''), 10);
        return Number.isNaN(parsed) ? max : Math.max(max, parsed);
      }, 5);
      const id = `KB-${String(maxNum + 1).padStart(3, '0')}`;
      const creado: ArticuloKb = {
        id,
        titulo: nuevo.titulo,
        categoria: nuevo.categoria,
        keywords: nuevo.keywords,
        sintoma: nuevo.sintoma,
        procedimiento: nuevo.procedimiento,
        origen: 'Manual',
        fechaPublicacion: new Date().toISOString(),
        usosFcr: 0,
      };
      return {
        tickets: prev.tickets,
        problemas: prev.problemas,
        articulosKb: [creado, ...prev.articulosKb],
      };
    });
  };

  const handleActualizarTicket = (
    ticketId: string,
    cambios: Partial<Ticket>,
    notaAutomatica?: Omit<NotaTecnica, 'id' | 'fecha'>
  ) => {
    actualizarEstado((prev) => {
      const target = prev.tickets.find((t) => t.id === ticketId);
      if (!target) return { tickets: prev.tickets, problemas: prev.problemas };

      const nuevosEventosTicket: HistoryLogEntry[] = [];
      let problemasActualizados = prev.problemas;

      if (cambios.estado && cambios.estado !== target.estado) {
        nuevosEventosTicket.push(
          crearEventoHistorial({
            tipo: 'cambio_estado',
            actor: target.asignadoA || 'Analista N1/N2',
            accion: `Estado cambiado a "${cambios.estado}"`,
            detalle: `Transición desde "${target.estado}".`,
            simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
          })
        );
      }

      if (cambios.ciAfectado && cambios.ciAfectado !== target.ciAfectado) {
        nuevosEventosTicket.push(
          crearEventoHistorial({
            tipo: 'ci_asociado',
            actor: target.asignadoA || 'Analista N1/N2',
            accion: `CI asociado en CMDB: ${cambios.ciAfectado}`,
            detalle: `CI anterior: ${target.ciAfectado}.`,
            simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
          })
        );
      }

      if (
        cambios.problemaVinculadoId !== undefined &&
        cambios.problemaVinculadoId !== target.problemaVinculadoId
      ) {
        const nuevoPrbId = cambios.problemaVinculadoId;
        nuevosEventosTicket.push(
          crearEventoHistorial({
            tipo: 'problema_vinculado',
            actor: target.asignadoA || 'Analista N2',
            accion: nuevoPrbId
              ? `Vinculado al Problema ${nuevoPrbId}`
              : `Desvinculado del Problema ${target.problemaVinculadoId}`,
            simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
          })
        );

        problemasActualizados = prev.problemas.map((p) => {
          if (nuevoPrbId && p.id === nuevoPrbId) {
            return {
              ...p,
              historyLog: [
                ...p.historyLog,
                crearEventoHistorial({
                  tipo: 'problema_vinculado',
                  actor: target.asignadoA || 'Analista N2',
                  accion: `Incidencia ${target.id} vinculada al Problema`,
                  detalle: target.titulo,
                  simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                }),
              ],
            };
          }
          if (
            target.problemaVinculadoId &&
            p.id === target.problemaVinculadoId
          ) {
            return {
              ...p,
              historyLog: [
                ...p.historyLog,
                crearEventoHistorial({
                  tipo: 'problema_vinculado',
                  actor: target.asignadoA || 'Analista N2',
                  accion: `Incidencia ${target.id} desvinculada`,
                  simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                }),
              ],
            };
          }
          return p;
        });
      }

      const notas = notaAutomatica
        ? [
            ...target.notasTecnicas,
            {
              ...notaAutomatica,
              id: `NT-${Date.now()}`,
              fecha: new Date().toISOString(),
            },
          ]
        : target.notasTecnicas;

      return {
        tickets: prev.tickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                ...cambios,
                notasTecnicas: notas,
                historyLog: [...t.historyLog, ...nuevosEventosTicket],
              }
            : t
        ),
        problemas: problemasActualizados,
      };
    });
  };

  const handleAgregarNota = (
    ticketId: string,
    nota: Omit<NotaTecnica, 'id' | 'fecha'>
  ) => {
    actualizarEstado((prev) => ({
      tickets: prev.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              notasTecnicas: [
                ...t.notasTecnicas,
                {
                  ...nota,
                  id: `NT-${Date.now()}`,
                  fecha: new Date().toISOString(),
                },
              ],
              historyLog: [
                ...t.historyLog,
                crearEventoHistorial({
                  tipo: 'nota_tecnica',
                  actor: nota.autor,
                  accion: `Nota registrada (${nota.tipo})`,
                  detalle: nota.texto,
                  simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                }),
              ],
            }
          : t
      ),
      problemas: prev.problemas,
    }));
  };

  const handleCrearProblema = (nuevo: {
    titulo: string;
    descripcion: string;
    categoria: string;
    ciAfectado: string;
    prioridad: TicketPrioridad;
    workaround: string;
  }) => {
    actualizarEstado((prev) => {
      const maxNum = prev.problemas.reduce((max, p) => {
        const parsed = parseInt(p.id.replace('PRB-', ''), 10);
        return Number.isNaN(parsed) ? max : Math.max(max, parsed);
      }, 110);
      const id = `PRB-${String(maxNum + 1).padStart(4, '0')}`;
      const estadoInicial = nuevo.workaround
        ? 'Error Conocido (KEDB)'
        : 'Investigación';
      const problema: Problema = {
        id,
        titulo: nuevo.titulo,
        descripcion: nuevo.descripcion,
        estado: estadoInicial,
        prioridad: nuevo.prioridad,
        categoria: nuevo.categoria,
        ciAfectado: nuevo.ciAfectado,
        responsable: 'Gestor de Problemas N2',
        creadoEn: new Date().toISOString(),
        workaround: nuevo.workaround,
        causaRaiz: '',
        analisis5Porques: ['', '', '', '', ''],
        ishikawa: crearIshikawaVacio(),
        historyLog: [
          crearEventoHistorial({
            tipo: 'creacion',
            actor: 'Gestor de Problemas N2',
            accion: `Problema ${id} creado (${nuevo.prioridad})`,
            detalle: `Estado inicial: ${estadoInicial} · CI: ${nuevo.ciAfectado}.`,
            simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
          }),
        ],
      };
      return {
        tickets: prev.tickets,
        problemas: [problema, ...prev.problemas],
      };
    });
  };

  const handleDeclararProblemaDesdeTickets = (payload: {
    titulo: string;
    descripcion: string;
    categoria: string;
    ciAfectado: string;
    prioridad: TicketPrioridad;
    workaround: string;
    ticketsIds: string[];
  }) => {
    actualizarEstado((prev) => {
      const maxNum = prev.problemas.reduce((max, p) => {
        const parsed = parseInt(p.id.replace('PRB-', ''), 10);
        return Number.isNaN(parsed) ? max : Math.max(max, parsed);
      }, 110);
      const problemaId = `PRB-${String(maxNum + 1).padStart(4, '0')}`;
      const estadoInicial = payload.workaround
        ? 'Error Conocido (KEDB)'
        : 'Investigación';
      const problema: Problema = {
        id: problemaId,
        titulo: payload.titulo,
        descripcion: payload.descripcion,
        estado: estadoInicial,
        prioridad: payload.prioridad,
        categoria: payload.categoria,
        ciAfectado: payload.ciAfectado,
        responsable: 'Gestor de Problemas N2',
        creadoEn: new Date().toISOString(),
        workaround: payload.workaround,
        causaRaiz: '',
        analisis5Porques: ['', '', '', '', ''],
        ishikawa: crearIshikawaVacio(),
        historyLog: [
          crearEventoHistorial({
            tipo: 'creacion',
            actor: 'Gestor de Problemas N2',
            accion: `Problema ${problemaId} declarado desde ${payload.ticketsIds.length} incidencia(s)`,
            detalle: `CI: ${payload.ciAfectado} · Vinculados: ${payload.ticketsIds.join(', ') || 'ninguno'}.`,
            simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
          }),
        ],
      };

      const ticketsActualizados = prev.tickets.map((t) => {
        if (!payload.ticketsIds.includes(t.id)) return t;
        return {
          ...t,
          problemaVinculadoId: problemaId,
          notasTecnicas: [
            ...t.notasTecnicas,
            {
              id: `NT-${Date.now()}-${t.id}`,
              autor: 'Gestor de Problemas N2',
              fecha: new Date().toISOString(),
              tipo: 'Sistema' as const,
              texto: `Incidente agrupado bajo el Problema Maestro ${problemaId} por sintomatología común.`,
            },
          ],
          historyLog: [
            ...t.historyLog,
            crearEventoHistorial({
              tipo: 'problema_vinculado',
              actor: 'Gestor de Problemas N2',
              accion: `Agrupado en Problema Maestro ${problemaId}`,
              detalle: payload.titulo,
              simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
            }),
          ],
        };
      });

      return {
        tickets: ticketsActualizados,
        problemas: [problema, ...prev.problemas],
      };
    });

    if (puedeVerVista(estado.rolActivo, 'problemas')) {
      setVistaActiva('problemas');
    }
  };

  const handleMitigarOCerrarProblema = (payload: {
    problemaId: string;
    nuevoEstado: 'Error Conocido (KEDB)' | 'Resuelto';
    workaround: string;
    solucionDefinitiva: string;
    cerrarHijasMasivamente: boolean;
    publicarEnKb?: boolean;
  }) => {
    actualizarEstado((prev) => {
      const target = prev.problemas.find((p) => p.id === payload.problemaId);
      const rcaStatus = target ? evaluarEstadoRca(target) : null;
      if (target && payload.nuevoEstado === 'Resuelto') {
        if (rcaStatus && rcaStatus.requiereRcaParaCerrar && !rcaStatus.rcaValido) {
          return {
            tickets: prev.tickets,
            problemas: prev.problemas,
          };
        }
        const rfcStatus = evaluarRfcParaProblema(target, prev.rfcs);
        if (
          rfcStatus.requiereRfcParaCerrar &&
          !rfcStatus.tieneRfcAprobadoOImplementado
        ) {
          return {
            tickets: prev.tickets,
            problemas: prev.problemas,
          };
        }
      }

      const informe: InformeCierre | undefined =
        payload.nuevoEstado === 'Resuelto'
          ? {
              workaround: payload.workaround,
              solucionDefinitiva: payload.solucionDefinitiva,
              causaRaizDocumentada: target?.causaRaiz || undefined,
              fechaCierre: new Date().toISOString(),
            }
          : undefined;

      const problemasActualizados = prev.problemas.map((p) => {
        if (p.id !== payload.problemaId) return p;
        return {
          ...p,
          estado: payload.nuevoEstado,
          workaround: payload.workaround || p.workaround,
          solucionDefinitiva:
            payload.solucionDefinitiva || p.solucionDefinitiva,
          informeCierre: informe ?? p.informeCierre,
          historyLog: [
            ...p.historyLog,
            crearEventoHistorial({
              tipo:
                payload.nuevoEstado === 'Resuelto' ? 'cierre' : 'cambio_estado',
              actor: p.responsable || 'Gestor de Problemas N2',
              accion:
                payload.nuevoEstado === 'Resuelto'
                  ? `Problema ${p.id} resuelto y cerrado`
                  : `Problema ${p.id} mitigado como Error Conocido (KEDB)`,
              detalle: payload.solucionDefinitiva
                ? `Workaround: ${payload.workaround} · Solución: ${payload.solucionDefinitiva}`
                : `Workaround: ${payload.workaround}`,
              simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
            }),
          ],
        };
      });

      const ticketsActualizados = payload.cerrarHijasMasivamente
        ? prev.tickets.map((t) => {
            if (
              t.problemaVinculadoId !== payload.problemaId ||
              t.estado === 'Resuelto'
            ) {
              return t;
            }
            return {
              ...t,
              estado: 'Resuelto' as const,
              slaPausado: false,
              informeCierre: informe ?? t.informeCierre,
              notasTecnicas: [
                ...t.notasTecnicas,
                {
                  id: `NT-${Date.now()}-${t.id}`,
                  autor: 'Gestor de Problemas N2',
                  fecha: new Date().toISOString(),
                  tipo: 'Solución Temporal' as const,
                  texto: `Cierre masivo desde ${payload.problemaId} (${payload.nuevoEstado}). Workaround: ${payload.workaround}${
                    payload.solucionDefinitiva
                      ? ` · Solución definitiva: ${payload.solucionDefinitiva}`
                      : ''
                  }`,
                },
              ],
              historyLog: [
                ...t.historyLog,
                crearEventoHistorial({
                  tipo: 'cierre',
                  actor: 'Gestor de Problemas N2',
                  accion: `Cierre masivo desde ${payload.problemaId}`,
                  detalle: `Estado cambiado a Resuelto · Workaround: ${payload.workaround}`,
                  simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                }),
              ],
            };
          })
        : prev.tickets;

      let articulosKbActualizados = prev.articulosKb;
      if (
        payload.nuevoEstado === 'Resuelto' &&
        payload.publicarEnKb &&
        target &&
        rcaStatus?.rcaValido
      ) {
        const yaExiste = prev.articulosKb.some(
          (a) => a.problemaOrigenId === target.id
        );
        if (!yaExiste) {
          const maxNum = prev.articulosKb.reduce((max, a) => {
            const parsed = parseInt(a.id.replace('KB-', ''), 10);
            return Number.isNaN(parsed) ? max : Math.max(max, parsed);
          }, 5);
          const kbId = `KB-${String(maxNum + 1).padStart(3, '0')}`;
          const nuevoArticulo: ArticuloKb = {
            id: kbId,
            titulo: `Resolución KEDB (${target.id}): ${target.titulo}`,
            categoria: target.categoria,
            keywords: extraerKeywordsDeProblema(target),
            sintoma: target.causaRaiz || target.descripcion,
            procedimiento: `Workaround: ${payload.workaround}. Solución definitiva: ${payload.solucionDefinitiva}`,
            origen: 'Problema N2',
            problemaOrigenId: target.id,
            fechaPublicacion: new Date().toISOString(),
            usosFcr: 0,
          };
          articulosKbActualizados = [nuevoArticulo, ...prev.articulosKb];
        }
      }

      return {
        tickets: ticketsActualizados,
        problemas: problemasActualizados,
        articulosKb: articulosKbActualizados,
      };
    });
  };

  const handleDesvincularTicket = (ticketId: string) => {
    actualizarEstado((prev) => {
      const target = prev.tickets.find((t) => t.id === ticketId);
      const prbId = target?.problemaVinculadoId;
      return {
        tickets: prev.tickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                problemaVinculadoId: null,
                historyLog: [
                  ...t.historyLog,
                  crearEventoHistorial({
                    tipo: 'problema_vinculado',
                    actor: 'Gestor de Problemas N2',
                    accion: `Desvinculado del Problema ${prbId ?? ''}`,
                    simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                  }),
                ],
              }
            : t
        ),
        problemas: prev.problemas.map((p) =>
          p.id === prbId
            ? {
                ...p,
                historyLog: [
                  ...p.historyLog,
                  crearEventoHistorial({
                    tipo: 'problema_vinculado',
                    actor: 'Gestor de Problemas N2',
                    accion: `Incidencia ${ticketId} desvinculada`,
                    simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                  }),
                ],
              }
            : p
        ),
      };
    });
  };

  const handleVincularTicket = (ticketId: string, problemaId: string) => {
    actualizarEstado((prev) => ({
      tickets: prev.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              problemaVinculadoId: problemaId,
              notasTecnicas: [
                ...t.notasTecnicas,
                {
                  id: `NT-${Date.now()}`,
                  autor: 'Gestor de Problemas N2',
                  fecha: new Date().toISOString(),
                  tipo: 'Sistema',
                  texto: `Vinculado al Problema Maestro ${problemaId}.`,
                },
              ],
              historyLog: [
                ...t.historyLog,
                crearEventoHistorial({
                  tipo: 'problema_vinculado',
                  actor: 'Gestor de Problemas N2',
                  accion: `Vinculado al Problema ${problemaId}`,
                  simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                }),
              ],
            }
          : t
      ),
      problemas: prev.problemas.map((p) =>
        p.id === problemaId
          ? {
              ...p,
              historyLog: [
                ...p.historyLog,
                crearEventoHistorial({
                  tipo: 'problema_vinculado',
                  actor: 'Gestor de Problemas N2',
                  accion: `Incidencia ${ticketId} vinculada al Problema`,
                  simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                }),
              ],
            }
          : p
      ),
    }));
  };

  const handleAsociarCiProblema = (problemaId: string, nuevoCi: string) => {
    actualizarEstado((prev) => ({
      tickets: prev.tickets,
      problemas: prev.problemas.map((p) => {
        if (p.id !== problemaId || p.ciAfectado === nuevoCi) return p;
        return {
          ...p,
          ciAfectado: nuevoCi,
          historyLog: [
            ...p.historyLog,
            crearEventoHistorial({
              tipo: 'ci_asociado',
              actor: p.responsable || 'Gestor de Problemas N2',
              accion: `CI asociado en CMDB: ${nuevoCi}`,
              detalle: `CI anterior: ${p.ciAfectado}.`,
              simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
            }),
          ],
        };
      }),
    }));
  };

  const handleGuardarRca = (
    problemaId: string,
    payload: {
      analisis5Porques: string[];
      causaRaiz: string;
      workaround: string;
      ishikawa: IshikawaDiagrama;
    }
  ) => {
    actualizarEstado((prev) => {
      let evalActual = prev.evaluacion;
      const problemasActualizados = prev.problemas.map((p) => {
        if (p.id !== problemaId) return p;
        const antes = evaluarEstadoRca(p).rcaValido;
        const actualizado: Problema = {
          ...p,
          analisis5Porques: payload.analisis5Porques,
          causaRaiz: payload.causaRaiz,
          workaround: payload.workaround,
          ishikawa: payload.ishikawa,
        };
        const despues = evaluarEstadoRca(actualizado).rcaValido;
        if (!antes && despues) {
          evalActual = registrarEventoEvaluacion(evalActual, {
            delta: 20,
            concepto: 'Análisis de Causa Raíz (RCA) completado',
            referenciaId: problemaId,
            tipo: 'rca_completo',
          });
        }
        const nuevoEstado =
          despues && p.estado === 'Investigación'
            ? 'Causa Raíz Identificada'
            : p.estado;
        return {
          ...actualizado,
          estado: nuevoEstado,
          historyLog: [
            ...p.historyLog,
            crearEventoHistorial({
              tipo: 'rca_actualizado',
              actor: p.responsable || 'Analista N2',
              accion: despues
                ? 'Análisis RCA guardado (válido para cierre)'
                : 'Avance de investigación RCA guardado',
              detalle: payload.causaRaiz
                ? `Causa raíz: ${payload.causaRaiz}`
                : 'Diagrama 4M / 5 Porqués actualizado.',
              simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
            }),
          ],
        };
      });

      return {
        tickets: prev.tickets,
        problemas: problemasActualizados,
        evaluacion: evalActual,
      };
    });
  };

  const handleDetenerEscenario = useCallback(() => {
    limpiarTimersEscenario();
    setEscenarioEnCurso(null);
  }, [limpiarTimersEscenario]);

  const handleIniciarEscenario = useCallback(
    (escenario: EscenarioSimulacion, limpiarColaPrevia: boolean) => {
      limpiarTimersEscenario();

      if (limpiarColaPrevia) {
        actualizarEstado((prev) => ({
          tickets: [],
          problemas: prev.problemas,
        }));
      }

      setEscenarioEnCurso({
        titulo: escenario.titulo,
        recibidos: 0,
        total: escenario.tickets.length,
        ultimoMensaje: 'Conectando líneas de atención N1/N2 y alertas SIEM...',
      });

      escenario.tickets.forEach((tpl, index) => {
        const timerId = window.setTimeout(() => {
          const { prioridad, slaObjetivoMin, slaObjetivoSeg } =
            calcularPrioridadITIL(tpl.impacto, tpl.urgencia);
          const esN2 = tpl.nivelInicial === 'N2';

          handleCrearTicket(
            {
              titulo: tpl.titulo,
              descripcion: tpl.descripcion,
              canalEntrada: tpl.canalEntrada,
              estado: esN2 ? 'Escalado (N2)' : 'Nuevo',
              nivel: tpl.nivelInicial,
              prioridad,
              impacto: tpl.impacto,
              urgencia: tpl.urgencia,
              categoria: tpl.categoria,
              ciAfectado: tpl.ciAfectado,
              solicitante: tpl.solicitante,
              asignadoA: esN2
                ? asignarEquipoN2PorCategoria(tpl.categoria)
                : 'Mesa N1 (Entrante)',
              slaObjetivoMin,
              slaTranscurridoMin: 0,
              slaObjetivoSeg,
              slaTranscurridoSeg: 0,
              slaPausado: false,
              slaIncumplido: false,
              problemaVinculadoId: null,
            },
            false
          );

          setEscenarioEnCurso({
            titulo: escenario.titulo,
            recibidos: index + 1,
            total: escenario.tickets.length,
            ultimoMensaje: `${tpl.canalEntrada} · ${tpl.solicitante}: ${tpl.titulo}`,
          });
        }, tpl.retrasoMs);

        timersEscenarioRef.current.push(timerId);
      });
    },
    [actualizarEstado, limpiarTimersEscenario]
  );

  const handleCrearRfc = (payload: {
    problemaId: string;
    ciAfectado: string;
    titulo: string;
    tipo: RfcTipo;
    riesgo: RfcRiesgo;
    planImplementacion: string;
    planRollback: string;
    ventanaMantenimiento: string;
  }) => {
    actualizarEstado((prev) => {
      const maxNum = prev.rfcs.reduce((max, r) => {
        const parsed = parseInt(r.id.replace('RFC-', ''), 10);
        return Number.isNaN(parsed) ? max : Math.max(max, parsed);
      }, 500);
      const id = `RFC-${String(maxNum + 1).padStart(4, '0')}`;
      const esNormal = payload.tipo === 'Normal';
      const nuevoRfc: SolicitudCambioRfc = {
        id,
        problemaId: payload.problemaId,
        ciAfectado: payload.ciAfectado,
        titulo: payload.titulo,
        tipo: payload.tipo,
        riesgo: payload.riesgo,
        estado: esNormal ? 'Pendiente Aprobación CAB' : 'Aprobado',
        planImplementacion: payload.planImplementacion,
        planRollback: payload.planRollback,
        ventanaMantenimiento: payload.ventanaMantenimiento,
        solicitante: 'Especialista N2',
        creadoEn: new Date().toISOString(),
        cabComentario: esNormal
          ? undefined
          : `Cambio ${payload.tipo} preautorizado con Plan de Implementación y Rollback verificados.`,
      };

      const evalActual = registrarEventoEvaluacion(prev.evaluacion, {
        delta: 10,
        concepto: `RFC (${payload.tipo}) documentado con Plan de Rollback`,
        referenciaId: id,
        tipo: 'rfc_aprobado',
      });

      return {
        tickets: prev.tickets,
        problemas: prev.problemas.map((p) =>
          p.id === payload.problemaId
            ? {
                ...p,
                historyLog: [
                  ...p.historyLog,
                  crearEventoHistorial({
                    tipo: 'rfc_vinculado',
                    actor: 'Especialista N2',
                    accion: `${id} (${payload.tipo}) creado sobre ${payload.ciAfectado}`,
                    detalle: payload.titulo,
                    simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                  }),
                ],
              }
            : p
        ),
        rfcs: [nuevoRfc, ...prev.rfcs],
        evaluacion: evalActual,
      };
    });

    setVistaActiva('cambios');
  };

  const handleSolicitarAprobacionCab = useCallback(
    (rfcId: string) => {
      actualizarEstado((prev) => ({
        tickets: prev.tickets,
        problemas: prev.problemas,
        rfcs: prev.rfcs.map((r) =>
          r.id === rfcId && r.estado === 'Pendiente Aprobación CAB'
            ? { ...r, estado: 'En Deliberación CAB', cabComentario: undefined }
            : r
        ),
      }));

      const tid = window.setTimeout(() => {
        actualizarEstado((prev) => {
          const target = prev.rfcs.find((r) => r.id === rfcId);
          if (!target) {
            return { tickets: prev.tickets, problemas: prev.problemas };
          }
          const decision = simularDecisionCab(target);
          const evalActual = registrarEventoEvaluacion(prev.evaluacion, {
            delta: decision.aprobado ? 20 : -10,
            concepto: decision.aprobado
              ? `RFC aprobado por el comité CAB (${target.riesgo})`
              : `RFC rechazado por el CAB (${target.riesgo}): revisar planes`,
            referenciaId: rfcId,
            tipo: decision.aprobado ? 'rfc_aprobado' : 'rfc_rechazado',
          });

          return {
            tickets: prev.tickets,
            problemas: prev.problemas.map((p) =>
              p.id === target.problemaId
                ? {
                    ...p,
                    historyLog: [
                      ...p.historyLog,
                      crearEventoHistorial({
                        tipo: 'rfc_vinculado',
                        actor: 'Comité CAB',
                        accion: decision.aprobado
                          ? `${rfcId} aprobado por el CAB`
                          : `${rfcId} rechazado por el CAB`,
                        detalle: decision.comentario,
                        simulacionMinutosAvanzados:
                          prev.simulacionMinutosAvanzados,
                      }),
                    ],
                  }
                : p
            ),
            evaluacion: evalActual,
            rfcs: prev.rfcs.map((r) =>
              r.id === rfcId
                ? {
                    ...r,
                    estado: decision.aprobado ? 'Aprobado' : 'Rechazado',
                    cabComentario: decision.comentario,
                    cabFechaDecision: new Date().toISOString(),
                  }
                : r
            ),
          };
        });
      }, 2600);

      timersCabRef.current.push(tid);
    },
    [actualizarEstado]
  );

  const handleActualizarPlanesRfc = (
    rfcId: string,
    payload: {
      planImplementacion: string;
      planRollback: string;
      riesgo: RfcRiesgo;
    }
  ) => {
    actualizarEstado((prev) => ({
      tickets: prev.tickets,
      problemas: prev.problemas,
      rfcs: prev.rfcs.map((r) =>
        r.id === rfcId
          ? {
              ...r,
              planImplementacion: payload.planImplementacion,
              planRollback: payload.planRollback,
              riesgo: payload.riesgo,
              estado: 'Pendiente Aprobación CAB',
              cabComentario: undefined,
            }
          : r
      ),
    }));
  };

  const handleImplementarRfc = (rfcId: string) => {
    actualizarEstado((prev) => {
      const target = prev.rfcs.find((r) => r.id === rfcId);
      if (!target || target.estado !== 'Aprobado') {
        return { tickets: prev.tickets, problemas: prev.problemas };
      }
      const evalActual = registrarEventoEvaluacion(prev.evaluacion, {
        delta: 10,
        concepto: `Cambio ejecutado en CMDB (${target.ciAfectado}) bajo RFC aprobado`,
        referenciaId: rfcId,
        tipo: 'rfc_aprobado',
      });
      return {
        tickets: prev.tickets,
        problemas: prev.problemas.map((p) =>
          p.id === target.problemaId
            ? {
                ...p,
                historyLog: [
                  ...p.historyLog,
                  crearEventoHistorial({
                    tipo: 'rfc_vinculado',
                    actor: 'Especialista N2',
                    accion: `${rfcId} implementado en CMDB (${target.ciAfectado})`,
                    simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                  }),
                ],
              }
            : p
        ),
        evaluacion: evalActual,
        rfcs: prev.rfcs.map((r) =>
          r.id === rfcId ? { ...r, estado: 'Implementado' } : r
        ),
      };
    });
  };

  const handleRegistrarInfraccionSinRfc = (problemaId: string) => {
    actualizarEstado((prev) => ({
      tickets: prev.tickets,
      problemas: prev.problemas,
      evaluacion: registrarEventoEvaluacion(prev.evaluacion, {
        delta: -35,
        concepto:
          'Penalización grave: intento de cierre P1 en CMDB sin RFC aprobado',
        referenciaId: problemaId,
        tipo: 'cierre_sin_rfc',
      }),
    }));
  };

  const handleResetEstado = () => {
    limpiarTimersEscenario();
    limpiarTimersCab();
    setEscenarioEnCurso(null);
    setProblemaParaRfc(null);
    const inicial = crearEstadoInicial();
    setEstado(inicial);
    setVistaActiva(vistaInicialParaRol(inicial.rolActivo));
    setTicketSeleccionadoId(null);
    setDrawerAbrirKb(false);
    setTicketParaCierreMayorId(null);
    setReporteContexto(null);
    setCategoriaFiltro('');
    setProblemaRcaId(inicial.problemas[0]?.id ?? 'PRB-0108');
    lanzarToast(
      'info',
      'Simulador restaurado',
      'Se han restablecido los registros y métricas iniciales.'
    );
  };

  const handleExportarJson = () => {
    try {
      const contenido = JSON.stringify(estado, null, 2);
      const blob = new Blob([contenido], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      const fecha = new Date().toISOString().slice(0, 10);
      enlace.href = url;
      enlace.download = `servicedesklab-sesion-${fecha}.json`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
      lanzarToast(
        'success',
        'Sesión exportada (.json)',
        'Archivo listo para entregar o respaldar tu práctica ITIL v4.'
      );
    } catch {
      lanzarToast(
        'error',
        'No se pudo exportar la sesión',
        'El navegador bloqueó la descarga local.'
      );
    }
  };

  const handleImportarJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const texto = typeof reader.result === 'string' ? reader.result : '';
      const resultado = validarEImportarEstadoJson(texto);
      if (!resultado.ok) {
        lanzarToast('error', 'Error al importar JSON', resultado.error);
        return;
      }
      limpiarTimersEscenario();
      limpiarTimersCab();
      setEscenarioEnCurso(null);
      setEstado(resultado.estado);
      setVistaActiva((vistaActual) =>
        puedeVerVista(resultado.estado.rolActivo, vistaActual)
          ? vistaActual
          : vistaInicialParaRol(resultado.estado.rolActivo)
      );
      setTicketSeleccionadoId(null);
      lanzarToast(
        'success',
        'Sesión restaurada desde JSON',
        `${resultado.estado.tickets.length} tickets y ${resultado.estado.problemas.length} problemas cargados.`
      );
    };
    reader.readAsText(file);
  };

  const handleEnviarCsat = (
    ticketId: string,
    puntuacion: 1 | 2 | 3 | 4 | 5,
    comentario?: string
  ) => {
    actualizarEstado((prev) => ({
      tickets: prev.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              csatPuntuacion: puntuacion,
              csatComentario: comentario || undefined,
              historyLog: [
                ...t.historyLog,
                crearEventoHistorial({
                  tipo: 'csat_recibido',
                  actor: t.solicitante || 'Usuario Final',
                  accion: `Encuesta CSAT recibida: ${puntuacion}/5 estrellas`,
                  detalle: comentario || 'Sin comentarios adicionales.',
                  simulacionMinutosAvanzados: prev.simulacionMinutosAvanzados,
                }),
              ],
            }
          : t
      ),
      problemas: prev.problemas,
    }));
    lanzarToast(
      'success',
      `Valoración CSAT registrada (${puntuacion}/5)`,
      `Gracias por evaluar la atención de ${ticketId}.`
    );
  };

  const handleCambiarRol = (nuevoRol: RolSimulador) => {
    actualizarEstado((prev) => ({
      tickets: prev.tickets,
      problemas: prev.problemas,
      rolActivo: nuevoRol,
    }));
    setVistaActiva((vistaActual) =>
      puedeVerVista(nuevoRol, vistaActual)
        ? vistaActual
        : vistaInicialParaRol(nuevoRol)
    );
    const nombresRol: Record<RolSimulador, string> = {
      usuario: 'Portal de Usuario',
      n1: 'Técnico N1',
      n2: 'Especialista N2/N3',
      sdm: 'Service Delivery Manager (SDM)',
    };
    lanzarToast('info', `Perfil cambiado a ${nombresRol[nuevoRol]}`);
  };

  const handleAbrirNuevoTicketConPrefill = (prefill?: PrefillNuevoTicket) => {
    setPrefillNuevoTicket(prefill ?? null);
    setModalNuevoTicketAbierto(true);
  };

  const handleNavegar = (vista: VistaActiva, filtroCategoria?: string) => {
    const destino = puedeVerVista(estado.rolActivo, vista)
      ? vista
      : vistaInicialParaRol(estado.rolActivo);
    setVistaActiva(destino);
    if (filtroCategoria !== undefined) {
      setCategoriaFiltro(filtroCategoria);
    } else if (destino !== 'tickets') {
      setCategoriaFiltro('');
    }
  };

  const ticketSeleccionado =
    estado.tickets.find((t) => t.id === ticketSeleccionadoId) ?? null;

  const ticketParaCierreMayor =
    estado.tickets.find((t) => t.id === ticketParaCierreMayorId) ?? null;
  const problemaParaCierreMayor = ticketParaCierreMayor?.problemaVinculadoId
    ? estado.problemas.find(
        (p) => p.id === ticketParaCierreMayor.problemaVinculadoId
      ) ?? null
    : null;

  return (
    <>
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-white"
      >
        Saltar al contenido principal
      </a>

      <div className="no-print flex min-h-screen bg-[#0B0F17] text-slate-100">
        <Sidebar
          vistaActiva={vistaActiva}
          rolActivo={estado.rolActivo}
          onCambiarVista={(v) => handleNavegar(v)}
          metricas={estado.metricas}
          onResetEstado={handleResetEstado}
          onExportarJson={handleExportarJson}
          onImportarJson={handleImportarJson}
          abiertoMovil={menuMovilAbierto}
          onCerrarMovil={() => setMenuMovilAbierto(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            vistaActiva={vistaActiva}
            rolActivo={estado.rolActivo}
            onCambiarRol={handleCambiarRol}
            onAbrirMenuMovil={() => setMenuMovilAbierto(true)}
            onAbrirNuevoTicket={() => handleAbrirNuevoTicketConPrefill()}
            onAbrirGuiaItil={() => setModalGuiaItilAbierto(true)}
          />

          <main
            id="contenido-principal"
            tabIndex={-1}
            className="flex-1 p-4 sm:p-6 lg:p-8 focus:outline-none"
          >
            <div className="mx-auto max-w-[1440px] space-y-5">
              {escenarioEnCurso && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`flex flex-col gap-3 rounded-xl border border-blue-500/40 bg-blue-950/30 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between ${
                    estado.rolActivo === 'usuario' ? 'hidden' : ''
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2 font-semibold text-blue-300">
                      <i
                        className={`fa-solid ${
                          escenarioEnCurso.recibidos < escenarioEnCurso.total
                            ? 'fa-phone-volume motion-safe:animate-pulse'
                            : 'fa-circle-check text-emerald-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span>
                        Escenario: {escenarioEnCurso.titulo} (
                        {escenarioEnCurso.recibidos}/{escenarioEnCurso.total}{' '}
                        entradas)
                      </span>
                    </div>
                    <p className="truncate text-slate-200">
                      {escenarioEnCurso.ultimoMensaje}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {vistaActiva !== 'tickets' &&
                      puedeVerVista(estado.rolActivo, 'tickets') && (
                        <button
                          type="button"
                          onClick={() => handleNavegar('tickets')}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 whitespace-nowrap"
                        >
                          Ir a Cola de Tickets
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={handleDetenerEscenario}
                      className="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap"
                    >
                      {escenarioEnCurso.recibidos < escenarioEnCurso.total
                        ? 'Detener simulación'
                        : 'Ocultar aviso'}
                    </button>
                  </div>
                </div>
              )}

              {/* Role-conditioned Views using Tailwind hidden */}
              <div
                className={
                  vistaActiva === 'portal' &&
                  puedeVerVista(estado.rolActivo, 'portal')
                    ? ''
                    : 'hidden'
                }
              >
                <UserPortalView
                  tickets={estado.tickets}
                  onAbrirNuevoTicket={handleAbrirNuevoTicketConPrefill}
                  onSeleccionarTicket={(id) => {
                    setDrawerAbrirKb(false);
                    setTicketSeleccionadoId(id);
                  }}
                  onEnviarCsat={handleEnviarCsat}
                />
              </div>

              <div
                className={
                  vistaActiva === 'dashboard' &&
                  puedeVerVista(estado.rolActivo, 'dashboard')
                    ? ''
                    : 'hidden'
                }
              >
                <DashboardView
                  tickets={estado.tickets}
                  problemas={estado.problemas}
                  metricas={estado.metricas}
                  evaluacion={estado.evaluacion}
                  rolActivo={estado.rolActivo}
                  simulacionMinutosAvanzados={estado.simulacionMinutosAvanzados}
                  escenarioEnCurso={escenarioEnCurso}
                  onAvanzarSla={handleAvanzarSla}
                  onSimularIncidenteP1={handleSimularIncidenteP1}
                  onAbrirEscenarios={() => setModalEscenariosAbierto(true)}
                  onDetenerEscenario={handleDetenerEscenario}
                  onExportarInforme={() =>
                    setReporteContexto({ tipo: 'general' })
                  }
                  onSeleccionarTicket={(id) => {
                    setDrawerAbrirKb(false);
                    setTicketSeleccionadoId(id);
                  }}
                  onEscalarN2={handleEscalarN2}
                  onNavegar={handleNavegar}
                />
              </div>

              <div
                className={
                  vistaActiva === 'tickets' &&
                  puedeVerVista(estado.rolActivo, 'tickets')
                    ? ''
                    : 'hidden'
                }
              >
                <TicketQueueView
                  tickets={estado.tickets}
                  categoriaInicial={categoriaFiltro}
                  velocidadSimulacion={estado.velocidadSimulacion}
                  politicaEscaladoSla={estado.politicaEscaladoSla}
                  onCambiarVelocidad={handleCambiarVelocidad}
                  onCambiarPoliticaEscalado={handleCambiarPoliticaEscalado}
                  onLimpiarCategoria={() => setCategoriaFiltro('')}
                  onSeleccionarTicket={(id) => {
                    setDrawerAbrirKb(false);
                    setTicketSeleccionadoId(id);
                  }}
                  onAbrirTicketConKb={(id) => {
                    setDrawerAbrirKb(true);
                    setTicketSeleccionadoId(id);
                  }}
                  onEscalarN2={handleEscalarN2}
                  onReanudarSla={handleReanudarSla}
                  onResolverRapido={handleSolicitarResolucionTicket}
                  onAbrirNuevoTicket={() => setModalNuevoTicketAbierto(true)}
                  onAbrirDeclararProblema={(ids) =>
                    setModalDeclararProblemaIds(ids)
                  }
                />
              </div>

              <div
                className={
                  vistaActiva === 'problemas' &&
                  puedeVerVista(estado.rolActivo, 'problemas')
                    ? ''
                    : 'hidden'
                }
              >
                <ProblemManagementView
                  problemas={estado.problemas}
                  tickets={estado.tickets}
                  rfcs={estado.rfcs}
                  onCrearProblema={handleCrearProblema}
                  onMitigarOCerrarProblema={handleMitigarOCerrarProblema}
                  onGuardarRca={handleGuardarRca}
                  onDesvincularTicket={handleDesvincularTicket}
                  onVincularTicket={handleVincularTicket}
                  onAsociarCiProblema={handleAsociarCiProblema}
                  onSeleccionarTicket={(id) => {
                    setDrawerAbrirKb(false);
                    setTicketSeleccionadoId(id);
                  }}
                  onAbrirRca={(id) => {
                    setProblemaRcaId(id);
                    handleNavegar('rca');
                  }}
                  onCrearRfcParaProblema={(prb) => setProblemaParaRfc(prb)}
                  onIrACambios={() => handleNavegar('cambios')}
                  onRegistrarInfraccionSinRfc={handleRegistrarInfraccionSinRfc}
                  onExportarInforme={(problemaId) =>
                    setReporteContexto({ tipo: 'problema', problemaId })
                  }
                />
              </div>

              <div
                className={
                  vistaActiva === 'rca' &&
                  puedeVerVista(estado.rolActivo, 'rca')
                    ? ''
                    : 'hidden'
                }
              >
                <RcaAnalysisView
                  problemas={estado.problemas}
                  problemaSeleccionadoId={problemaRcaId}
                  onSeleccionarProblema={(id) => setProblemaRcaId(id)}
                  onGuardarRca={handleGuardarRca}
                />
              </div>

              <div
                className={
                  vistaActiva === 'cambios' &&
                  puedeVerVista(estado.rolActivo, 'cambios')
                    ? ''
                    : 'hidden'
                }
              >
                <ChangeManagementView
                  rfcs={estado.rfcs}
                  problemas={estado.problemas}
                  onAbrirCrearRfc={(prb) => setProblemaParaRfc(prb)}
                  onSolicitarAprobacionCab={handleSolicitarAprobacionCab}
                  onActualizarPlanesRfc={handleActualizarPlanesRfc}
                  onImplementarRfc={handleImplementarRfc}
                />
              </div>

              <div
                className={
                  vistaActiva === 'cmdb' &&
                  puedeVerVista(estado.rolActivo, 'cmdb')
                    ? ''
                    : 'hidden'
                }
              >
                <CmdbView
                  tickets={estado.tickets}
                  problemas={estado.problemas}
                  rfcs={estado.rfcs}
                  onSeleccionarTicket={(id) => {
                    setDrawerAbrirKb(false);
                    setTicketSeleccionadoId(id);
                  }}
                  onIrAProblemas={() => handleNavegar('problemas')}
                  onIrACambios={() => handleNavegar('cambios')}
                  onCrearTicketEnCi={(prefill) =>
                    handleAbrirNuevoTicketConPrefill(prefill)
                  }
                />
              </div>

              <div
                className={
                  vistaActiva === 'kb' &&
                  puedeVerVista(estado.rolActivo, 'kb')
                    ? ''
                    : 'hidden'
                }
              >
                <KnowledgeBaseView
                  articulosKb={estado.articulosKb}
                  onCrearArticuloKb={handleCrearArticuloKb}
                />
              </div>
            </div>
          </main>
        </div>

        <NewTicketModal
          abierto={modalNuevoTicketAbierto}
          articulosKb={estado.articulosKb}
          prefill={prefillNuevoTicket}
          onCerrar={() => {
            setModalNuevoTicketAbierto(false);
            setPrefillNuevoTicket(null);
          }}
          onCrearTicket={(nuevo) => {
            handleCrearTicket({ ...nuevo, slaPausado: false }, true);
            lanzarToast(
              'success',
              'Ticket registrado en cola',
              `${nuevo.prioridad} · SLA ${nuevo.slaObjetivoMin} min`
            );
          }}
        />

        <DeclareProblemModal
          abierto={modalDeclararProblemaIds !== null}
          tickets={estado.tickets}
          idsIniciales={modalDeclararProblemaIds ?? []}
          onCerrar={() => setModalDeclararProblemaIds(null)}
          onDeclararProblema={handleDeclararProblemaDesdeTickets}
        />

        <TicketDrawer
          ticket={ticketSeleccionado}
          problemas={estado.problemas}
          articulosKb={estado.articulosKb}
          rolActivo={estado.rolActivo}
          abrirSelectorKbInicial={drawerAbrirKb}
          politicaEscaladoSla={estado.politicaEscaladoSla}
          onCerrar={() => {
            setTicketSeleccionadoId(null);
            setDrawerAbrirKb(false);
          }}
          onEscalarN2={handleEscalarN2}
          onReanudarSla={handleReanudarSla}
          onAbrirDeclararProblema={(ids) => setModalDeclararProblemaIds(ids)}
          onResolverTicket={handleSolicitarResolucionTicket}
          onResolverConKb={handleResolverConKb}
          onExportarInforme={(ticketId) =>
            setReporteContexto({ tipo: 'ticket', ticketId })
          }
          onActualizarTicket={handleActualizarTicket}
          onAgregarNota={handleAgregarNota}
        />

        <ClosureReportModal
          ticket={ticketParaCierreMayor}
          problemaVinculado={problemaParaCierreMayor}
          onCerrar={() => setTicketParaCierreMayorId(null)}
          onConfirmarCierre={(id, informe) => ejecutarCierreTicket(id, informe)}
        />

        <ScenarioModal
          abierto={modalEscenariosAbierto}
          onCerrar={() => setModalEscenariosAbierto(false)}
          onIniciarEscenario={handleIniciarEscenario}
        />

        <CreateRfcModal
          problema={problemaParaRfc}
          onCerrar={() => setProblemaParaRfc(null)}
          onCrearRfc={handleCrearRfc}
        />

        <ItilGuideModal
          abierto={modalGuiaItilAbierto}
          estado={estado}
          onCerrar={() => setModalGuiaItilAbierto(false)}
        />
      </div>

      <ToastContainer
        toasts={toasts}
        onDescartar={(id) =>
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }
      />

      <PrintableReportModal
        contexto={reporteContexto}
        tickets={estado.tickets}
        problemas={estado.problemas}
        metricas={estado.metricas}
        onCerrar={() => setReporteContexto(null)}
      />
    </>
  );
}
