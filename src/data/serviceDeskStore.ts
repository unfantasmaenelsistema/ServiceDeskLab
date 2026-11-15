import {
  ArticuloKb,
  EvaluacionAlumno,
  HistoryLogEntry,
  HistoryLogTipo,
  ImpactoNivel,
  IshikawaDiagrama,
  LogroRubrica,
  Metricas,
  PoliticaEscaladoSla,
  Problema,
  RolSimulador,
  SerieSlaTurno,
  ServiceDeskGlobalState,
  SolicitudCambioRfc,
  Ticket,
  TicketPrioridad,
  UrgenciaNivel,
  VelocidadSimulacion,
} from '../types/itsm';

export const STORAGE_KEY = 'servicedesklab_state_v7';

export const CMDB_CIS_SUGERIDOS: string[] = [
  'IDP-OKTA-PROD-01',
  'DB-PG-FACT-02',
  'FW-PALO-MAD-01',
  'FW-DMZ-EDGE-01',
  'APP-ERP-PROD-01',
  'SW-CORE-DIST-01',
  'GW-KONG-PROD',
  'CACHE-REDIS-PROD-01',
  'DC-AD-PRIMARY-01',
  'WS-WIN11-FIN-04',
];

const ICONOS_HISTORIAL: Record<HistoryLogTipo, string> = {
  creacion: 'fa-solid fa-circle-plus',
  cambio_estado: 'fa-solid fa-arrows-rotate',
  escalado_n2: 'fa-solid fa-arrow-up-right-from-square',
  ci_asociado: 'fa-solid fa-server',
  problema_vinculado: 'fa-solid fa-link',
  sla_incumplido: 'fa-solid fa-triangle-exclamation',
  sla_reanudado: 'fa-solid fa-play',
  rca_actualizado: 'fa-solid fa-magnifying-glass-chart',
  rfc_vinculado: 'fa-solid fa-code-branch',
  kb_aplicado: 'fa-solid fa-book-open',
  nota_tecnica: 'fa-solid fa-comment-dots',
  csat_recibido: 'fa-solid fa-star',
  cierre: 'fa-solid fa-circle-check',
};

export interface CmdbCiMetadata {
  tipo: string;
  entorno: 'Producción' | 'Core Red' | 'Corporativo';
  criticidad: 'Crítica' | 'Alta' | 'Media';
  propietario: string;
  dependeDe: string[];
  servicioNegocio: string;
}

export const CMDB_TOPOLOGIA: Record<string, CmdbCiMetadata> = {
  'IDP-OKTA-PROD-01': {
    tipo: 'Identity Provider (SAML/OIDC)',
    entorno: 'Producción',
    criticidad: 'Crítica',
    propietario: 'Equipo IAM N2',
    dependeDe: ['DC-AD-PRIMARY-01', 'FW-DMZ-EDGE-01'],
    servicioNegocio: 'Autenticación Única Corporativa (SSO)',
  },
  'DB-PG-FACT-02': {
    tipo: 'Cluster PostgreSQL + PgBouncer',
    entorno: 'Producción',
    criticidad: 'Crítica',
    propietario: 'DBA Guardia N2',
    dependeDe: ['SW-CORE-DIST-01'],
    servicioNegocio: 'Facturación y Contabilidad ERP',
  },
  'FW-PALO-MAD-01': {
    tipo: 'Firewall / Concentrador VPN IPsec',
    entorno: 'Core Red',
    criticidad: 'Crítica',
    propietario: 'Redes & Telecom N2',
    dependeDe: ['SW-CORE-DIST-01', 'IDP-OKTA-PROD-01'],
    servicioNegocio: 'Acceso Remoto Corporativo (VPN)',
  },
  'FW-DMZ-EDGE-01': {
    tipo: 'Firewall Perimetral DMZ',
    entorno: 'Core Red',
    criticidad: 'Crítica',
    propietario: 'SecOps & Perímetro N2',
    dependeDe: ['SW-CORE-DIST-01'],
    servicioNegocio: 'Conectividad Externa & NTP/DNS',
  },
  'APP-ERP-PROD-01': {
    tipo: 'Servidor de Aplicaciones ERP',
    entorno: 'Producción',
    criticidad: 'Crítica',
    propietario: 'Plataforma Cloud N2',
    dependeDe: ['DB-PG-FACT-02', 'IDP-OKTA-PROD-01', 'CACHE-REDIS-PROD-01'],
    servicioNegocio: 'Operaciones y Logística Central',
  },
  'SW-CORE-DIST-01': {
    tipo: 'Switch Core Distribución L3',
    entorno: 'Core Red',
    criticidad: 'Crítica',
    propietario: 'Redes & Telecom N2',
    dependeDe: [],
    servicioNegocio: 'Backbone Campus y Datacenter',
  },
  'GW-KONG-PROD': {
    tipo: 'API Gateway / Ingress',
    entorno: 'Producción',
    criticidad: 'Alta',
    propietario: 'Plataforma Cloud N2',
    dependeDe: ['SW-CORE-DIST-01', 'CACHE-REDIS-PROD-01'],
    servicioNegocio: 'Pasarela de APIs y Portal Web',
  },
  'CACHE-REDIS-PROD-01': {
    tipo: 'Clúster Redis Sentinel',
    entorno: 'Producción',
    criticidad: 'Alta',
    propietario: 'Plataforma Cloud N2',
    dependeDe: ['SW-CORE-DIST-01'],
    servicioNegocio: 'Gestión de Sesiones Distribuidas',
  },
  'DC-AD-PRIMARY-01': {
    tipo: 'Domain Controller Active Directory',
    entorno: 'Producción',
    criticidad: 'Crítica',
    propietario: 'Sistemas & Identidad N2',
    dependeDe: ['SW-CORE-DIST-01'],
    servicioNegocio: 'Directorio Activo y Kerberos',
  },
  'WS-WIN11-FIN-04': {
    tipo: 'Estación de Trabajo Windows 11',
    entorno: 'Corporativo',
    criticidad: 'Media',
    propietario: 'Soporte Microinformática N1',
    dependeDe: ['DC-AD-PRIMARY-01', 'FW-PALO-MAD-01'],
    servicioNegocio: 'Puesto Financiero',
  },
};

export function formatearTimestampSimulado(
  isoDate: string,
  simulacionMinutosAvanzados = 0
): string {
  const d = new Date(isoDate);
  const fechaStr = Number.isNaN(d.getTime())
    ? isoDate
    : d.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
  return simulacionMinutosAvanzados > 0
    ? `${fechaStr} · T+${simulacionMinutosAvanzados}m`
    : fechaStr;
}

