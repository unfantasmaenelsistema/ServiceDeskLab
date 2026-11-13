export type TicketNivel = 'N1' | 'N2';

export type TicketEstado =
  | 'Nuevo'
  | 'En Progreso (N1)'
  | 'Escalado (N2)'
  | 'En Espera'
  | 'Resuelto';

export type TicketPrioridad =
  | 'P1 - Crítica'
  | 'P2 - Alta'
  | 'P3 - Media'
  | 'P4 - Baja';

export type ImpactoNivel = 'Alto' | 'Medio' | 'Bajo';
export type UrgenciaNivel = 'Alta' | 'Media' | 'Baja';

export type CanalEntrada =
  | 'Portal de Usuario'
  | 'Teléfono'
  | 'Monitorización'
  | 'Correo Corporativo';

export type VelocidadSimulacion = 0 | 1 | 10 | 60;

export type PoliticaEscaladoSla = 'reiniciar' | 'pausar';

export type RolSimulador = 'usuario' | 'n1' | 'n2' | 'sdm';

export interface InformeCierre {
  workaround: string;
  solucionDefinitiva: string;
  causaRaizDocumentada?: string;
  fechaCierre: string;
}

export interface NotaTecnica {
  id: string;
  autor: string;
  fecha: string;
  tipo: 'Diagnóstico N2' | 'Escalado' | 'Solución Temporal' | 'Sistema';
  texto: string;
}

export type HistoryLogTipo =
  | 'creacion'
  | 'cambio_estado'
  | 'escalado_n2'
  | 'ci_asociado'
  | 'problema_vinculado'
  | 'sla_incumplido'
  | 'sla_reanudado'
  | 'rca_actualizado'
  | 'rfc_vinculado'
  | 'kb_aplicado'
  | 'nota_tecnica'
  | 'csat_recibido'
  | 'cierre';

export interface HistoryLogEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly timestampSimuladoLabel: string;
  readonly actor: string;
  readonly tipo: HistoryLogTipo;
  readonly icono: string;
  readonly accion: string;
  readonly detalle?: string;
}

export interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  canalEntrada: CanalEntrada;
  estado: TicketEstado;
  nivel: TicketNivel;
  prioridad: TicketPrioridad;
  impacto: ImpactoNivel;
  urgencia: UrgenciaNivel;
  categoria: string;
  ciAfectado: string;
  solicitante: string;
  asignadoA: string;
  creadoEn: string;
  slaObjetivoMin: number;
  slaTranscurridoMin: number;
  slaObjetivoSeg: number;
  slaTranscurridoSeg: number;
  slaPausado: boolean;
  slaIncumplido: boolean;
  problemaVinculadoId: string | null;
  notasTecnicas: NotaTecnica[];
  historyLog: HistoryLogEntry[];
  informeCierre?: InformeCierre;
  fcrCumplido?: boolean;
  kbAplicadoId?: string;
  creadoPorUsuario?: boolean;
  csatPuntuacion?: 1 | 2 | 3 | 4 | 5;
  csatComentario?: string;
}

export interface PrefillNuevoTicket {
  titulo?: string;
  descripcion?: string;
  categoria?: string;
  ciAfectado?: string;
  impacto?: ImpactoNivel;
  urgencia?: UrgenciaNivel;
}

export interface ArticuloKb {
  id: string;
  titulo: string;
  categoria: string;
  keywords: string[];
  sintoma: string;
  procedimiento: string;
  problemaOrigenId?: string;
  origen: 'Pre-cargado' | 'Problema N2' | 'Manual';
  fechaPublicacion: string;
  usosFcr: number;
}

export type ProblemaEstado =
  | 'Investigación'
  | 'Causa Raíz Identificada'
  | 'Error Conocido (KEDB)'
  | 'Resuelto';

export interface IshikawaDiagrama {
  maquina: string[];
  metodo: string[];
  material: string[];
  manoDeObra: string[];
}

export interface Problema {
  id: string;
  titulo: string;
  descripcion: string;
  estado: ProblemaEstado;
  prioridad: TicketPrioridad;
  categoria: string;
  ciAfectado: string;
  responsable: string;
  creadoEn: string;
  workaround: string;
  solucionDefinitiva?: string;
  causaRaiz: string;
  analisis5Porques: string[];
  ishikawa: IshikawaDiagrama;
  historyLog: HistoryLogEntry[];
  informeCierre?: InformeCierre;
}

export interface SerieSlaTurno {
  franja: string;
  cumplimientoPct: number;
  abiertos: number;
}

export interface CategoriaCarga {
  categoria: string;
  cantidad: number;
  criticos: number;
}

export interface EventoPuntuacion {
  id: string;
  fecha: string;
  delta: number;
  concepto: string;
  referenciaId: string;
}

export interface EvaluacionAlumno {
  puntuacion: number;
  clasificacionesCorrectas: number;
  penalizacionesSla: number;
  cierresSinCausaRaiz: number;
  infraccionesSinRfc: number;
  rcasCompletados: number;
  fcrsCumplidos: number;
  historialEventos: EventoPuntuacion[];
}

export type RfcTipo = 'Estándar' | 'Normal' | 'Emergencia';
export type RfcRiesgo = 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
export type RfcEstado =
  | 'Borrador'
  | 'Pendiente Aprobación CAB'
  | 'En Deliberación CAB'
  | 'Aprobado'
  | 'Rechazado'
  | 'Implementado';

export interface SolicitudCambioRfc {
  id: string;
  problemaId: string;
  ciAfectado: string;
  titulo: string;
  tipo: RfcTipo;
  riesgo: RfcRiesgo;
  estado: RfcEstado;
  planImplementacion: string;
  planRollback: string;
  ventanaMantenimiento: string;
  solicitante: string;
  creadoEn: string;
  cabComentario?: string;
  cabFechaDecision?: string;
}

export interface Metricas {
  ticketsTotales: number;
  ticketsAbiertos: number;
  ticketsN1Abiertos: number;
  ticketsN2Abiertos: number;
  ticketsResueltos: number;
  fcrCumplidos: number;
  tasaFcrPct: number;
  articulosKb: number;
  slaIncumplidos: number;
  slaEnRiesgo: number;
  tasaCumplimientoSla: number;
  problemasActivos: number;
  erroresConocidos: number;
  rfcsActivos: number;
  rfcsPendientesCab: number;
  mttrMinutos: number;
  csatPromedio: number;
  csatTotalRespuestas: number;
  porCategoria: CategoriaCarga[];
  historialSla: SerieSlaTurno[];
  ultimaActualizacion: string;
}

export interface ServiceDeskGlobalState {
  version: string;
  tickets: Ticket[];
  problemas: Problema[];
  rfcs: SolicitudCambioRfc[];
  articulosKb: ArticuloKb[];
  metricas: Metricas;
  evaluacion: EvaluacionAlumno;
  simulacionMinutosAvanzados: number;
  velocidadSimulacion: VelocidadSimulacion;
  politicaEscaladoSla: PoliticaEscaladoSla;
  rolActivo: RolSimulador;
}

export type VistaActiva =
  | 'portal'
  | 'dashboard'
  | 'tickets'
  | 'problemas'
  | 'rca'
  | 'cambios'
  | 'cmdb'
  | 'kb';

export interface EscenarioTicketPlantilla {
  retrasoMs: number;
  titulo: string;
  descripcion: string;
  canalEntrada: CanalEntrada;
  categoria: string;
  ciAfectado: string;
  solicitante: string;
  impacto: ImpactoNivel;
  urgencia: UrgenciaNivel;
  nivelInicial: TicketNivel;
}

export interface EscenarioSimulacion {
  id: string;
  titulo: string;
  subtitulo: string;
  categoriaPrincipal: string;
  severidadEsperada: TicketPrioridad;
  objetivoDidactico: string;
  duracionTotalSeg: number;
  tickets: EscenarioTicketPlantilla[];
}