export function crearEventoHistorial(params: {
  tipo: HistoryLogTipo;
  actor: string;
  accion: string;
  detalle?: string;
  simulacionMinutosAvanzados?: number;
  timestamp?: string;
  icono?: string;
}): HistoryLogEntry {
  const simMin = params.simulacionMinutosAvanzados ?? 0;
  const ts =
    params.timestamp ??
    new Date(Date.now() + simMin * 60_000).toISOString();

  return Object.freeze({
    id: `HLOG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: ts,
    timestampSimuladoLabel: formatearTimestampSimulado(ts, simMin),
    actor: params.actor,
    tipo: params.tipo,
    icono: params.icono ?? ICONOS_HISTORIAL[params.tipo],
    accion: params.accion,
    detalle: params.detalle,
  });
}

export function crearIshikawaVacio(): IshikawaDiagrama {
  return {
    maquina: [],
    metodo: [],
    material: [],
    manoDeObra: [],
  };
}

export function normalizarIshikawa(raw: unknown): IshikawaDiagrama {
  if (!raw || typeof raw !== 'object') return crearIshikawaVacio();
  const obj = raw as Record<string, unknown>;
  const arr = (val: unknown) =>
    Array.isArray(val) ? val.filter((x): x is string => typeof x === 'string') : [];
  return {
    maquina: arr(obj.maquina ?? obj.tecnologia),
    metodo: arr(obj.metodo ?? obj.procesos),
    material: arr(obj.material ?? obj.entorno),
    manoDeObra: arr(obj.manoDeObra ?? obj.personas),
  };
}

export function crearEvaluacionInicial(): EvaluacionAlumno {
  return {
    puntuacion: 100,
    clasificacionesCorrectas: 0,
    penalizacionesSla: 0,
    cierresSinCausaRaiz: 0,
    infraccionesSinRfc: 0,
    rcasCompletados: 0,
    fcrsCumplidos: 0,
    eventosRegistrados: [],
    logros: [],
    historialEventos: [
      {
        id: 'EV-INIT',
        fecha: new Date().toISOString(),
        delta: 0,
        concepto: 'Puntuación base inicial del turno N2',
        referenciaId: 'SISTEMA',
      },
    ],
  };
}

/**
 * Motor oculto de evaluación ITIL v4:
 * Evalúa coherencia entre síntomas/categoría y la matriz Impacto x Urgencia elegida.
 */
export function evaluarClasificacionMatriz(params: {
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: TicketPrioridad;
}): { esCoherente: boolean; delta: number; motivo: string } {
  const texto = `${params.titulo} ${params.descripcion}`.toLowerCase();
  const esSintomaCritico =
    /ca[ií]da|masiv|producci[oó]n|sso|502|503|504|outage|bloqueo total|sin acceso|vpn|db|base de datos/.test(
      texto
    );
  const esSintomaMenor =
    /impresora|impresi[oó]n|cuota|solicitud|buz[oó]n|cambio de nombre|consulta|teclado|rat[oó]n/.test(
      texto
    );

  if (
    esSintomaCritico &&
    (params.prioridad === 'P1 - Crítica' || params.prioridad === 'P2 - Alta')
  ) {
    return {
      esCoherente: true,
      delta: 15,
      motivo: 'Clasificación precisa de incidente crítico en matriz Impacto/Urgencia',
    };
  }

  if (
    esSintomaMenor &&
    (params.prioridad === 'P3 - Media' || params.prioridad === 'P4 - Baja')
  ) {
    return {
      esCoherente: true,
      delta: 15,
      motivo: 'Clasificación adecuada de incidente menor en matriz Impacto/Urgencia',
    };
  }

  if (esSintomaCritico && params.prioridad === 'P4 - Baja') {
    return {
      esCoherente: false,
      delta: -10,
      motivo: 'Subestimación de prioridad en incidente de alto impacto operativo',
    };
  }

  if (esSintomaMenor && params.prioridad === 'P1 - Crítica') {
    return {
      esCoherente: false,
      delta: -10,
      motivo: 'Sobreclasificación P1 para solicitud o incidencia individual',
    };
  }

  // Sin indicios en el texto no hay forma de valorar la clasificación: no suma ni resta
  // (antes sumaba +10 por cualquier ticket y se podían acumular puntos creando tickets vacíos)
  return {
    esCoherente: true,
    delta: 0,
    motivo: 'Clasificación registrada (sin indicios suficientes para valorarla)',
  };
}

export function registrarEventoEvaluacion(
  actual: EvaluacionAlumno,
  payload: {
    delta: number;
    concepto: string;
    referenciaId: string;
    tipo:
      | 'clasificacion'
      | 'sla_vencido'
      | 'cierre_sin_rca'
      | 'cierre_sin_rfc'
      | 'rca_completo'
      | 'sla_cumplido'
      | 'rfc_documentado'
      | 'rfc_aprobado'
      | 'rfc_rechazado'
      | 'rfc_implementado'
      | 'fcr_cumplido';
  }
): EvaluacionAlumno {
  // Cada acción puntúa una sola vez por elemento: rehacer un RCA, repetir un intento
  // de cierre o crear varios RFC para el mismo problema ya no multiplica los puntos.
  const clave = `${payload.tipo}:${payload.referenciaId}`;
  const registrados = actual.eventosRegistrados ?? [];
  if (registrados.includes(clave)) return actual;

  const nuevaPuntuacion = Math.max(0, actual.puntuacion + payload.delta);
  const nuevoEvento = {
    id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fecha: new Date().toISOString(),
    delta: payload.delta,
    concepto: payload.concepto,
    referenciaId: payload.referenciaId,
  };

  return {
    puntuacion: nuevaPuntuacion,
    clasificacionesCorrectas:
      actual.clasificacionesCorrectas +
      (payload.tipo === 'clasificacion' && payload.delta > 0 ? 1 : 0),
    penalizacionesSla:
      actual.penalizacionesSla + (payload.tipo === 'sla_vencido' ? 1 : 0),
    cierresSinCausaRaiz:
      actual.cierresSinCausaRaiz +
      (payload.tipo === 'cierre_sin_rca' ? 1 : 0),
    infraccionesSinRfc:
      (actual.infraccionesSinRfc ?? 0) +
      (payload.tipo === 'cierre_sin_rfc' ? 1 : 0),
    rcasCompletados:
      actual.rcasCompletados + (payload.tipo === 'rca_completo' ? 1 : 0),
    fcrsCumplidos:
      (actual.fcrsCumplidos ?? 0) + (payload.tipo === 'fcr_cumplido' ? 1 : 0),
    historialEventos: [nuevoEvento, ...actual.historialEventos].slice(0, 12),
    eventosRegistrados: [...registrados, clave],
    logros: actual.logros ?? [],
  };
}

/** Marca un hito de la rúbrica como conseguido por el alumno. */
export function registrarLogro(
  actual: EvaluacionAlumno,
  logro: LogroRubrica
): EvaluacionAlumno {
  const logros = actual.logros ?? [];
  return logros.includes(logro) ? actual : { ...actual, logros: [...logros, logro] };
}

/**
 * Estado inicial de un RFC según ITIL 4: solo el cambio Estándar de riesgo Bajo está
 * preautorizado. Los Normales van al CAB y los de Emergencia al ECAB.
 */
export function estadoInicialRfc(
  tipo: SolicitudCambioRfc['tipo'],
  riesgo: SolicitudCambioRfc['riesgo']
): 'Aprobado' | 'Pendiente Aprobación CAB' {
  return tipo === 'Estándar' && riesgo === 'Bajo' ? 'Aprobado' : 'Pendiente Aprobación CAB';
}

function normalizarTextoBusqueda(txt: string): string {
  return txt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const STOPWORDS_ES = new Set([
  'para',
  'con',
  'sin',
  'por',
  'los',
  'las',
  'una',
  'uno',
  'unos',
  'del',
  'desde',
  'tras',
  'como',
  'esta',
  'este',
  'sobre',
  'entre',
  'todo',
  'todos',
  'hay',
  'que',
  'error',
]);

export function buscarArticulosKbRelevantes(
  consulta: string,
  articulos: ArticuloKb[],
  categoriaPreferida?: string
): { articulo: ArticuloKb; coincidencias: string[]; score: number }[] {
  const normConsulta = normalizarTextoBusqueda(consulta).trim();
  if (!normConsulta && !categoriaPreferida) {
    return articulos.map((articulo) => ({
      articulo,
      coincidencias: [],
      score: 0,
    }));
  }

  const tokens = normConsulta
    .split(/[^a-z0-9._-]+/)
    .filter((t) => t.length >= 2 && !STOPWORDS_ES.has(t));

  const resultados: {
    articulo: ArticuloKb;
    coincidencias: string[];
    score: number;
  }[] = [];

  for (const art of articulos) {
    const coincidenciasSet = new Set<string>();
    let score = 0;

    const normTitulo = normalizarTextoBusqueda(art.titulo);
    const normSintoma = normalizarTextoBusqueda(art.sintoma);

    for (const kw of art.keywords) {
      const normKw = normalizarTextoBusqueda(kw);
      if (normKw.length >= 2 && normConsulta.includes(normKw)) {
        coincidenciasSet.add(kw);
        score += 4;
      } else {
        for (const tok of tokens) {
          if (normKw.includes(tok) || tok.includes(normKw)) {
            coincidenciasSet.add(kw);
            score += 2;
          }
        }
      }
    }

    for (const tok of tokens) {
      if (tok.length >= 3 && normTitulo.includes(tok)) {
        coincidenciasSet.add(tok);
        score += 2;
      } else if (tok.length >= 4 && normSintoma.includes(tok)) {
        score += 1;
      }
    }

    if (categoriaPreferida && art.categoria === categoriaPreferida && score > 0) {
      score += 2;
    }

    if (score > 0) {
      resultados.push({
        articulo: art,
        coincidencias: Array.from(coincidenciasSet).slice(0, 5),
        score,
      });
    }
  }

  return resultados.sort((a, b) => b.score - a.score);
}

export function esArticuloKbCorrectoParaTicket(
  ticket: Ticket,
  articulo: ArticuloKb
): boolean {
  const matches = buscarArticulosKbRelevantes(
    `${ticket.titulo} ${ticket.descripcion} ${ticket.ciAfectado}`,
    [articulo],
    ticket.categoria
  );
  return matches.length > 0 && matches[0].score >= 2;
}

export function extraerKeywordsDeProblema(problema: Problema): string[] {
  const texto = `${problema.titulo} ${problema.ciAfectado} ${problema.categoria}`;
  const tokens = normalizarTextoBusqueda(texto)
    .split(/[^a-z0-9-]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS_ES.has(t));
  return Array.from(new Set(tokens)).slice(0, 8);
}

export function crearArticulosKbIniciales(): ArticuloKb[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'KB-001',
      titulo: 'Cómo resetear token VPN y re-enrolar MFA en concentrador Madrid',
      categoria: 'Redes & Conectividad',
      keywords: [
        'vpn',
        'token',
        'mfa',
        'ike',
        'ike_timeout',
        'acceso remoto',
        'madrid',
        'desconexion',
        'fw-palo-mad-01',
      ],
      sintoma:
        'El usuario se desconecta inmediatamente tras validar MFA en el cliente GlobalProtect o recibe IKE_TIMEOUT.',
      procedimiento:
        '1. Verificar estado de sesión en consola VPN-Radius. 2. Revocar token TOTP caducado y generar código de re-enrolamiento temporal. 3. Limpiar caché de certificado local del cliente VPN y reconectar validando nuevo factor.',
      origen: 'Pre-cargado',
      fechaPublicacion: now,
      usosFcr: 4,
    },
    {
      id: 'KB-002',
      titulo: 'Pasos para desbloqueo de cuenta en Active Directory (AD) y SSO',
      categoria: 'IAM / Identidad',
      keywords: [
        'ad',
        'active directory',
        'desbloqueo',
        'bloqueo',
        'bloqueada',
        'password',
        'contraseña',
        'login',
        'acceso',
        'cuenta',
        'sso',
      ],
      sintoma:
        'Usuario no puede iniciar sesión en correo, portal o Windows por intentos fallidos consecutivos de contraseña.',
      procedimiento:
        '1. Confirmar identidad del solicitante según protocolo N1. 2. Abrir Active Directory Users & Computers -> localizar usuario -> pestaña Account -> marcar "Unlock account". 3. Verificar en Event Viewer (Event ID 4740) si existe sesión móvil con credencial antigua.',
      origen: 'Pre-cargado',
      fechaPublicacion: now,
      usosFcr: 9,
    },
    {
      id: 'KB-003',
      titulo:
        'Mitigación de lentitud tras actualización acumulativa de Windows (KB5034765)',
      categoria: 'Puesto de Trabajo',
      keywords: [
        'windows',
        'actualizacion',
        'parche',
        'kb5034765',
        'tiworker',
        'lento',
        'barra de tareas',
        'reinicio',
        'hackeado',
      ],
      sintoma:
        'Equipo lento tras reinicio matinal, proceso TiWorker.exe con CPU alta o barra de tareas tardando en cargar.',
      procedimiento:
        '1. Confirmar con el usuario que el equipo está aplicando el despliegue programado WSUS KB5034765 (no es malware). 2. Esperar 5-8 min a que finalice TrustedInstaller/TiWorker. 3. Reiniciar explorer.exe si la barra de tareas permanece en blanco.',
      origen: 'Pre-cargado',
      fechaPublicacion: now,
      usosFcr: 6,
    },
    {
      id: 'KB-004',
      titulo:
        'Diagnóstico rápido de saturación de pool PgBouncer en Facturación',
      categoria: 'Base de Datos',
      keywords: [
        'postgres',
        'pgbouncer',
        'facturacion',
        'latencia',
        '504',
        'timeout',
        'base de datos',
        'db-pg-fact-02',
      ],
      sintoma:
        'Errores HTTP 504 en emisión de facturas y alertas de cola llena en PgBouncer.',
      procedimiento:
        '1. Redirigir consultas analíticas/reportes a la réplica de lectura. 2. Finalizar sesiones IDLE IN TRANSACTION > 60s. 3. Escalar a DBA N2 si el volumen OLTP continúa bloqueado.',
      problemaOrigenId: 'PRB-0109',
      origen: 'Pre-cargado',
      fechaPublicacion: now,
      usosFcr: 2,
    },
    {
      id: 'KB-005',
      titulo: 'Verificación de aserciones SAML 2.0 y desfase NTP en portal SSO',
      categoria: 'IAM / Identidad',
      keywords: [
        'saml',
        'ntp',
        'notbefore',
        'sso',
        'finanzas',
        'idp-okta-prod-01',
        'portal corporativo',
      ],
      sintoma:
        'Error "SAML Assertion NotBefore validation failed" al acceder al portal corporativo.',
      procedimiento:
        '1. Aplicar workaround KEDB ampliando tolerancia clock-skew a ±180s en el Service Provider. 2. Confirmar sincronización chronyd en nodos IdP. 3. Vincular incidente a PRB-0108.',
      problemaOrigenId: 'PRB-0108',
      origen: 'Pre-cargado',
      fechaPublicacion: now,
      usosFcr: 3,
    },
  ];
}

/**
 * Comprueba si un Problema crítico (P1 - Crítica) cuenta con al menos un RFC aprobado o implementado
 * antes de autorizar cambios en producción / CMDB.
 */
export function evaluarRfcParaProblema(
  problema: Problema,
  rfcs: SolicitudCambioRfc[]
): {
  requiereRfcParaCerrar: boolean;
  rfcsVinculados: SolicitudCambioRfc[];
  tieneRfcAprobadoOImplementado: boolean;
} {
  const rfcsVinculados = rfcs.filter((r) => r.problemaId === problema.id);
  const tieneRfcAprobadoOImplementado = rfcsVinculados.some(
    (r) => r.estado === 'Aprobado' || r.estado === 'Implementado'
  );
  return {
    requiereRfcParaCerrar: problema.prioridad === 'P1 - Crítica',
    rfcsVinculados,
    tieneRfcAprobadoOImplementado,
  };
}

/**
 * Simulador de decisión del CAB (Change Advisory Board):
 * Combina el nivel de riesgo del RFC con la calidad y detalle técnico del Plan de Implementación y Rollback.
 */
export function simularDecisionCab(rfc: SolicitudCambioRfc): {
  aprobado: boolean;
  comentario: string;
} {
  const impl = rfc.planImplementacion.trim();
  const roll = rfc.planRollback.trim();
  const comite = rfc.tipo === 'Emergencia' ? 'ECAB' : 'CAB';
  const textoCombinado = `${impl} ${roll}`.toLowerCase();

  const palabrasClaveTecnicas =
    /backup|copia|snapshot|revert|rollback|validar|prueba|test|canary|ventana|monitor|reinici|regla|firewall|script|servicio|cmdb|dns|parche|índice|indice/.test(
      textoCombinado
    );

  let calidadScore = 0;
  if (impl.length >= 60) calidadScore += 0.25;
  else if (impl.length >= 30) calidadScore += 0.12;
  if (roll.length >= 60) calidadScore += 0.3;
  else if (roll.length >= 30) calidadScore += 0.15;
  if (palabrasClaveTecnicas) calidadScore += 0.2;
  if (rfc.ventanaMantenimiento.trim().length >= 5) calidadScore += 0.1;

  const basePorRiesgo: Record<SolicitudCambioRfc['riesgo'], number> = {
    Bajo: 0.7,
    Medio: 0.5,
    Alto: 0.3,
    Crítico: 0.18,
  };

  const probabilidadAprobacion = Math.min(
    0.96,
    Math.max(0.12, basePorRiesgo[rfc.riesgo] + calidadScore * 0.45)
  );

  // Si los planes son demasiado escuetos en riesgo Alto/Crítico, el CAB exige más rigor
  if (
    (rfc.riesgo === 'Alto' || rfc.riesgo === 'Crítico') &&
    (impl.length < 35 || roll.length < 35)
  ) {
    return {
      aprobado: false,
      comentario:
        `${comite} Rechazado (Riesgo ${rfc.riesgo}): El Plan de Implementación o el Plan de Marcha Atrás son insuficientes para autorizar cambios en ${rfc.ciAfectado}. Detalla pasos verificables, backup previo y criterio de reversión.`,
    };
  }

  const aprobado = Math.random() <= probabilidadAprobacion;
  if (aprobado) {
    return {
      aprobado: true,
      comentario: `${comite} Aprobado (${rfc.riesgo}): El comité valida el Plan de Implementación y la estrategia de Rollback sobre ${rfc.ciAfectado}. Autorizado ejecutar en ventana "${rfc.ventanaMantenimiento || 'Programada'}".`,
    };
  }

  return {
    aprobado: false,
    comentario: `${comite} Rechazado (${rfc.riesgo}): El comité solicita evidencias adicionales de pruebas previas en preproducción y tiempos estimados de Rollback para ${rfc.ciAfectado} antes de aprobar.`,
  };
}

/**
 * Regla de validación RCA ITIL v4:
 * Un Problema de prioridad P1 - Crítica o P2 - Alta no puede cerrarse
 * a menos que se haya completado al menos una de las dos herramientas RCA:
 * 1) Los 5 Porqués (mínimo 3 niveles respondidos + Causa Raíz documentada)
 * 2) Diagrama de Ishikawa 4M (mínimo 1 causa registrada en cualquiera de las 4M)
 */
export function evaluarEstadoRca(problema: Problema): {
  pasosPorques: number;
  tieneCausaRaiz: boolean;
  porquesOk: boolean;
  totalCausasIshikawa: number;
  ishikawaOk: boolean;
  rcaValido: boolean;
  requiereRcaParaCerrar: boolean;
} {
  const pasosPorques = problema.analisis5Porques.filter(
    (p) => p.trim().length >= 3
  ).length;
  const tieneCausaRaiz = problema.causaRaiz.trim().length >= 5;
  const porquesOk = pasosPorques >= 3 && tieneCausaRaiz;

  const ish = normalizarIshikawa(problema.ishikawa);
  const totalCausasIshikawa =
    ish.maquina.length +
    ish.metodo.length +
    ish.material.length +
    ish.manoDeObra.length;
  const ishikawaOk = totalCausasIshikawa >= 1;

  const requiereRcaParaCerrar =
    problema.prioridad === 'P1 - Crítica' ||
    problema.prioridad === 'P2 - Alta';

  return {
    pasosPorques,
    tieneCausaRaiz,
    porquesOk,
    totalCausasIshikawa,
    ishikawaOk,
    rcaValido: porquesOk || ishikawaOk,
    requiereRcaParaCerrar,
  };
}

/**
 * Matriz estándar ITIL v4 de Impacto x Urgencia -> Prioridad y límite SLA simulado
 * - P1 Crítica: 15 min (900s)
 * - P2 Alta:    30 min (1800s)
 * - P3 Media:   60 min / 1 hora (3600s)
 * - P4 Baja:    120 min / 2 horas (7200s)
 */
export function calcularPrioridadITIL(
  impacto: ImpactoNivel,
  urgencia: UrgenciaNivel
): {
  prioridad: TicketPrioridad;
  slaObjetivoMin: number;
  slaObjetivoSeg: number;
} {
  if (impacto === 'Alto' && urgencia === 'Alta') {
    return {
      prioridad: 'P1 - Crítica',
      slaObjetivoMin: 15,
      slaObjetivoSeg: 15 * 60,
    };
  }
  if (
    (impacto === 'Alto' && urgencia === 'Media') ||
    (impacto === 'Medio' && urgencia === 'Alta')
  ) {
    return {
      prioridad: 'P2 - Alta',
      slaObjetivoMin: 30,
      slaObjetivoSeg: 30 * 60,
    };
  }
  if (
    (impacto === 'Alto' && urgencia === 'Baja') ||
    (impacto === 'Medio' && urgencia === 'Media') ||
    (impacto === 'Bajo' && urgencia === 'Alta')
  ) {
    return {
      prioridad: 'P3 - Media',
      slaObjetivoMin: 60,
      slaObjetivoSeg: 60 * 60,
    };
  }
  return {
    prioridad: 'P4 - Baja',
    slaObjetivoMin: 120,
    slaObjetivoSeg: 120 * 60,
  };
}

export function asignarEquipoN2PorCategoria(categoria: string): string {
  if (categoria.includes('IAM')) return 'Equipo N2 · Identidad y Accesos';
  if (categoria.includes('Base de Datos')) return 'Equipo N2 · DBA';
  if (categoria.includes('Redes')) return 'Equipo N2 · Redes & VPN';
  if (categoria.includes('Cloud')) return 'Equipo N2 · SRE Cloud';
  if (categoria.includes('Seguridad')) return 'Equipo N2 · SecOps';
  if (categoria.includes('Linux')) return 'Equipo N2 · Sistemas Linux';
  return 'Equipo N2 · Soporte Especializado';
}

/**
 * Evolución real del cumplimiento SLA en la sesión: se recorre el historial de los tickets
 * (altas, vencimientos de SLA y cierres) y se toma una muestra de hasta 6 puntos más el actual.
 */
export function construirHistorialSla(
  tickets: Ticket[],
  simulacionMinutosAvanzados: number
): SerieSlaTurno[] {
  type Ev = { ts: number; tipo: 'alta' | 'vencido' | 'cierre'; id: string };
  const eventos: Ev[] = [];
  for (const t of tickets) {
    for (const ev of t.historyLog ?? []) {
      const ts = Date.parse(ev.timestamp);
      if (Number.isNaN(ts)) continue;
      if (ev.tipo === 'creacion') eventos.push({ ts, tipo: 'alta', id: t.id });
      else if (ev.tipo === 'sla_incumplido') eventos.push({ ts, tipo: 'vencido', id: t.id });
      else if (ev.tipo === 'cierre') eventos.push({ ts, tipo: 'cierre', id: t.id });
    }
  }
  eventos.sort((a, b) => a.ts - b.ts);

  const altas = new Set<string>();
  const vencidos = new Set<string>();
  const cerrados = new Set<string>();
  const puntos: SerieSlaTurno[] = [];
  for (const ev of eventos) {
    if (ev.tipo === 'alta') altas.add(ev.id);
    else if (ev.tipo === 'vencido') vencidos.add(ev.id);
    else cerrados.add(ev.id);
    if (altas.size === 0) continue;
    puntos.push({
      franja: new Date(ev.ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      cumplimientoPct: Math.round(((altas.size - vencidos.size) / altas.size) * 1000) / 10,
      abiertos: [...altas].filter((id) => !cerrados.has(id)).length,
    });
  }

  const paso = Math.max(1, Math.ceil(puntos.length / 6));
  const muestra = puntos.filter((_, i) => i % paso === 0).slice(-6);
  const total = tickets.length;
  const incumplidos = tickets.filter((t) => t.slaIncumplido).length;
  muestra.push({
    franja: simulacionMinutosAvanzados > 0 ? `Actual (+${simulacionMinutosAvanzados}m)` : 'Actual',
    cumplimientoPct: total > 0 ? Math.round(((total - incumplidos) / total) * 1000) / 10 : 100,
    abiertos: tickets.filter((t) => t.estado !== 'Resuelto').length,
  });
  return muestra;
}

export function recalcularMetricas(
  tickets: Ticket[],
  problemas: Problema[],
  simulacionMinutosAvanzados: number,
  rfcs: SolicitudCambioRfc[] = [],
  articulosKb: ArticuloKb[] = []
): Metricas {
  const ticketsAbiertosList = tickets.filter((t) => t.estado !== 'Resuelto');
  const ticketsResueltosList = tickets.filter((t) => t.estado === 'Resuelto');

  const ticketsAbiertos = ticketsAbiertosList.length;
  const ticketsN1Abiertos = ticketsAbiertosList.filter(
    (t) => t.nivel === 'N1'
  ).length;
  const ticketsN2Abiertos = ticketsAbiertosList.filter(
    (t) => t.nivel === 'N2'
  ).length;
  const fcrCumplidos = ticketsResueltosList.filter((t) =>
    Boolean(t.fcrCumplido)
  ).length;
  const tasaFcrPct =
    ticketsResueltosList.length > 0
      ? Math.round((fcrCumplidos / ticketsResueltosList.length) * 1000) / 10
      : 0;

  const slaIncumplidos = tickets.filter((t) => t.slaIncumplido).length;
  const slaEnRiesgo = ticketsAbiertosList.filter(
    (t) =>
      !t.slaIncumplido &&
      !t.slaPausado &&
      t.slaTranscurridoSeg / Math.max(t.slaObjetivoSeg, 1) >= 0.75
  ).length;

  const tasaCumplimientoSla =
    tickets.length > 0
      ? Math.round(((tickets.length - slaIncumplidos) / tickets.length) * 1000) /
        10
      : 100;

  const problemasActivos = problemas.filter(
    (p) => p.estado !== 'Resuelto'
  ).length;
  const erroresConocidos = problemas.filter(
    (p) => p.estado === 'Error Conocido (KEDB)'
  ).length;
  const rfcsActivos = rfcs.filter((r) => r.estado !== 'Implementado').length;
  const rfcsPendientesCab = rfcs.filter(
    (r) =>
      r.estado === 'Pendiente Aprobación CAB' ||
      r.estado === 'En Deliberación CAB'
  ).length;

  const mttrMinutos =
    ticketsResueltosList.length > 0
      ? Math.round(
          (ticketsResueltosList.reduce(
            (acc, t) => acc + t.slaTranscurridoSeg / 60,
            0
          ) /
            ticketsResueltosList.length) *
            10
        ) / 10
      : 0;

  const catMap = new Map<string, { cantidad: number; criticos: number }>();
  for (const t of ticketsAbiertosList) {
    const prev = catMap.get(t.categoria) ?? { cantidad: 0, criticos: 0 };
    catMap.set(t.categoria, {
      cantidad: prev.cantidad + 1,
      criticos:
        prev.criticos +
        (t.prioridad === 'P1 - Crítica' || t.prioridad === 'P2 - Alta' ? 1 : 0),
    });
  }

  const porCategoria = Array.from(catMap.entries())
    .map(([categoria, data]) => ({
      categoria,
      cantidad: data.cantidad,
      criticos: data.criticos,
    }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const historialSla = construirHistorialSla(tickets, simulacionMinutosAvanzados);

  const ticketsConCsat = tickets.filter(
    (t) => typeof t.csatPuntuacion === 'number'
  );
  const csatTotalRespuestas = ticketsConCsat.length;
  const csatPromedio =
    csatTotalRespuestas > 0
      ? Math.round(
          (ticketsConCsat.reduce((acc, t) => acc + (t.csatPuntuacion ?? 0), 0) /
            csatTotalRespuestas) *
            10
        ) / 10
      : 0;

  return {
    ticketsTotales: tickets.length,
    ticketsAbiertos,
    ticketsN1Abiertos,
    ticketsN2Abiertos,
    ticketsResueltos: ticketsResueltosList.length,
    fcrCumplidos,
    tasaFcrPct,
    articulosKb: articulosKb.length,
    slaIncumplidos,
    slaEnRiesgo,
    tasaCumplimientoSla,
    problemasActivos,
    erroresConocidos,
    rfcsActivos,
    rfcsPendientesCab,
    mttrMinutos,
    csatPromedio,
    csatTotalRespuestas,
    porCategoria,
    historialSla,
    ultimaActualizacion: new Date().toISOString(),
  };
}

export function crearEstadoInicial(): ServiceDeskGlobalState {
  const now = Date.now();
  const haceMin = (m: number) => new Date(now - m * 60_000).toISOString();

  const problemas: Problema[] = [
    {
      id: 'PRB-0108',
      titulo:
        'Desincronización de reloj NTP en nodos IdP provoca rechazo de aserciones SAML 2.0',
      descripcion:
        'Múltiples usuarios corporativos reciben error "SAML Assertion NotBefore validation failed" al autenticarse contra el portal SSO durante picos de carga.',
      estado: 'Error Conocido (KEDB)',
      prioridad: 'P1 - Crítica',
      categoria: 'IAM / Identidad',
      ciAfectado: 'IDP-OKTA-PROD-01',
      responsable: 'Elena Vance (Especialista IAM N2)',
      creadoEn: haceMin(320),
      workaround:
        'Ampliar ventana clock-skew a ±180s en el proveedor de servicio SP y forzar resincronización chronyd en nodos IdP-02/03.',
      causaRaiz:
        'Regla de firewall en subred DMZ bloqueó el tráfico UDP/123 hacia los servidores NTP internos tras la ventana de mantenimiento del martes.',
      analisis5Porques: [
        'Los usuarios no pueden iniciar sesión en el portal corporativo vía SSO.',
        'Las aserciones SAML emitidas por IDP-OKTA-PROD-01 son rechazadas por desfase horario (+92 segundos).',
        'El demonio chronyd de los nodos secundarios lleva 48 horas sin sincronizar con el stratum-1.',
        'Las peticiones UDP puerto 123 están siendo descartadas silenciosamente por el firewall perimetral.',
        'Durante el endurecimiento de políticas de la DMZ se omitió la excepción NTP en el cambio RFC-4412.',
      ],
      ishikawa: {
        maquina: [
          'Tolerancia SAML estricta (0s skew) en Service Provider',
          'Regla DROP sin log en UDP/123',
        ],
        metodo: ['Checklist de despliegue de firewall sin prueba de deriva NTP'],
        material: ['Plantilla de políticas DMZ desactualizada en cambio RFC-4412'],
        manoDeObra: ['Falta de validación cruzada en revisión del RFC-4412'],
      },
      historyLog: [
        crearEventoHistorial({
          tipo: 'creacion',
          actor: 'Gestor de Problemas N2',
          accion: 'Problema PRB-0108 abierto (P1 - Crítica)',
          detalle: 'CI asociado: IDP-OKTA-PROD-01 · Categoría IAM / Identidad.',
          timestamp: haceMin(320),
        }),
        crearEventoHistorial({
          tipo: 'rca_actualizado',
          actor: 'Elena Vance (Especialista IAM N2)',
          accion: 'RCA completado (5 Porqués + Ishikawa 4M)',
          detalle: 'Causa raíz: bloqueo UDP/123 en firewall DMZ tras cambio RFC-4412.',
          timestamp: haceMin(240),
        }),
        crearEventoHistorial({
          tipo: 'rfc_vinculado',
          actor: 'Elena Vance (Especialista IAM N2)',
          accion: 'RFC-0501 creado para cambio en FW-DMZ-EDGE-01',
          detalle: 'Pendiente de aprobación por el Comité CAB.',
          timestamp: haceMin(45),
        }),
      ],
    },
    {
      id: 'PRB-0109',
      titulo:
        'Saturación del pool de conexiones PgBouncer por consulta sin índice en facturación',
      descripcion:
        'Consultas analíticas concurrentes bloquean los workers de transacción en DB-PG-FACT-02, elevando la latencia por encima de 4.5 segundos.',
      estado: 'Causa Raíz Identificada',
      prioridad: 'P1 - Crítica',
      categoria: 'Base de Datos',
      ciAfectado: 'DB-PG-FACT-02',
      responsable: 'Marco Ríos (DBA Nivel 2)',
      creadoEn: haceMin(210),
      workaround:
        'Redirigir reportes pesados a la réplica de lectura y reiniciar sesiones IDLE IN TRANSACTION > 60s.',
      causaRaiz:
        'Ausencia de índice compuesto (empresa_id, fecha_emision) en tabla facturas_detalle (48M de filas) tras la última migración.',
      analisis5Porques: [
        'El servicio de facturación responde con timeouts HTTP 504.',
        'PgBouncer alcanza el límite máximo de 200 conexiones activas en cola.',
        'Las consultas SELECT sobre facturas_detalle tardan >12 segundos cada una.',
        'PostgreSQL ejecuta Sequential Scan completo sobre 48 millones de registros.',
        'El script de migración v4.2 eliminó el índice previo sin recrear el índice compuesto.',
      ],
      ishikawa: {
        maquina: [
          'Sequential Scan en tabla de 48M filas',
          'Pool PgBouncer compartido entre OLTP y reportes',
        ],
        metodo: ['Ausencia de gate automático de rendimiento SQL en CI/CD'],
        material: ['Script de migración v4.2 sin índice compuesto'],
        manoDeObra: ['Aprobación apresurada de PR de esquema sin plan EXPLAIN ANALYZE'],
      },
      historyLog: [
        crearEventoHistorial({
          tipo: 'creacion',
          actor: 'Marco Ríos (DBA Nivel 2)',
          accion: 'Problema PRB-0109 abierto (P1 - Crítica)',
          detalle: 'CI asociado: DB-PG-FACT-02 · Categoría Base de Datos.',
          timestamp: haceMin(210),
        }),
        crearEventoHistorial({
          tipo: 'rca_actualizado',
          actor: 'Marco Ríos (DBA Nivel 2)',
          accion: 'Causa raíz identificada en análisis RCA',
          detalle: 'Falta índice compuesto (empresa_id, fecha_emision) en facturas_detalle.',
          timestamp: haceMin(140),
        }),
      ],
    },
    {
      id: 'PRB-0110',
      titulo:
        'Fuga de memoria progresiva en daemon IKEv2 de concentrador VPN Madrid',
      descripcion:
        'El consumo de RAM en FW-PALO-MAD-01 escala al 94% cada 18 horas provocando renegociación masiva de túneles IPsec. Pendiente de completar RCA en N2.',
      estado: 'Investigación',
      prioridad: 'P2 - Alta',
      categoria: 'Redes & Conectividad',
      ciAfectado: 'FW-PALO-MAD-01',
      responsable: 'Sofía Méndez (Ingeniera Redes N2)',
      creadoEn: haceMin(155),
      workaround:
        'Programar conmutación preventiva hacia nodo pasivo FW-PALO-MAD-02 cada 12 horas mientras se realiza el RCA.',
      causaRaiz: '',
      analisis5Porques: ['', '', '', '', ''],
      ishikawa: crearIshikawaVacio(),
      historyLog: [
        crearEventoHistorial({
          tipo: 'creacion',
          actor: 'Sofía Méndez (Ingeniera Redes N2)',
          accion: 'Problema PRB-0110 abierto (P2 - Alta)',
          detalle: 'CI asociado: FW-PALO-MAD-01 · En fase de investigación RCA.',
          timestamp: haceMin(155),
        }),
      ],
    },
  ];

  // 3 tickets iniciales de prueba con cronómetro regresivo en vivo
  const tickets: Ticket[] = [
    {
      id: 'INC-2041',
      titulo:
        'Caída de autenticación SSO (SAML 2.0) en Portal Corporativo de Finanzas',
      descripcion:
        'Más de 85 usuarios del área financiera reciben error de validación temporal al iniciar sesión en el portal corporativo. N1 verificó credenciales en AD y escaló a N2.',
      canalEntrada: 'Teléfono',
      estado: 'Escalado (N2)',
      nivel: 'N2',
      prioridad: 'P1 - Crítica',
      impacto: 'Alto',
      urgencia: 'Alta',
      categoria: 'IAM / Identidad',
      ciAfectado: 'IDP-OKTA-PROD-01',
      solicitante: 'Lucía Fernández (Finanzas)',
      asignadoA: 'Equipo N2 · Identidad y Accesos',
      creadoEn: haceMin(13),
      slaObjetivoMin: 15,
      slaTranscurridoMin: 13,
      slaObjetivoSeg: 15 * 60,
      slaTranscurridoSeg: 13 * 60 + 15,
      slaPausado: false,
      slaIncumplido: false,
      problemaVinculadoId: 'PRB-0108',
      notasTecnicas: [
        {
          id: 'NT-1',
          autor: 'Carlos Vega (N1)',
          fecha: haceMin(10),
          tipo: 'Escalado',
          texto:
            'Reportado por línea directa de incidencias críticas. Descartado bloqueo en AD; errores SAML NotBefore en logs. Escalado a N2 IAM.',
        },
      ],
      historyLog: [
        crearEventoHistorial({
          tipo: 'creacion',
          actor: 'Carlos Vega (N1)',
          accion: 'Ticket creado vía Teléfono · Prioridad P1 - Crítica',
          detalle: 'CI inicial: IDP-OKTA-PROD-01 · SLA objetivo 15 min.',
          timestamp: haceMin(13),
        }),
        crearEventoHistorial({
          tipo: 'escalado_n2',
          actor: 'Carlos Vega (N1)',
          accion: 'Escalado a Equipo N2 · Identidad y Accesos',
          detalle: 'Estado cambiado a Escalado (N2) tras verificar credenciales AD.',
          timestamp: haceMin(10),
        }),
        crearEventoHistorial({
          tipo: 'problema_vinculado',
          actor: 'Sistema ITIL',
          accion: 'Vinculado al Problema Maestro PRB-0108',
          detalle: 'Patrón coincidente con desfase NTP / aserciones SAML 2.0.',
          timestamp: haceMin(9),
        }),
      ],
    },
    {
      id: 'INC-2042',
      titulo:
        'Latencia severa (>4.5s) en clúster PostgreSQL de Facturación Electrónica',
      descripcion:
        'El módulo de emisión de facturas arroja timeouts intermitentes. El monitor de base de datos indica saturación en el pool de conexiones PgBouncer.',
      canalEntrada: 'Monitorización',
      estado: 'Escalado (N2)',
      nivel: 'N2',
      prioridad: 'P2 - Alta',
      impacto: 'Alto',
      urgencia: 'Media',
      categoria: 'Base de Datos',
      ciAfectado: 'DB-PG-FACT-02',
      solicitante: 'Monitorización Prometheus',
      asignadoA: 'Equipo N2 · DBA',
      creadoEn: haceMin(11),
      slaObjetivoMin: 30,
      slaTranscurridoMin: 11,
      slaObjetivoSeg: 30 * 60,
      slaTranscurridoSeg: 11 * 60,
      slaPausado: false,
      slaIncumplido: false,
      problemaVinculadoId: 'PRB-0109',
      notasTecnicas: [
        {
          id: 'NT-2',
          autor: 'Marco Ríos (N2)',
          fecha: haceMin(6),
          tipo: 'Diagnóstico N2',
          texto:
            'Confirmado Sequential Scan en tabla facturas_detalle. Evaluando creación de índice CONCURRENTLY.',
        },
      ],
      historyLog: [
        crearEventoHistorial({
          tipo: 'creacion',
          actor: 'Monitorización Prometheus',
          accion: 'Ticket creado vía Monitorización · Prioridad P2 - Alta',
          detalle: 'CI asociado: DB-PG-FACT-02 · SLA objetivo 30 min.',
          timestamp: haceMin(11),
        }),
        crearEventoHistorial({
          tipo: 'problema_vinculado',
          actor: 'Marco Ríos (N2)',
          accion: 'Vinculado al Problema Maestro PRB-0109',
          detalle: 'Saturación de pool PgBouncer en facturas_detalle.',
          timestamp: haceMin(6),
        }),
      ],
    },
    {
      id: 'INC-2043',
      titulo: 'No hay acceso a la VPN corporativa en delegación Madrid',
      descripcion:
        'Varios consultores reportan desconexión inmediata tras validar MFA en el concentrador VPN de Madrid (código error IKE_TIMEOUT).',
      canalEntrada: 'Portal de Usuario',
      estado: 'En Progreso (N1)',
      nivel: 'N1',
      prioridad: 'P3 - Media',
      impacto: 'Medio',
      urgencia: 'Media',
      categoria: 'Redes & Conectividad',
      ciAfectado: 'FW-PALO-MAD-01',
      solicitante: 'Javier Ortiz (Consultoría)',
      asignadoA: 'Laura Gil (N1)',
      creadoEn: haceMin(8),
      slaObjetivoMin: 60,
      slaTranscurridoMin: 8,
      slaObjetivoSeg: 60 * 60,
      slaTranscurridoSeg: 8 * 60,
      slaPausado: false,
      slaIncumplido: false,
      problemaVinculadoId: 'PRB-0110',
      notasTecnicas: [],
      historyLog: [
        crearEventoHistorial({
          tipo: 'creacion',
          actor: 'Laura Gil (N1)',
          accion: 'Ticket creado vía Portal de Usuario · Prioridad P3 - Media',
          detalle: 'CI asociado: FW-PALO-MAD-01 · SLA objetivo 60 min.',
          timestamp: haceMin(8),
        }),
        crearEventoHistorial({
          tipo: 'cambio_estado',
          actor: 'Laura Gil (N1)',
          accion: 'Estado cambiado a En Progreso (N1)',
          detalle: 'Inicio de diagnóstico inicial de VPN y MFA.',
          timestamp: haceMin(7),
        }),
      ],
    },
  ];

  const rfcs: SolicitudCambioRfc[] = [
    {
      id: 'RFC-0501',
      problemaId: 'PRB-0108',
      ciAfectado: 'FW-DMZ-EDGE-01',
      titulo:
        'Habilitar excepción permanente UDP/123 hacia servidores NTP internos en firewall DMZ',
      tipo: 'Normal',
      riesgo: 'Medio',
      estado: 'Pendiente Aprobación CAB',
      planImplementacion:
        '1. Exportar backup de configuración actual de FW-DMZ-EDGE-01. 2. Añadir regla ACL permitiendo UDP/123 desde subred IdP hacia stratum-1 interno. 3. Verificar sincronización chronyc tracking en nodos IdP-01/02/03 y validar login SAML.',
      planRollback:
        '1. Restaurar snapshot previo de reglas ACL en FW-DMZ-EDGE-01 mediante CLI rollback-config. 2. Mantener clock-skew temporal de ±180s en Service Provider hasta nueva ventana.',
      ventanaMantenimiento: 'Jueves 22:00 - 23:00 UTC',
      solicitante: 'Elena Vance (Especialista IAM N2)',
      creadoEn: haceMin(45),
    },
  ];

  const articulosKb = crearArticulosKbIniciales();

  const metricas = recalcularMetricas(tickets, problemas, 0, rfcs, articulosKb);

  return {
    version: '11.0.0',
    tickets,
    problemas,
    rfcs,
    articulosKb,
    metricas,
    evaluacion: crearEvaluacionInicial(),
    simulacionMinutosAvanzados: 0,
    velocidadSimulacion: 1,
    politicaEscaladoSla: 'reiniciar',
    rolActivo: 'sdm',
  };
}

export function cargarEstadoLocalStorage(): ServiceDeskGlobalState {
  // Misma normalización que la importación JSON: un estado guardado dañado o de una
  // versión anterior no puede dejar la aplicación en blanco al recargar.
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const normalizado = raw ? normalizarEstadoImportado(JSON.parse(raw)) : null;
    if (normalizado) return normalizado;
  } catch {
    // JSON ilegible: se vuelve al estado inicial
  }
  const inicial = crearEstadoInicial();
  guardarEstadoLocalStorage(inicial);
  return inicial;
}

export function guardarEstadoLocalStorage(estado: ServiceDeskGlobalState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    exponerEstadoGlobal(estado);
  } catch {
    // Ignore storage quota errors in restricted sandboxes
  }
}

export function exponerEstadoGlobal(estado: ServiceDeskGlobalState): void {
  if (typeof window !== 'undefined') {
    (
      window as unknown as {
        ServiceDeskLabState?: ServiceDeskGlobalState;
      }
    ).ServiceDeskLabState = estado;
  }
}

export function normalizarEstadoImportado(
  raw: unknown
): ServiceDeskGlobalState | null {
  if (!raw || typeof raw !== 'object') return null;
  const parsed = raw as Partial<ServiceDeskGlobalState>;
  if (!Array.isArray(parsed.tickets) || !Array.isArray(parsed.problemas)) {
    return null;
  }

  // Solo se aceptan registros con la forma mínima: un elemento suelto mal formado
  // (editado a mano, truncado...) rompía el renderizado y dejaba la app en blanco.
  const esTexto = (v: unknown) => typeof v === 'string' && v.length > 0;
  const esRegistro = (v: unknown): v is Record<string, unknown> =>
    Boolean(v) && typeof v === 'object' && !Array.isArray(v);
  const ticketsValidos = (parsed.tickets as unknown[]).filter(
    (t): t is Ticket =>
      esRegistro(t) && esTexto(t.id) && esTexto(t.titulo) && esTexto(t.prioridad) && esTexto(t.estado)
  );
  const problemasValidos = (parsed.problemas as unknown[]).filter(
    (p): p is Problema =>
      esRegistro(p) && esTexto(p.id) && esTexto(p.titulo) && esTexto(p.prioridad) && esTexto(p.estado)
  );
  if (ticketsValidos.length !== parsed.tickets.length || problemasValidos.length !== parsed.problemas.length) {
    return null;
  }

  const ticketsNormalizados: Ticket[] = ticketsValidos.map((t) => {
    const slaObjetivoSeg =
      typeof t.slaObjetivoSeg === 'number'
        ? t.slaObjetivoSeg
        : (t.slaObjetivoMin || 60) * 60;
    const slaTranscurridoSeg =
      typeof t.slaTranscurridoSeg === 'number'
        ? t.slaTranscurridoSeg
        : (t.slaTranscurridoMin || 0) * 60;
    return {
      ...t,
      canalEntrada: t.canalEntrada ?? 'Portal de Usuario',
      slaObjetivoSeg,
      slaTranscurridoSeg,
      slaObjetivoMin: Math.round(slaObjetivoSeg / 60),
      slaTranscurridoMin: Math.floor(slaTranscurridoSeg / 60),
      slaPausado: Boolean(t.slaPausado),
      // Un SLA vencido queda vencido: reiniciar el reloj al escalar no borra el incumplimiento
      slaIncumplido:
        Boolean(t.slaIncumplido) ||
        (t.estado !== 'Resuelto' && slaTranscurridoSeg > slaObjetivoSeg),
      notasTecnicas: Array.isArray(t.notasTecnicas) ? t.notasTecnicas : [],
      historyLog:
        Array.isArray(t.historyLog) && t.historyLog.length > 0
          ? t.historyLog
          : [
              crearEventoHistorial({
                tipo: 'creacion',
                actor: t.asignadoA || 'Sistema ITIL',
                accion: `Ticket ${t.id} importado (${t.prioridad})`,
                detalle: `CI: ${t.ciAfectado}`,
                timestamp: t.creadoEn,
              }),
            ],
    };
  });

  const problemasNormalizados: Problema[] = problemasValidos.map((p) => ({
    ...p,
    ishikawa: normalizarIshikawa(p.ishikawa),
    analisis5Porques: Array.isArray(p.analisis5Porques)
      ? [
          p.analisis5Porques[0] ?? '',
          p.analisis5Porques[1] ?? '',
          p.analisis5Porques[2] ?? '',
          p.analisis5Porques[3] ?? '',
          p.analisis5Porques[4] ?? '',
        ]
      : ['', '', '', '', ''],
    historyLog:
      Array.isArray(p.historyLog) && p.historyLog.length > 0
        ? p.historyLog
        : [
            crearEventoHistorial({
              tipo: 'creacion',
              actor: p.responsable || 'Gestor de Problemas N2',
              accion: `Problema ${p.id} importado (${p.prioridad})`,
              detalle: `CI: ${p.ciAfectado}`,
              timestamp: p.creadoEn,
            }),
          ],
  }));

  const simulacionMinutosAvanzados = parsed.simulacionMinutosAvanzados ?? 0;
  const velocidadSimulacion: VelocidadSimulacion =
    parsed.velocidadSimulacion === 0 ||
    parsed.velocidadSimulacion === 1 ||
    parsed.velocidadSimulacion === 10 ||
    parsed.velocidadSimulacion === 60
      ? parsed.velocidadSimulacion
      : 1;
  const politicaEscaladoSla: PoliticaEscaladoSla =
    parsed.politicaEscaladoSla === 'pausar' ? 'pausar' : 'reiniciar';
  const rolActivo: RolSimulador =
    parsed.rolActivo === 'usuario' ||
    parsed.rolActivo === 'n1' ||
    parsed.rolActivo === 'n2' ||
    parsed.rolActivo === 'sdm'
      ? parsed.rolActivo
      : 'sdm';

  const evaluacionBase = parsed.evaluacion ?? crearEvaluacionInicial();
  const evaluacion: EvaluacionAlumno = {
    ...evaluacionBase,
    infraccionesSinRfc: evaluacionBase.infraccionesSinRfc ?? 0,
    fcrsCumplidos: evaluacionBase.fcrsCumplidos ?? 0,
    eventosRegistrados: Array.isArray(evaluacionBase.eventosRegistrados)
      ? evaluacionBase.eventosRegistrados
      : [],
    logros: Array.isArray(evaluacionBase.logros) ? evaluacionBase.logros : [],
  };

  const rfcsNormalizados: SolicitudCambioRfc[] = Array.isArray(parsed.rfcs)
    ? parsed.rfcs.map((r) => ({
        ...r,
        estado:
          r.estado === 'En Deliberación CAB'
            ? 'Pendiente Aprobación CAB'
            : r.estado,
      }))
    : [];

  const articulosKbNormalizados: ArticuloKb[] =
    Array.isArray(parsed.articulosKb) && parsed.articulosKb.length > 0
      ? parsed.articulosKb
      : crearArticulosKbIniciales();

  const metricas = recalcularMetricas(
    ticketsNormalizados,
    problemasNormalizados,
    simulacionMinutosAvanzados,
    rfcsNormalizados,
    articulosKbNormalizados
  );

  return {
    version: parsed.version ?? '11.0.0',
    tickets: ticketsNormalizados,
    problemas: problemasNormalizados,
    rfcs: rfcsNormalizados,
    articulosKb: articulosKbNormalizados,
    metricas,
    evaluacion,
    simulacionMinutosAvanzados,
    velocidadSimulacion,
    politicaEscaladoSla,
    rolActivo,
  };
}

export function validarEImportarEstadoJson(
  jsonText: string
): { ok: true; estado: ServiceDeskGlobalState } | { ok: false; error: string } {
  try {
    const raw = JSON.parse(jsonText) as unknown;
    const normalizado = normalizarEstadoImportado(raw);
    if (!normalizado) {
      return {
        ok: false,
        error:
          'El archivo JSON no corresponde a una sesión válida de ServiceDeskLab.',
      };
    }
    return { ok: true, estado: normalizado };
  } catch {
    return {
      ok: false,
      error: 'No se pudo analizar el JSON. Comprueba que el archivo no esté dañado.',
    };
  }
}
