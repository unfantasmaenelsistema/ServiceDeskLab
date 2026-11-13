'use strict';

(function () {
  const STORAGE_KEY = 'servicedesklab_ghpages_v1';

  const ESCENARIOS_SIMULACION = [
    {
      id: 'ESC-RANSOMWARE',
      titulo: 'Ataque de Ransomware encriptando el ERP',
      subtitulo:
        'Incidente crítico de seguridad con múltiples departamentos llamando por archivos cifrados.',
      categoriaPrincipal: 'Seguridad & Certificados',
      severidadEsperada: 'P1 - Crítica',
      objetivoDidactico:
        'Contener propagación, agrupar tickets en un Problema Maestro de Seguridad y documentar RCA antes del cierre.',
      duracionTotalSeg: 11,
      tickets: [
        {
          retrasoMs: 0,
          titulo:
            '¡Urgente! Archivos de facturación en carpeta ERP aparecen con extensión .lockbit3',
          descripcion:
            'Usuaria desesperada al teléfono indica que ninguna hoja ni PDF del ERP abre y los ficheros cambiaron de nombre.',
          canalEntrada: 'Teléfono',
          categoria: 'Seguridad & Certificados',
          ciAfectado: 'SRV-ERP-FS-01',
          solicitante: 'Marta Gómez (Contabilidad)',
          impacto: 'Alto',
          urgencia: 'Alta',
          nivelInicial: 'N1',
        },
        {
          retrasoMs: 2600,
          titulo:
            'Almacén parado: aparece nota de rescate README_DECRYPT.txt en terminales',
          descripcion:
            'El encargado de logística llama alarmado porque los albaranes no se imprimen y los discos de red fallan.',
          canalEntrada: 'Teléfono',
          categoria: 'Seguridad & Certificados',
          ciAfectado: 'SRV-ERP-FS-01',
          solicitante: 'Carlos Duarte (Logística)',
          impacto: 'Alto',
          urgencia: 'Alta',
          nivelInicial: 'N1',
        },
        {
          retrasoMs: 5200,
          titulo:
            'Alerta SIEM Crítica: cifrado masivo vía SMB (445) desde host WS-CONT-014',
          descripcion:
            'Regla EDR/SIEM detecta >12.000 operaciones de renombrado por minuto en /srv/erp-data. Requiere aislamiento inmediato.',
          canalEntrada: 'Monitorización',
          categoria: 'Seguridad & Certificados',
          ciAfectado: 'WS-CONT-014',
          solicitante: 'SIEM Wazuh · SOC',
          impacto: 'Alto',
          urgencia: 'Alta',
          nivelInicial: 'N2',
        },
        {
          retrasoMs: 8000,
          titulo:
            'Dirección exige estado del ERP: clientes bloqueados sin confirmar pedidos',
          descripcion:
            'Llamada directa solicitando tiempo estimado de recuperación y activación de contingencia.',
          canalEntrada: 'Teléfono',
          categoria: 'Seguridad & Certificados',
          ciAfectado: 'APP-ERP-PROD-01',
          solicitante: 'Roberto Sáenz (Dirección)',
          impacto: 'Alto',
          urgencia: 'Alta',
          nivelInicial: 'N1',
        },
      ],
    },
    {
      id: 'ESC-SWITCH-CORE',
      titulo: 'Caída del Switch Core en Sede Central',
      subtitulo:
        'Tormenta de llamadas por pérdida simultánea de red cableada, Wi-Fi y telefonía VoIP.',
      categoriaPrincipal: 'Redes & Conectividad',
      severidadEsperada: 'P1 - Crítica',
      objetivoDidactico:
        'Correlacionar síntomas dispersos hacia SW-CORE-DIST-01, escalar a N2 y aplicar Workaround.',
      duracionTotalSeg: 10,
      tickets: [
        {
          retrasoMs: 0,
          titulo: '¡Sin red ni teléfono en toda la Planta 3! Nadie puede trabajar',
          descripcion:
            'Llamada desde móvil reportando cable de red desconectado y teléfonos IP reiniciándose.',
          canalEntrada: 'Teléfono',
          categoria: 'Redes & Conectividad',
          ciAfectado: 'SW-CORE-DIST-01',
          solicitante: 'Patricia Navas (Atención Cliente)',
          impacto: 'Alto',
          urgencia: 'Alta',
          nivelInicial: 'N1',
        },
        {
          retrasoMs: 2500,
          titulo: 'Tornos de acceso y Wi-Fi corporativa caídos en recepción',
          descripcion:
            'Control de accesos sin validación contra RADIUS y empleados sin conectividad inalámbrica.',
          canalEntrada: 'Teléfono',
          categoria: 'Redes & Conectividad',
          ciAfectado: 'WLC-WIFI-MAD-01',
          solicitante: 'Recepción Sede Central',
          impacto: 'Alto',
          urgencia: 'Media',
          nivelInicial: 'N1',
        },
        {
          retrasoMs: 5200,
          titulo:
            'SNMP Unreachable en SW-CORE-DIST-01 (pérdida OSPF y VLANs 10/20/30)',
          descripcion:
            'LibreNMS detecta caída total del plano de control en el switch core primario.',
          canalEntrada: 'Monitorización',
          categoria: 'Redes & Conectividad',
          ciAfectado: 'SW-CORE-DIST-01',
          solicitante: 'Monitorización LibreNMS',
          impacto: 'Alto',
          urgencia: 'Alta',
          nivelInicial: 'N2',
        },
        {
          retrasoMs: 8000,
          titulo:
            'Desconexión iSCSI entre ESXi-02 y cabina de almacenamiento por caída LACP',
          descripcion:
            'Equipo de sistemas reporta degradación de datastores por pérdida de enlaces trunk.',
          canalEntrada: 'Correo Corporativo',
          categoria: 'Infraestructura Cloud',
          ciAfectado: 'HV-ESXI-PROD-02',
          solicitante: 'Diego Morales (Sistemas)',
          impacto: 'Alto',
          urgencia: 'Alta',
          nivelInicial: 'N2',
        },
      ],
    },
    {
      id: 'ESC-WIN-UPDATE',
      titulo: 'Falsa alarma por actualización masiva de Windows',
      subtitulo:
        'Oleada de usuarios asustados tras reinicio automático del parche KB5034765.',
      categoriaPrincipal: 'Puesto de Trabajo',
      severidadEsperada: 'P3 - Media',
      objetivoDidactico:
        'Evitar la sobreclasificación P1: verificar causa benigna, agrupar avisos y resolver sin falsos escalados.',
      duracionTotalSeg: 8,
      tickets: [
        {
          retrasoMs: 0,
          titulo:
            '¡Mi ordenador tarda 5 minutos en arrancar y la barra de tareas sale en blanco!',
          descripcion:
            'Usuario nervioso cree que tiene un virus tras ver "Configurando actualizaciones" al encender.',
          canalEntrada: 'Teléfono',
          categoria: 'Puesto de Trabajo',
          ciAfectado: 'WS-RRHH-009',
          solicitante: 'Nuria Blanco (RRHH)',
          impacto: 'Bajo',
          urgencia: 'Media',
          nivelInicial: 'N1',
        },
        {
          retrasoMs: 2600,
          titulo:
            '¡Creo que nos han hackeado! El PC se reinició solo y parpadeó el escritorio',
          descripcion:
            'Usuaria de Marketing llama alarmada pidiendo desconectar la oficina tras un reinicio de Windows.',
          canalEntrada: 'Teléfono',
          categoria: 'Puesto de Trabajo',
          ciAfectado: 'WS-MKT-021',
          solicitante: 'Paula Serrano (Marketing)',
          impacto: 'Bajo',
          urgencia: 'Media',
          nivelInicial: 'N1',
        },
        {
          retrasoMs: 5400,
          titulo:
            'Aviso Endpoint Manager: despliegue programado de parche acumulativo KB5034765',
          descripcion:
            'Ventana de parcheo estándar en 45 equipos; sin compromiso de seguridad ni caída de servicios core.',
          canalEntrada: 'Monitorización',
          categoria: 'Puesto de Trabajo',
          ciAfectado: 'WSUS-DEPLOY-01',
          solicitante: 'Endpoint Manager',
          impacto: 'Bajo',
          urgencia: 'Baja',
          nivelInicial: 'N1',
        },
      ],
    },
  ];

  const ui = {
    vista: 'dashboard',
    filtroCola: 'todos',
    busqueda: '',
    seleccionados: [],
    ticketDrawerId: null,
    problemaRcaId: null,
    problemaTabs: {},
    modal: null,
    printContext: null,
    menuMovil: false,
    confirmandoReset: false,
    escenarioEnCurso: null,
  };

  let scenarioTimers = [];

  function escapeHtml(val) {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function calcularPrioridadITIL(impacto, urgencia) {
    if (impacto === 'Alto' && urgencia === 'Alta') {
      return { prioridad: 'P1 - Crítica', slaObjetivoMin: 15, slaObjetivoSeg: 900 };
    }
    if (
      (impacto === 'Alto' && urgencia === 'Media') ||
      (impacto === 'Medio' && urgencia === 'Alta')
    ) {
      return { prioridad: 'P2 - Alta', slaObjetivoMin: 30, slaObjetivoSeg: 1800 };
    }
    if (
      (impacto === 'Alto' && urgencia === 'Baja') ||
      (impacto === 'Medio' && urgencia === 'Media') ||
      (impacto === 'Bajo' && urgencia === 'Alta')
    ) {
      return { prioridad: 'P3 - Media', slaObjetivoMin: 60, slaObjetivoSeg: 3600 };
    }
    return { prioridad: 'P4 - Baja', slaObjetivoMin: 120, slaObjetivoSeg: 7200 };
  }

  function asignarEquipoN2(categoria) {
    if (categoria.includes('IAM')) return 'Equipo N2 · Identidad y Accesos';
    if (categoria.includes('Base de Datos')) return 'Equipo N2 · DBA';
    if (categoria.includes('Redes')) return 'Equipo N2 · Redes & VPN';
    if (categoria.includes('Cloud')) return 'Equipo N2 · SRE Cloud';
    if (categoria.includes('Seguridad')) return 'Equipo N2 · SecOps';
    return 'Equipo N2 · Soporte Especializado';
  }

  function evaluarEstadoRca(problema) {
    const pasosPorques = (problema.analisis5Porques || []).filter(
      (p) => p && p.trim().length >= 3
    ).length;
    const tieneCausaRaiz = (problema.causaRaiz || '').trim().length >= 5;
    const porquesOk = pasosPorques >= 3 && tieneCausaRaiz;
    const ish = problema.ishikawa || {
      maquina: [],
      metodo: [],
      material: [],
      manoDeObra: [],
    };
    const totalCausasIshikawa =
      (ish.maquina || []).length +
      (ish.metodo || []).length +
      (ish.material || []).length +
      (ish.manoDeObra || []).length;
    const ishikawaOk = totalCausasIshikawa >= 1;
    const requiereRcaParaCerrar =
      problema.prioridad === 'P1 - Crítica' || problema.prioridad === 'P2 - Alta';
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

  function registrarEvento(ev, delta, concepto, referenciaId, tipo) {
    const nuevo = {
      id: 'EV-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      fecha: new Date().toISOString(),
      delta,
      concepto,
      referenciaId,
    };
    return {
      puntuacion: Math.max(0, ev.puntuacion + delta),
      clasificacionesCorrectas:
        ev.clasificacionesCorrectas + (tipo === 'clasificacion' && delta > 0 ? 1 : 0),
      penalizacionesSla: ev.penalizacionesSla + (tipo === 'sla_vencido' ? 1 : 0),
      cierresSinCausaRaiz: ev.cierresSinCausaRaiz + (tipo === 'cierre_sin_rca' ? 1 : 0),
      rcasCompletados: ev.rcasCompletados + (tipo === 'rca_completo' ? 1 : 0),
      historialEventos: [nuevo, ...(ev.historialEventos || [])].slice(0, 12),
    };
  }

  function evaluarClasificacionMatriz(titulo, descripcion, prioridad) {
    const texto = (titulo + ' ' + descripcion).toLowerCase();
    const critico =
      /ca[ií]da|masiv|producci[oó]n|sso|502|503|504|outage|bloqueo|ransomware|vpn|base de datos/.test(
        texto
      );
    const menor =
      /impresora|cuota|solicitud|buz[oó]n|teclado|rat[oó]n|parche|lento/.test(texto);
    if (critico && (prioridad === 'P1 - Crítica' || prioridad === 'P2 - Alta')) {
      return {
        delta: 15,
        motivo: 'Clasificación precisa de incidente crítico en matriz Impacto/Urgencia',
      };
    }
    if (menor && (prioridad === 'P3 - Media' || prioridad === 'P4 - Baja')) {
      return {
        delta: 15,
        motivo: 'Clasificación adecuada de incidente menor en matriz Impacto/Urgencia',
      };
    }
    if (critico && prioridad === 'P4 - Baja') {
      return {
        delta: -10,
        motivo: 'Subestimación de prioridad en incidente de alto impacto',
      };
    }
    if (menor && prioridad === 'P1 - Crítica') {
      return {
        delta: -10,
        motivo: 'Sobreclasificación P1 para incidencia individual o menor',
      };
    }
    return {
      delta: 10,
      motivo: 'Clasificación registrada conforme a matriz ITIL v4',
    };
  }

  function crearEstadoInicial() {
    const now = Date.now();
    const haceMin = (m) => new Date(now - m * 60000).toISOString();
    return {
      version: '6.0.0',
      velocidadSimulacion: 1,
      politicaEscaladoSla: 'reiniciar',
      simulacionMinutosAvanzados: 0,
      evaluacion: {
        puntuacion: 100,
        clasificacionesCorrectas: 0,
        penalizacionesSla: 0,
        cierresSinCausaRaiz: 0,
        rcasCompletados: 0,
        historialEventos: [
          {
            id: 'EV-INIT',
            fecha: new Date().toISOString(),
            delta: 0,
            concepto: 'Puntuación base inicial del turno N2',
            referenciaId: 'SISTEMA',
          },
        ],
      },
      problemas: [
        {
          id: 'PRB-0108',
          titulo:
            'Desincronización NTP en nodos IdP provoca rechazo de aserciones SAML 2.0',
          descripcion:
            'Múltiples usuarios corporativos reciben error SAML Assertion NotBefore al autenticarse vía SSO.',
          estado: 'Error Conocido (KEDB)',
          prioridad: 'P1 - Crítica',
          categoria: 'IAM / Identidad',
          ciAfectado: 'IDP-OKTA-PROD-01',
          responsable: 'Elena Vance (N2 IAM)',
          creadoEn: haceMin(320),
          workaround:
            'Ampliar ventana clock-skew a ±180s en el SP y resincronizar chronyd en IdP-02/03.',
          causaRaiz:
            'Regla de firewall DMZ bloqueó tráfico UDP/123 hacia servidores NTP internos tras cambio RFC-4412.',
          analisis5Porques: [
            'Los usuarios no pueden iniciar sesión en el portal corporativo vía SSO.',
            'Las aserciones SAML son rechazadas por desfase horario (+92s).',
            'El demonio chronyd lleva 48h sin sincronizar con stratum-1.',
            'Las peticiones UDP/123 son descartadas por el firewall perimetral.',
            'En el cambio RFC-4412 se omitió la excepción NTP en la DMZ.',
          ],
          ishikawa: {
            maquina: ['Tolerancia SAML 0s skew', 'Regla DROP en UDP/123'],
            metodo: ['Checklist de despliegue sin prueba de deriva NTP'],
            material: ['Plantilla de políticas DMZ desactualizada'],
            manoDeObra: ['Falta de validación cruzada en RFC-4412'],
          },
        },
        {
          id: 'PRB-0110',
          titulo:
            'Fuga de memoria progresiva en daemon IKEv2 de concentrador VPN Madrid',
          descripcion:
            'Consumo de RAM en FW-PALO-MAD-01 escala al 94% cada 18 horas. Pendiente de completar RCA en N2.',
          estado: 'Investigación',
          prioridad: 'P2 - Alta',
          categoria: 'Redes & Conectividad',
          ciAfectado: 'FW-PALO-MAD-01',
          responsable: 'Sofía Méndez (N2 Redes)',
          creadoEn: haceMin(155),
          workaround:
            'Conmutación preventiva hacia nodo pasivo FW-PALO-MAD-02 cada 12 horas.',
          causaRaiz: '',
          analisis5Porques: ['', '', '', '', ''],
          ishikawa: { maquina: [], metodo: [], material: [], manoDeObra: [] },
        },
      ],
      tickets: [
        {
          id: 'INC-2041',
          titulo:
            'Caída de autenticación SSO (SAML 2.0) en Portal Corporativo de Finanzas',
          descripcion:
            'Más de 85 usuarios del área financiera reciben error de validación temporal al iniciar sesión en el portal.',
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
          slaObjetivoSeg: 900,
          slaTranscurridoSeg: 795,
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
                'Descartado bloqueo en AD; errores SAML NotBefore en logs. Escalado a N2 IAM.',
            },
          ],
        },
        {
          id: 'INC-2042',
          titulo:
            'Latencia severa (>4.5s) en clúster PostgreSQL de Facturación Electrónica',
          descripcion:
            'El módulo de facturación arroja timeouts HTTP 504 por saturación en PgBouncer.',
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
          slaObjetivoSeg: 1800,
          slaTranscurridoSeg: 660,
          slaPausado: false,
          slaIncumplido: false,
          problemaVinculadoId: null,
          notasTecnicas: [],
        },
        {
          id: 'INC-2043',
          titulo: 'No hay acceso a la VPN corporativa en delegación Madrid',
          descripcion:
            'Varios consultores reportan desconexión inmediata tras validar MFA (error IKE_TIMEOUT).',
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
          slaObjetivoSeg: 3600,
          slaTranscurridoSeg: 480,
          slaPausado: false,
          slaIncumplido: false,
          problemaVinculadoId: 'PRB-0110',
          notasTecnicas: [],
        },
      ],
    };
  }

  function cargarEstado() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const init = crearEstadoInicial();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
        return init;
      }
      return JSON.parse(raw);
    } catch {
      return crearEstadoInicial();
    }
  }

  let estado = cargarEstado();
  ui.problemaRcaId = estado.problemas[0] ? estado.problemas[0].id : null;

  function guardarEstado() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
      window.ServiceDeskLabState = estado;
    } catch {
      // Ignore quota issues
    }
  }

  function calcularMetricas() {
    const abiertos = estado.tickets.filter((t) => t.estado !== 'Resuelto');
    const resueltos = estado.tickets.filter((t) => t.estado === 'Resuelto');
    const slaIncumplidos = estado.tickets.filter((t) => t.slaIncumplido).length;
    const tasaCumplimientoSla =
      estado.tickets.length > 0
        ? Math.round(
            ((estado.tickets.length - slaIncumplidos) / estado.tickets.length) * 1000
          ) / 10
        : 100;
    const problemasActivos = estado.problemas.filter(
      (p) => p.estado !== 'Resuelto'
    ).length;
    const erroresConocidos = estado.problemas.filter(
      (p) => p.estado === 'Error Conocido (KEDB)'
    ).length;

    return {
      ticketsTotales: estado.tickets.length,
      ticketsAbiertos: abiertos.length,
      ticketsN1: abiertos.filter((t) => t.nivel === 'N1').length,
      ticketsN2: abiertos.filter((t) => t.nivel === 'N2').length,
      ticketsResueltos: resueltos.length,
      slaIncumplidos,
      tasaCumplimientoSla,
      problemasActivos,
      erroresConocidos,
    };
  }

  function fmtTiempo(seg) {
    const neg = seg < 0;
    const abs = Math.abs(Math.floor(seg));
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = abs % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return (neg ? '-' : '') + (h > 0 ? pad(h) + ':' : '') + pad(m) + ':' + pad(s);
  }

  function colorPrioridad(p) {
    if (p === 'P1 - Crítica') return 'text-red-400';
    if (p === 'P2 - Alta') return 'text-amber-400';
    if (p === 'P3 - Media') return 'text-blue-400';
    return 'text-slate-400';
  }

  function crearTicketObj(payload, evaluarMatriz) {
    const maxNum = estado.tickets.reduce((max, t) => {
      const n = parseInt(t.id.replace('INC-', ''), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 2040);
    const id = 'INC-' + (maxNum + 1);
    const nuevo = {
      ...payload,
      id,
      creadoEn: new Date().toISOString(),
      notasTecnicas: [
        {
          id: 'NT-' + Date.now(),
          autor: 'Sistema ITIL',
          fecha: new Date().toISOString(),
          tipo: 'Sistema',
          texto: `Ticket ${id} recibido vía ${payload.canalEntrada} (${payload.prioridad}).`,
        },
      ],
    };
    estado.tickets.unshift(nuevo);
    if (evaluarMatriz) {
      const res = evaluarClasificacionMatriz(
        payload.titulo,
        payload.descripcion,
        payload.prioridad
      );
      estado.evaluacion = registrarEvento(
        estado.evaluacion,
        res.delta,
        res.motivo,
        id,
        'clasificacion'
      );
    }
    guardarEstado();
    return nuevo;
  }

  function escalarN2(ticketId) {
    const reiniciar = estado.politicaEscaladoSla === 'reiniciar';
    estado.tickets = estado.tickets.map((t) => {
      if (t.id !== ticketId) return t;
      const eq = asignarEquipoN2(t.categoria);
      return {
        ...t,
        nivel: 'N2',
        estado: 'Escalado (N2)',
        asignadoA: eq,
        slaTranscurridoSeg: reiniciar ? 0 : t.slaTranscurridoSeg,
        slaIncumplido: reiniciar ? false : t.slaIncumplido,
        slaPausado: !reiniciar,
        notasTecnicas: [
          ...t.notasTecnicas,
          {
            id: 'NT-' + Date.now(),
            autor: t.asignadoA,
            fecha: new Date().toISOString(),
            tipo: 'Escalado',
            texto: reiniciar
              ? `Escalado a ${eq} (SLA reiniciado por OLA N2).`
              : `Escalado a ${eq} (SLA pausado hasta triaje N2).`,
          },
        ],
      };
    });
    guardarEstado();
    render();
  }

  function ejecutarCierreTicket(ticketId, informe) {
    const t = estado.tickets.find((x) => x.id === ticketId);
    if (!t || t.estado === 'Resuelto') return;
    if (!t.slaIncumplido) {
      estado.evaluacion = registrarEvento(
        estado.evaluacion,
        15,
        `Incidente resuelto dentro de SLA (${t.prioridad})`,
        t.id,
        'sla_cumplido'
      );
    }
    if (t.prioridad === 'P1 - Crítica') {
      const prb = estado.problemas.find((p) => p.id === t.problemaVinculadoId);
      const tieneRaiz = Boolean(
        (informe && informe.causaRaizDocumentada) ||
          (prb && prb.causaRaiz) ||
          (prb && evaluarEstadoRca(prb).rcaValido)
      );
      if (!tieneRaiz) {
        estado.evaluacion = registrarEvento(
          estado.evaluacion,
          -25,
          'Cierre P1 Crítica sin causa raíz documentada',
          t.id,
          'cierre_sin_rca'
        );
      } else {
        estado.evaluacion = registrarEvento(
          estado.evaluacion,
          15,
          'Cierre P1 Crítica con causa raíz documentada',
          t.id,
          'rca_completo'
        );
      }
    }
    t.estado = 'Resuelto';
    t.slaPausado = false;
    if (informe) t.informeCierre = informe;
    guardarEstado();
    render();
  }

  function solicitarResolucionTicket(ticketId) {
    const t = estado.tickets.find((x) => x.id === ticketId);
    if (!t || t.estado === 'Resuelto') return;
    if (t.prioridad === 'P1 - Crítica' || t.prioridad === 'P2 - Alta') {
      ui.modal = { tipo: 'cierreMayor', ticketId };
      renderModals();
      return;
    }
    ejecutarCierreTicket(ticketId, null);
  }

  function limpiarTimersEscenario() {
    scenarioTimers.forEach((id) => window.clearTimeout(id));
    scenarioTimers = [];
  }

  function iniciarEscenario(escId, limpiarCola) {
    const esc = ESCENARIOS_SIMULACION.find((e) => e.id === escId);
    if (!esc) return;
    limpiarTimersEscenario();
    if (limpiarCola) {
      estado.tickets = [];
    }
    ui.escenarioEnCurso = {
      titulo: esc.titulo,
      recibidos: 0,
      total: esc.tickets.length,
      ultimoMensaje: 'Conectando líneas N1/N2 y alertas SIEM...',
    };
    guardarEstado();
    render();

    esc.tickets.forEach((tpl, idx) => {
      const tid = window.setTimeout(() => {
        const calc = calcularPrioridadITIL(tpl.impacto, tpl.urgencia);
        const esN2 = tpl.nivelInicial === 'N2';
        crearTicketObj(
          {
            titulo: tpl.titulo,
            descripcion: tpl.descripcion,
            canalEntrada: tpl.canalEntrada,
            estado: esN2 ? 'Escalado (N2)' : 'Nuevo',
            nivel: tpl.nivelInicial,
            prioridad: calc.prioridad,
            impacto: tpl.impacto,
            urgencia: tpl.urgencia,
            categoria: tpl.categoria,
            ciAfectado: tpl.ciAfectado,
            solicitante: tpl.solicitante,
            asignadoA: esN2
              ? asignarEquipoN2(tpl.categoria)
              : 'Mesa N1 (Entrante)',
            slaObjetivoMin: calc.slaObjetivoMin,
            slaObjetivoSeg: calc.slaObjetivoSeg,
            slaTranscurridoSeg: 0,
            slaPausado: false,
            slaIncumplido: false,
            problemaVinculadoId: null,
          },
          false
        );
        ui.escenarioEnCurso = {
          titulo: esc.titulo,
          recibidos: idx + 1,
          total: esc.tickets.length,
          ultimoMensaje: `${tpl.canalEntrada} · ${tpl.solicitante}: ${tpl.titulo}`,
        };
        render();
      }, tpl.retrasoMs);
      scenarioTimers.push(tid);
    });
  }

  // Motor SLA 1s
  window.setInterval(() => {
    if (estado.velocidadSimulacion === 0) return;
    let cambio = false;
    estado.tickets.forEach((t) => {
      if (t.estado === 'Resuelto' || t.slaPausado) return;
      t.slaTranscurridoSeg += estado.velocidadSimulacion;
      const roto = t.slaTranscurridoSeg > t.slaObjetivoSeg;
      if (!t.slaIncumplido && roto) {
        estado.evaluacion = registrarEvento(
          estado.evaluacion,
          -15,
          `SLA vencido en incidente ${t.prioridad}`,
          t.id,
          'sla_vencido'
        );
      }
      t.slaIncumplido = roto;
      cambio = true;
    });
    if (cambio) {
      guardarEstado();
      // Actualización ligera de relojes en DOM si no hay inputs enfocados
      const activeTag = document.activeElement
        ? document.activeElement.tagName
        : '';
      if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA' && activeTag !== 'SELECT') {
        renderAppShell();
      }
    }
  }, 1000);

  function renderDashboard(m) {
    const abiertos = estado.tickets
      .filter((t) => t.estado !== 'Resuelto')
      .sort((a, b) => Number(b.slaIncumplido) - Number(a.slaIncumplido));
    return `
      <div class="space-y-6">
        <section aria-label="Controles de simulación" class="flex flex-col gap-4 rounded-xl border border-slate-800 bg-[#111827] p-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 class="font-display text-sm font-semibold text-slate-100">Consola de Simulación Nivel 2</h2>
            <p class="text-xs text-slate-400">Tiempo simulado: <span class="font-mono text-slate-200">+${estado.simulacionMinutosAvanzados} min</span> · Persistencia activa en LocalStorage</p>
          </div>
          <div class="flex flex-wrap items-center gap-2.5">
            <button type="button" data-action="abrir-escenarios" class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500">
              <i class="fa-solid fa-clapperboard"></i><span>Cargar Escenario de Simulación</span>
            </button>
            <button type="button" data-action="avanzar-5m" class="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#161E2E] px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800">
              <i class="fa-regular fa-clock text-blue-400"></i><span>Avanzar Reloj (+5m)</span>
            </button>
            <button type="button" data-action="exportar-general" class="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800">
              <i class="fa-solid fa-print text-blue-400"></i><span>Exportar Informe (PDF/Imprimir)</span>
            </button>
          </div>
        </section>

        <section aria-label="KPIs ITIL" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article class="rounded-xl border border-slate-800 bg-[#111827] p-5">
            <div class="flex justify-between text-xs text-slate-400"><span>Tickets Abiertos</span><i class="fa-solid fa-ticket text-blue-400"></i></div>
            <p class="mt-3 font-mono text-3xl font-semibold text-slate-100">${m.ticketsAbiertos}</p>
            <p class="mt-3 border-t border-slate-800 pt-2 text-xs text-slate-400 font-mono">N1: ${m.ticketsN1} · N2: ${m.ticketsN2} · Resueltos: ${m.ticketsResueltos}</p>
          </article>
          <article class="rounded-xl border border-slate-800 bg-[#111827] p-5">
            <div class="flex justify-between text-xs text-slate-400"><span>SLA Incumplidos</span><i class="fa-solid fa-stopwatch ${m.slaIncumplidos > 0 ? 'text-red-400' : 'text-emerald-400'}"></i></div>
            <p class="mt-3 font-mono text-3xl font-semibold ${m.slaIncumplidos > 0 ? 'text-red-400' : 'text-emerald-400'}">${m.slaIncumplidos}</p>
            <p class="mt-3 border-t border-slate-800 pt-2 text-xs text-slate-400 font-mono">Cumplimiento: ${m.tasaCumplimientoSla}%</p>
          </article>
          <article class="rounded-xl border border-slate-800 bg-[#111827] p-5">
            <div class="flex justify-between text-xs text-slate-400"><span>Problemas Activos</span><i class="fa-solid fa-triangle-exclamation text-amber-400"></i></div>
            <p class="mt-3 font-mono text-3xl font-semibold text-slate-100">${m.problemasActivos}</p>
            <p class="mt-3 border-t border-slate-800 pt-2 text-xs text-blue-400 font-mono">KEDB: ${m.erroresConocidos} errores conocidos</p>
          </article>
          <article class="rounded-xl border border-slate-800 bg-[#111827] p-5">
            <div class="flex justify-between text-xs text-slate-400"><span>Puntuación ITIL v4</span><i class="fa-solid fa-award text-amber-400"></i></div>
            <p class="mt-3 font-mono text-3xl font-semibold text-slate-100">${estado.evaluacion.puntuacion} <span class="text-sm font-normal text-slate-400">pts</span></p>
            <p class="mt-3 border-t border-slate-800 pt-2 text-xs text-slate-400 font-mono">+${estado.evaluacion.clasificacionesCorrectas} clasif. · ${estado.evaluacion.rcasCompletados} RCA · -${estado.evaluacion.penalizacionesSla + estado.evaluacion.cierresSinCausaRaiz} faltas</p>
          </article>
        </section>

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section class="xl:col-span-7 rounded-xl border border-slate-800 bg-[#111827] overflow-hidden">
            <div class="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <h2 class="font-display text-sm font-semibold text-slate-100">Cola Prioritaria</h2>
              <button type="button" data-nav="tickets" class="text-xs font-medium text-blue-400 hover:text-blue-300">Abrir cola completa →</button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead><tr class="border-b border-slate-800 text-slate-400"><th class="py-2.5 pl-5 pr-3">ID</th><th class="px-3 py-2.5">Incidente</th><th class="px-3 py-2.5">Prioridad</th><th class="px-3 py-2.5">SLA</th><th class="py-2.5 pr-5 text-right">Acción</th></tr></thead>
                <tbody class="divide-y divide-slate-800/60">
                  ${abiertos
                    .slice(0, 6)
                    .map((t) => {
                      const rest = t.slaObjetivoSeg - t.slaTranscurridoSeg;
                      return `<tr class="hover:bg-slate-800/40">
                        <td class="py-3 pl-5 pr-3 font-mono text-blue-400">${escapeHtml(t.id)}</td>
                        <td class="px-3 py-3 max-w-[260px] truncate text-slate-100">${escapeHtml(t.titulo)}</td>
                        <td class="px-3 py-3 font-mono ${colorPrioridad(t.prioridad)}">${escapeHtml(t.prioridad)}</td>
                        <td class="px-3 py-3 font-mono ${t.slaIncumplido ? 'text-red-400 font-semibold' : 'text-slate-300'}">${fmtTiempo(rest)}</td>
                        <td class="py-3 pr-5 text-right"><button type="button" data-abrir-ticket="${escapeHtml(t.id)}" class="rounded border border-slate-700 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-slate-800">Gestionar</button></td>
                      </tr>`;
                    })
                    .join('')}
                </tbody>
              </table>
            </div>
          </section>

          <section class="xl:col-span-5 rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-3">
            <h2 class="font-display text-sm font-semibold text-slate-100">Evaluación del Desempeño</h2>
            <ul class="divide-y divide-slate-800/60 text-xs">
              ${(estado.evaluacion.historialEventos || [])
                .slice(0, 5)
                .map(
                  (ev) => `<li class="flex items-center justify-between gap-2 py-2">
                  <span class="truncate text-slate-300"><strong class="font-mono text-slate-400 mr-1">${escapeHtml(ev.referenciaId)}</strong> ${escapeHtml(ev.concepto)}</span>
                  <span class="font-mono font-semibold ${ev.delta > 0 ? 'text-emerald-400' : ev.delta < 0 ? 'text-red-400' : 'text-slate-400'}">${ev.delta > 0 ? '+' + ev.delta : ev.delta} pts</span>
                </li>`
                )
                .join('')}
            </ul>
          </section>
        </div>
      </div>
    `;
  }

  function renderTickets() {
    const filtrados = estado.tickets.filter((t) => {
      if (ui.filtroCola === 'N1' && (t.nivel !== 'N1' || t.estado === 'Resuelto'))
        return false;
      if (ui.filtroCola === 'N2' && (t.nivel !== 'N2' || t.estado === 'Resuelto'))
        return false;
      if (ui.filtroCola === 'incumplido' && !t.slaIncumplido) return false;
      if (ui.filtroCola === 'resueltos' && t.estado !== 'Resuelto') return false;
      if (ui.busqueda.trim()) {
        const q = ui.busqueda.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.titulo.toLowerCase().includes(q) ||
          t.ciAfectado.toLowerCase().includes(q)
        );
      }
      return true;
    });

    return `
      <div class="space-y-5">
        <div class="flex flex-col gap-3 rounded-xl border border-slate-800 bg-[#111827] p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap gap-1 rounded-lg bg-[#0B0F17] p-1">
              ${[
                ['todos', 'Todos'],
                ['N1', 'Nivel 1'],
                ['N2', 'Nivel 2'],
                ['incumplido', 'SLA Incumplido'],
                ['resueltos', 'Resueltos'],
              ]
                .map(
                  ([id, lbl]) =>
                    `<button type="button" data-filtro-cola="${id}" class="rounded-md px-3 py-1.5 text-xs font-medium ${ui.filtroCola === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}">${lbl}</button>`
                )
                .join('')}
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <div class="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0B0F17] px-2 py-1 text-[11px]">
                <span class="text-slate-400">Motor SLA:</span>
                ${[
                  [0, 'Pausa'],
                  [1, '1x'],
                  [10, '10x'],
                  [60, '60x'],
                ]
                  .map(
                    ([v, l]) =>
                      `<button type="button" data-velocidad="${v}" class="rounded px-2 py-0.5 font-mono ${estado.velocidadSimulacion === v ? 'bg-blue-600 text-white' : 'text-slate-400'}">${l}</button>`
                  )
                  .join('')}
              </div>
              <input id="input-busqueda-tickets" type="search" value="${escapeHtml(ui.busqueda)}" placeholder="Buscar ID, CI o síntoma..." class="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-xs text-slate-400">
            <span>Selecciona tickets similares para agruparlos en un Problema Maestro</span>
            <button type="button" data-action="abrir-declarar-problema" class="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <span>Declarar Problema (${ui.seleccionados.length})</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          ${filtrados
            .map((t) => {
              const rest = t.slaObjetivoSeg - t.slaTranscurridoSeg;
              const roto = t.estado !== 'Resuelto' && !t.slaPausado && (t.slaIncumplido || rest <= 0);
              const checked = ui.seleccionados.includes(t.id);
              return `
              <article class="flex flex-col justify-between rounded-xl border p-5 ${roto ? 'border-red-500 bg-red-950/20 sla-breach-card' : 'border-slate-800 bg-[#111827]'}">
                <div class="space-y-3">
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                      ${t.estado !== 'Resuelto' ? `<input type="checkbox" data-toggle-sel="${escapeHtml(t.id)}" ${checked ? 'checked' : ''} aria-label="Seleccionar ${escapeHtml(t.id)}" class="h-4 w-4 rounded border-slate-600 bg-slate-900" />` : ''}
                      <span class="font-mono font-semibold text-blue-400">${escapeHtml(t.id)}</span>
                      <span class="font-mono text-slate-400">${escapeHtml(t.nivel)}</span>
                      ${t.problemaVinculadoId ? `<span class="font-mono text-amber-300">${escapeHtml(t.problemaVinculadoId)}</span>` : ''}
                    </div>
                    <span class="font-mono font-semibold ${colorPrioridad(t.prioridad)}">${escapeHtml(t.prioridad)}</span>
                  </div>
                  <h3 class="font-display text-sm font-semibold text-slate-100">${escapeHtml(t.titulo)}</h3>
                  <p class="text-xs text-slate-400 line-clamp-2">${escapeHtml(t.descripcion)}</p>
                  <div class="rounded-lg border px-3 py-2 font-mono text-xs flex justify-between items-center ${roto ? 'border-red-500/50 bg-red-950/30 text-red-300' : 'border-slate-800 bg-[#0B0F17] text-slate-200'}">
                    <span>${t.estado === 'Resuelto' ? 'SLA Cerrado' : t.slaPausado ? 'SLA Pausado' : roto ? 'SLA INCUMPLIDO' : 'SLA Restante'}</span>
                    <span class="font-semibold">${t.estado === 'Resuelto' ? 'Resuelto' : fmtTiempo(rest)}</span>
                  </div>
                </div>
                <div class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-[11px]">
                  <span class="text-slate-300">${escapeHtml(t.estado)}</span>
                  <div class="flex items-center gap-1.5">
                    ${t.nivel === 'N1' && t.estado !== 'Resuelto' ? `<button type="button" data-escalar-n2="${escapeHtml(t.id)}" class="rounded border border-amber-500/40 bg-amber-950/30 px-2.5 py-1 font-medium text-amber-200 hover:bg-amber-900/40">Escalar a N2</button>` : ''}
                    ${t.estado !== 'Resuelto' ? `<button type="button" data-resolver-ticket="${escapeHtml(t.id)}" class="rounded border border-emerald-500/40 bg-emerald-950/30 px-2.5 py-1 font-medium text-emerald-300 hover:bg-emerald-900/40">Resolver</button>` : ''}
                    <button type="button" data-abrir-ticket="${escapeHtml(t.id)}" class="rounded border border-slate-700 px-2.5 py-1 text-slate-200 hover:bg-slate-800">Detalle</button>
                  </div>
                </div>
              </article>`;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  function renderRcaPanelHtml(prb) {
    const rca = evaluarEstadoRca(prb);
    const ish = prb.ishikawa || { maquina: [], metodo: [], material: [], manoDeObra: [] };
    const porques = prb.analisis5Porques || ['', '', '', '', ''];
    const labelsM = [
      ['maquina', 'Máquina / Infraestructura'],
      ['metodo', 'Método / Procesos'],
      ['material', 'Material / Software / Config'],
      ['manoDeObra', 'Mano de Obra / Personas'],
    ];
    return `
      <div class="space-y-6 rounded-xl border border-slate-800 bg-[#0B0F17] p-5" data-rca-prb="${escapeHtml(prb.id)}">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
          <span class="font-semibold text-slate-200">Estado RCA: ${rca.rcaValido ? '<span class="text-emerald-400">Completado</span>' : '<span class="text-amber-400">Pendiente (obligatorio para cerrar P1/P2)</span>'}</span>
          <span class="font-mono text-slate-400">5 Porqués: ${rca.pasosPorques}/5 · Ishikawa: ${rca.totalCausasIshikawa} causas</span>
        </div>

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div class="space-y-3">
            <h4 class="font-display text-xs font-semibold text-slate-100">1. Técnica de los 5 Porqués en Cascada</h4>
            ${[0, 1, 2, 3, 4]
              .map((i) => {
                const visible = i === 0 || (porques[i - 1] && porques[i - 1].trim().length >= 3);
                if (!visible) return '';
                return `<div>
                  <label class="mb-1 block text-[11px] font-medium text-slate-400">¿Por qué #${i + 1}?</label>
                  <input type="text" data-rca-porque="${i}" value="${escapeHtml(porques[i] || '')}" placeholder="Describe la causa técnica de nivel ${i + 1}..." class="w-full rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none" />
                </div>`;
              })
              .join('')}
            <div>
              <label class="mb-1 block text-[11px] font-medium text-slate-300">Causa Raíz Definitiva</label>
              <textarea data-rca-causaraiz rows="2" class="w-full rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none">${escapeHtml(prb.causaRaiz || '')}</textarea>
            </div>
            <button type="button" data-guardar-rca="${escapeHtml(prb.id)}" class="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500">Guardar Diagnóstico RCA</button>
          </div>

          <div class="space-y-3">
            <h4 class="font-display text-xs font-semibold text-slate-100">2. Diagrama de Ishikawa (Espina de Pescado 4M)</h4>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              ${labelsM
                .map(
                  ([key, label]) => `
                <div class="rounded-lg border border-slate-800 bg-[#111827] p-3 space-y-2">
                  <span class="block text-[11px] font-semibold text-blue-300">${label}</span>
                  <ul class="space-y-1 text-[11px] text-slate-300">
                    ${(ish[key] || [])
                      .map(
                        (c, idx) =>
                          `<li class="flex items-center justify-between gap-1 rounded bg-[#0B0F17] px-2 py-1"><span>${escapeHtml(c)}</span><button type="button" data-del-ish="${escapeHtml(prb.id)}|${key}|${idx}" class="text-slate-500 hover:text-red-400" aria-label="Eliminar causa">×</button></li>`
                      )
                      .join('')}
                  </ul>
                  <div class="flex gap-1">
                    <input type="text" data-input-ish="${key}" placeholder="Añadir causa..." class="min-w-0 flex-1 rounded border border-slate-700 bg-[#0B0F17] px-2 py-1 text-[11px] text-slate-100" />
                    <button type="button" data-add-ish="${escapeHtml(prb.id)}|${key}" class="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-700">+</button>
                  </div>
                </div>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderProblemas() {
    return `
      <div class="space-y-5">
        ${estado.problemas
          .map((prb) => {
            const tab = ui.problemaTabs[prb.id] || 'resumen';
            const rca = evaluarEstadoRca(prb);
            const hijas = estado.tickets.filter((t) => t.problemaVinculadoId === prb.id);
            const bloqueadoCierre = rca.requiereRcaParaCerrar && !rca.rcaValido;
            return `
            <article class="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div class="flex items-center gap-2 text-xs">
                    <span class="font-mono font-semibold text-blue-400">${escapeHtml(prb.id)}</span>
                    <span class="font-mono ${colorPrioridad(prb.prioridad)}">${escapeHtml(prb.prioridad)}</span>
                    <span class="text-slate-400">${escapeHtml(prb.estado)}</span>
                  </div>
                  <h3 class="mt-1 font-display text-base font-semibold text-slate-100">${escapeHtml(prb.titulo)}</h3>
                </div>
                <button type="button" data-exportar-prb="${escapeHtml(prb.id)}" class="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 whitespace-nowrap">
                  <i class="fa-solid fa-print mr-1 text-blue-400"></i>Exportar Informe (PDF/Imprimir)
                </button>
              </div>

              <div class="flex gap-1 border-b border-slate-800 pb-2 text-xs">
                <button type="button" data-prb-tab="${escapeHtml(prb.id)}|resumen" class="rounded-md px-3 py-1.5 font-medium ${tab === 'resumen' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}">Resumen e Incidencias (${hijas.length})</button>
                <button type="button" data-prb-tab="${escapeHtml(prb.id)}|rca" class="rounded-md px-3 py-1.5 font-medium ${tab === 'rca' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}">RCA (5 Porqués + Ishikawa)</button>
              </div>

              ${
                tab === 'rca'
                  ? renderRcaPanelHtml(prb)
                  : `
                <div class="space-y-4">
                  <p class="text-xs text-slate-300">${escapeHtml(prb.descripcion)}</p>
                  <div class="rounded-lg border border-slate-800 bg-[#0B0F17] p-4 space-y-3">
                    <h4 class="text-xs font-semibold text-slate-200">Informe de Cierre y Cierre Masivo (${hijas.filter((h) => h.estado !== 'Resuelto').length} hijas abiertas)</h4>
                    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label class="mb-1 block text-[11px] text-slate-400">Workaround (Solución Temporal) *</label>
                        <textarea data-prb-wk="${escapeHtml(prb.id)}" rows="2" class="w-full rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-slate-100">${escapeHtml(prb.workaround || '')}</textarea>
                      </div>
                      <div>
                        <label class="mb-1 block text-[11px] text-slate-400">Solución Definitiva *</label>
                        <textarea data-prb-sol="${escapeHtml(prb.id)}" rows="2" class="w-full rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-slate-100">${escapeHtml(prb.solucionDefinitiva || '')}</textarea>
                      </div>
                    </div>
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <label class="flex items-center gap-2 text-xs text-slate-300">
                        <input type="checkbox" data-prb-masivo="${escapeHtml(prb.id)}" checked class="h-4 w-4 rounded border-slate-600 bg-slate-900" />
                        <span>Cerrar masivamente todas las incidencias hijas</span>
                      </label>
                      <button type="button" data-cerrar-prb="${escapeHtml(prb.id)}" ${bloqueadoCierre ? 'disabled' : ''} class="rounded-lg px-4 py-2 text-xs font-semibold ${bloqueadoCierre ? 'cursor-not-allowed bg-slate-800 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'}">
                        ${bloqueadoCierre ? 'Completa RCA antes de cerrar P1/P2' : 'Cerrar Problema e Incidencias'}
                      </button>
                    </div>
                  </div>
                </div>`
              }
            </article>`;
          })
          .join('')}
      </div>
    `;
  }

  function renderRcaView() {
    const prb =
      estado.problemas.find((p) => p.id === ui.problemaRcaId) || estado.problemas[0];
    if (!prb) return '<p class="text-xs text-slate-400">Sin problemas registrados.</p>';
    return `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#111827] p-4">
          <span class="text-xs font-medium text-slate-300">Problema bajo análisis:</span>
          <select id="select-rca-problema" class="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100">
            ${estado.problemas
              .map(
                (p) =>
                  `<option value="${escapeHtml(p.id)}" ${p.id === prb.id ? 'selected' : ''}>${escapeHtml(p.id)} — ${escapeHtml(p.titulo.slice(0, 60))}</option>`
              )
              .join('')}
          </select>
        </div>
        ${renderRcaPanelHtml(prb)}
      </div>
    `;
  }

  function renderAppShell() {
    const m = calcularMetricas();
    const titulos = {
      dashboard: 'Dashboard Operativo',
      tickets: 'Cola de Tickets (N1/N2)',
      problemas: 'Gestión de Problemas y KEDB',
      rca: 'Laboratorio de Análisis RCA',
    };
    const root = document.getElementById('app');
    root.innerHTML = `
      ${ui.menuMovil ? '<div data-action="cerrar-menu" class="fixed inset-0 z-30 bg-black/60 lg:hidden"></div>' : ''}
      <aside class="fixed inset-y-0 left-0 z-40 flex w-[268px] shrink-0 flex-col border-r border-slate-800 bg-[#0D131F] transition-transform lg:static lg:translate-x-0 ${ui.menuMovil ? 'translate-x-0' : '-translate-x-full'}" aria-label="Menú lateral">
        <div class="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div class="flex items-center gap-3 min-w-0">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-white p-0.5">
              <img src="./assets/logo.png" alt="Logo Un Fantasma en el Sistema" class="h-full w-full object-contain" />
            </span>
            <span class="truncate font-display text-base font-bold text-slate-100">ServiceDeskLab</span>
          </div>
          <button type="button" data-action="cerrar-menu" class="text-slate-400 lg:hidden" aria-label="Cerrar menú"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <nav class="flex-1 space-y-1 px-3 py-5">
          ${[
            ['dashboard', 'Dashboard', 'fa-solid fa-gauge-high', null],
            ['tickets', 'Cola de Tickets (N1/N2)', 'fa-solid fa-layer-group', m.ticketsAbiertos],
            ['problemas', 'Gestión de Problemas', 'fa-solid fa-triangle-exclamation', m.problemasActivos],
            ['rca', 'Análisis RCA', 'fa-solid fa-diagram-project', null],
          ]
            .map(
              ([id, lbl, ic, cnt]) =>
                `<button type="button" data-nav="${id}" class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium ${ui.vista === id ? 'bg-blue-600/15 text-blue-400' : 'text-slate-300 hover:bg-slate-800/60'}">
                  <span class="flex items-center gap-3"><i class="${ic} w-4 text-center"></i><span>${lbl}</span></span>
                  ${cnt !== null ? `<span class="font-mono text-xs">${cnt}</span>` : ''}
                </button>`
            )
            .join('')}
        </nav>
        <div class="border-t border-slate-800 p-4 space-y-3 text-xs">
          ${
            !ui.confirmandoReset
              ? `<button type="button" data-action="pedir-reset" class="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 text-slate-300 hover:bg-slate-800">Reiniciar Simulador</button>`
              : `<div class="rounded-lg border border-amber-500/40 bg-amber-950/20 p-2 space-y-2">
                  <p class="text-amber-200">¿Restaurar estado inicial?</p>
                  <div class="flex gap-2">
                    <button type="button" data-action="confirmar-reset" class="flex-1 rounded bg-amber-600 py-1 text-white">Confirmar</button>
                    <button type="button" data-action="cancelar-reset" class="flex-1 rounded bg-slate-800 py-1 text-slate-300">Cancelar</button>
                  </div>
                </div>`
          }
          <a href="https://www.unfantasmaenelsistema.com/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0B0F17] p-2.5 hover:border-slate-700">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white p-0.5"><img src="./assets/logo.png" alt="Un Fantasma en el Sistema" class="h-full w-full object-contain" /></span>
            <span class="min-w-0 flex-1 truncate font-semibold text-slate-200">unfantasmaenelsistema.com</span>
          </a>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex h-16 items-center justify-between border-b border-slate-800 bg-[#0D131F]/90 px-4 sm:px-6">
          <div class="flex items-center gap-3">
            <button type="button" data-action="abrir-menu" class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-300 lg:hidden" aria-label="Abrir navegación"><i class="fa-solid fa-bars"></i></button>
            <h1 class="font-display text-base font-semibold text-slate-100">${titulos[ui.vista]}</h1>
          </div>
          <button type="button" data-action="abrir-nuevo-ticket" class="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500">+ Nuevo Incidente</button>
        </header>

        <main id="contenido-principal" tabindex="-1" class="flex-1 p-4 sm:p-6 lg:p-8">
          <div class="mx-auto max-w-[1440px] space-y-5">
            ${
              ui.escenarioEnCurso
                ? `<div role="status" aria-live="polite" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-500/40 bg-blue-950/30 px-4 py-3 text-xs">
                    <div>
                      <p class="font-semibold text-blue-300">Escenario: ${escapeHtml(ui.escenarioEnCurso.titulo)} (${ui.escenarioEnCurso.recibidos}/${ui.escenarioEnCurso.total})</p>
                      <p class="text-slate-200">${escapeHtml(ui.escenarioEnCurso.ultimoMensaje)}</p>
                    </div>
                    <button type="button" data-action="detener-escenario" class="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-1.5 text-slate-300 hover:bg-slate-800">Detener / Ocultar</button>
                  </div>`
                : ''
            }
            ${ui.vista === 'dashboard' ? renderDashboard(m) : ui.vista === 'tickets' ? renderTickets() : ui.vista === 'problemas' ? renderProblemas() : renderRcaView()}
          </div>
        </main>
      </div>
    `;
  }

  function renderModals() {
    const modalRoot = document.getElementById('modal-root');
    const printRoot = document.getElementById('print-root');

    if (ui.printContext) {
      const m = calcularMetricas();
      printRoot.innerHTML = `
        <div class="print-folio-container fixed inset-0 z-[70] overflow-y-auto bg-slate-950/85 p-4 sm:p-8">
          <div class="no-print mx-auto mb-4 flex max-w-[210mm] items-center justify-between rounded-xl border border-slate-700 bg-[#111827] px-4 py-3 text-xs">
            <span class="font-semibold text-slate-200">Vista previa Folio A4</span>
            <div class="flex gap-2">
              <button type="button" data-action="imprimir-ahora" class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">Imprimir / Guardar PDF</button>
              <button type="button" data-action="cerrar-print" class="rounded-lg border border-slate-600 px-3 py-2 text-slate-300">Cerrar</button>
            </div>
          </div>
          <article class="print-folio-sheet mx-auto max-w-[210mm] rounded-lg bg-white p-10 text-slate-900 shadow-2xl space-y-6">
            <header class="flex justify-between border-b-2 border-slate-900 pb-4">
              <div><p class="font-mono text-[11px] font-bold uppercase text-slate-500">ServiceDeskLab · ITIL v4</p><h1 class="text-xl font-bold">Informe Técnico Operativo</h1></div>
              <p class="font-mono text-xs text-slate-600">${new Date().toLocaleDateString('es-ES')}</p>
            </header>
            <section>
              <h2 class="text-xs font-bold uppercase text-slate-600 mb-2">Matriz de Cumplimiento SLA</h2>
              <p class="text-xs mb-3">Totales: ${m.ticketsTotales} · Incumplidos: ${m.slaIncumplidos} · Cumplimiento: ${m.tasaCumplimientoSla}% · Puntuación: ${estado.evaluacion.puntuacion} pts</p>
              <table class="w-full border border-slate-300 text-xs">
                <thead class="bg-slate-100"><tr><th class="p-2 text-left">ID</th><th class="p-2 text-left">Incidente</th><th class="p-2 text-left">Prioridad</th><th class="p-2 text-left">SLA</th></tr></thead>
                <tbody>
                  ${estado.tickets
                    .map(
                      (t) =>
                        `<tr class="border-t border-slate-200"><td class="p-2 font-mono">${escapeHtml(t.id)}</td><td class="p-2">${escapeHtml(t.titulo)}</td><td class="p-2 font-mono">${escapeHtml(t.prioridad)}</td><td class="p-2 font-semibold ${t.slaIncumplido ? 'text-red-700' : 'text-emerald-700'}">${t.slaIncumplido ? 'INCUMPLIDO' : 'CUMPLIDO'}</td></tr>`
                    )
                    .join('')}
                </tbody>
              </table>
            </section>
            <section class="space-y-2">
              <h2 class="text-xs font-bold uppercase text-slate-600">Problemas, RCA y Soluciones</h2>
              ${estado.problemas
                .map(
                  (p) =>
                    `<div class="border border-slate-300 rounded p-3 text-xs space-y-1">
                      <p class="font-bold">${escapeHtml(p.id)} · ${escapeHtml(p.titulo)}</p>
                      <p><strong>Causa Raíz:</strong> ${escapeHtml(p.causaRaiz || 'Pendiente')}</p>
                      <p><strong>Workaround:</strong> ${escapeHtml(p.workaround || 'Pendiente')}</p>
                      ${p.solucionDefinitiva ? `<p><strong>Solución Definitiva:</strong> ${escapeHtml(p.solucionDefinitiva)}</p>` : ''}
                    </div>`
                )
                .join('')}
            </section>
          </article>
        </div>
      `;
    } else {
      printRoot.innerHTML = '';
    }

    if (!ui.modal) {
      modalRoot.innerHTML = '';
      return;
    }

    if (ui.modal.tipo === 'escenarios') {
      modalRoot.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true">
          <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="font-display text-base font-semibold text-slate-100">Cargar Escenario de Simulación</h2>
              <button type="button" data-action="cerrar-modal" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="space-y-3">
              ${ESCENARIOS_SIMULACION.map(
                (esc) => `<div class="rounded-xl border border-slate-800 bg-[#0B0F17] p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p class="font-mono text-[11px] text-blue-400">${escapeHtml(esc.categoriaPrincipal)} · ${escapeHtml(esc.severidadEsperada)}</p>
                    <h3 class="font-display text-sm font-semibold text-slate-100">${escapeHtml(esc.titulo)}</h3>
                    <p class="text-xs text-slate-400">${escapeHtml(esc.objetivoDidactico)}</p>
                  </div>
                  <button type="button" data-lanzar-esc="${escapeHtml(esc.id)}" class="shrink-0 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500">Lanzar (${esc.tickets.length})</button>
                </div>`
              ).join('')}
            </div>
          </div>
        </div>`;
      return;
    }

    if (ui.modal.tipo === 'nuevoTicket') {
      modalRoot.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true">
          <form id="form-nuevo-ticket" class="w-full max-w-lg rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4 text-xs">
            <div class="flex items-center justify-between">
              <h2 class="font-display text-base font-semibold text-slate-100">Nuevo Ticket ITIL v4</h2>
              <button type="button" data-action="cerrar-modal" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <input name="titulo" required placeholder="Resumen del incidente..." class="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-slate-100" />
            <textarea name="descripcion" rows="2" placeholder="Síntomas..." class="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-slate-100"></textarea>
            <div class="grid grid-cols-2 gap-3">
              <select name="impacto" class="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-slate-100">
                <option value="Alto">Impacto: Alto</option><option value="Medio">Impacto: Medio</option><option value="Bajo">Impacto: Bajo</option>
              </select>
              <select name="urgencia" class="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-slate-100">
                <option value="Alta">Urgencia: Alta</option><option value="Media">Urgencia: Media</option><option value="Baja">Urgencia: Baja</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <select name="categoria" class="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-slate-100">
                <option>Seguridad & Certificados</option><option>Redes & Conectividad</option><option>IAM / Identidad</option><option>Base de Datos</option><option>Puesto de Trabajo</option>
              </select>
              <select name="canalEntrada" class="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-slate-100">
                <option>Teléfono</option><option>Portal de Usuario</option><option>Monitorización</option><option>Correo Corporativo</option>
              </select>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" data-action="cerrar-modal" class="rounded-lg border border-slate-700 px-4 py-2 text-slate-300">Cancelar</button>
              <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">Crear Ticket</button>
            </div>
          </form>
        </div>`;
      return;
    }

    if (ui.modal.tipo === 'cierreMayor') {
      modalRoot.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true">
          <form id="form-cierre-mayor" data-ticket-id="${escapeHtml(ui.modal.ticketId)}" class="w-full max-w-lg rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4 text-xs">
            <h2 class="font-display text-base font-semibold text-slate-100">Informe de Cierre Obligatorio (${escapeHtml(ui.modal.ticketId)})</h2>
            <div><label class="block mb-1 text-slate-300">Workaround (Solución Temporal) *</label><textarea name="workaround" required minlength="5" rows="2" class="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-slate-100"></textarea></div>
            <div><label class="block mb-1 text-slate-300">Solución Definitiva *</label><textarea name="solucionDefinitiva" required minlength="5" rows="2" class="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-slate-100"></textarea></div>
            <div><label class="block mb-1 text-slate-300">Causa Raíz Documentada (Recomendado en P1)</label><input name="causaRaiz" class="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-slate-100" /></div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" data-action="cerrar-modal" class="rounded-lg border border-slate-700 px-4 py-2 text-slate-300">Cancelar</button>
              <button type="submit" class="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white">Registrar y Cerrar</button>
            </div>
          </form>
        </div>`;
      return;
    }

    if (ui.modal.tipo === 'declararProblema') {
      modalRoot.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true">
          <form id="form-declarar-prb" class="w-full max-w-lg rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4 text-xs">
            <h2 class="font-display text-base font-semibold text-slate-100">Declarar Problema Maestro (${ui.seleccionados.length} tickets)</h2>
            <input name="titulo" required placeholder="Título del problema raíz..." class="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-slate-100" />
            <textarea name="descripcion" rows="2" placeholder="Descripción técnica..." class="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-slate-100"></textarea>
            <div class="grid grid-cols-2 gap-3">
              <select name="prioridad" class="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-slate-100"><option>P1 - Crítica</option><option>P2 - Alta</option><option>P3 - Media</option></select>
              <input name="ciAfectado" value="CI-PROD-01" class="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 font-mono text-slate-100" />
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" data-action="cerrar-modal" class="rounded-lg border border-slate-700 px-4 py-2 text-slate-300">Cancelar</button>
              <button type="submit" class="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white">Crear Problema</button>
            </div>
          </form>
        </div>`;
      return;
    }

    if (ui.modal.tipo === 'ticketDrawer') {
      const t = estado.tickets.find((x) => x.id === ui.modal.ticketId);
      if (!t) {
        modalRoot.innerHTML = '';
        return;
      }
      modalRoot.innerHTML = `
        <div class="fixed inset-0 z-50 flex justify-end bg-black/65" role="dialog" aria-modal="true">
          <div class="flex h-full w-full max-w-xl flex-col border-l border-slate-800 bg-[#0D131F] p-6 overflow-y-auto space-y-5 text-xs">
            <div class="flex items-start justify-between border-b border-slate-800 pb-4">
              <div><span class="font-mono text-blue-400 font-semibold">${escapeHtml(t.id)} · ${escapeHtml(t.prioridad)}</span><h2 class="mt-1 font-display text-base font-semibold text-slate-100">${escapeHtml(t.titulo)}</h2></div>
              <button type="button" data-action="cerrar-modal" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p class="rounded-lg border border-slate-800 bg-[#111827] p-3 text-slate-300">${escapeHtml(t.descripcion)}</p>
            <div class="flex flex-wrap gap-2">
              ${t.nivel === 'N1' && t.estado !== 'Resuelto' ? `<button type="button" data-escalar-n2="${escapeHtml(t.id)}" class="rounded-lg bg-amber-600 px-3 py-2 font-semibold text-white">Escalar a N2</button>` : ''}
              ${t.estado !== 'Resuelto' ? `<button type="button" data-resolver-ticket="${escapeHtml(t.id)}" class="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white">Resolver Incidente</button>` : ''}
            </div>
            <div>
              <h3 class="font-semibold text-slate-200 mb-2">Bitácora Técnica</h3>
              <ul class="space-y-2">${t.notasTecnicas.map((n) => `<li class="rounded border border-slate-800 bg-[#111827] p-2.5"><strong class="text-slate-200">${escapeHtml(n.autor)}:</strong> <span class="text-slate-300">${escapeHtml(n.texto)}</span></li>`).join('')}</ul>
            </div>
          </div>
        </div>`;
    }
  }

  function render() {
    renderAppShell();
    renderModals();
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-nav],[data-action],[data-filtro-cola],[data-velocidad],[data-abrir-ticket],[data-escalar-n2],[data-resolver-ticket],[data-lanzar-esc],[data-prb-tab],[data-guardar-rca],[data-add-ish],[data-del-ish],[data-cerrar-prb],[data-exportar-prb]');
    if (!el) return;

    if (el.dataset.nav) {
      ui.vista = el.dataset.nav;
      ui.menuMovil = false;
      render();
      return;
    }
    if (el.dataset.filtroCola) {
      ui.filtroCola = el.dataset.filtroCola;
      render();
      return;
    }
    if (el.dataset.velocidad !== undefined) {
      estado.velocidadSimulacion = Number(el.dataset.velocidad);
      guardarEstado();
      render();
      return;
    }
    if (el.dataset.abrirTicket) {
      ui.modal = { tipo: 'ticketDrawer', ticketId: el.dataset.abrirTicket };
      renderModals();
      return;
    }
    if (el.dataset.escalarN2) {
      escalarN2(el.dataset.escalarN2);
      return;
    }
    if (el.dataset.resolverTicket) {
      solicitarResolucionTicket(el.dataset.resolverTicket);
      return;
    }
    if (el.dataset.lanzarEsc) {
      ui.modal = null;
      iniciarEscenario(el.dataset.lanzarEsc, false);
      return;
    }
    if (el.dataset.prbTab) {
      const [pid, tab] = el.dataset.prbTab.split('|');
      ui.problemaTabs[pid] = tab;
      render();
      return;
    }
    if (el.dataset.guardarRca) {
      const pid = el.dataset.guardarRca;
      const box = document.querySelector(`[data-rca-prb="${pid}"]`);
      if (!box) return;
      const prb = estado.problemas.find((p) => p.id === pid);
      if (!prb) return;
      const antes = evaluarEstadoRca(prb).rcaValido;
      const porques = [0, 1, 2, 3, 4].map((i) => {
        const inp = box.querySelector(`[data-rca-porque="${i}"]`);
        return inp ? inp.value : prb.analisis5Porques[i] || '';
      });
      const cr = box.querySelector('[data-rca-causaraiz]');
      prb.analisis5Porques = porques;
      prb.causaRaiz = cr ? cr.value : prb.causaRaiz;
      const despues = evaluarEstadoRca(prb).rcaValido;
      if (!antes && despues) {
        estado.evaluacion = registrarEvento(
          estado.evaluacion,
          20,
          'Análisis de Causa Raíz (RCA) completado',
          pid,
          'rca_completo'
        );
      }
      guardarEstado();
      render();
      return;
    }
    if (el.dataset.addIsh) {
      const [pid, key] = el.dataset.addIsh.split('|');
      const box = document.querySelector(`[data-rca-prb="${pid}"]`);
      const inp = box ? box.querySelector(`[data-input-ish="${key}"]`) : null;
      const prb = estado.problemas.find((p) => p.id === pid);
      if (!prb || !inp || !inp.value.trim()) return;
      const antes = evaluarEstadoRca(prb).rcaValido;
      prb.ishikawa[key].push(inp.value.trim());
      if (!antes && evaluarEstadoRca(prb).rcaValido) {
        estado.evaluacion = registrarEvento(
          estado.evaluacion,
          20,
          'Diagrama Ishikawa completado',
          pid,
          'rca_completo'
        );
      }
      guardarEstado();
      render();
      return;
    }
    if (el.dataset.delIsh) {
      const [pid, key, idx] = el.dataset.delIsh.split('|');
      const prb = estado.problemas.find((p) => p.id === pid);
      if (!prb) return;
      prb.ishikawa[key].splice(Number(idx), 1);
      guardarEstado();
      render();
      return;
    }
    if (el.dataset.cerrarPrb) {
      const pid = el.dataset.cerrarPrb;
      const prb = estado.problemas.find((p) => p.id === pid);
      if (!prb) return;
      const wk = document.querySelector(`[data-prb-wk="${pid}"]`);
      const sol = document.querySelector(`[data-prb-sol="${pid}"]`);
      const masivo = document.querySelector(`[data-prb-masivo="${pid}"]`);
      if (!wk || !sol || wk.value.trim().length < 5 || sol.value.trim().length < 5) {
        return;
      }
      prb.estado = 'Resuelto';
      prb.workaround = wk.value.trim();
      prb.solucionDefinitiva = sol.value.trim();
      if (masivo && masivo.checked) {
        estado.tickets.forEach((t) => {
          if (t.problemaVinculadoId === pid && t.estado !== 'Resuelto') {
            t.estado = 'Resuelto';
            t.slaPausado = false;
          }
        });
      }
      guardarEstado();
      render();
      return;
    }
    if (el.dataset.exportarPrb) {
      ui.printContext = { tipo: 'problema', id: el.dataset.exportarPrb };
      renderModals();
      return;
    }

    switch (el.dataset.action) {
      case 'abrir-menu':
        ui.menuMovil = true;
        renderAppShell();
        break;
      case 'cerrar-menu':
        ui.menuMovil = false;
        renderAppShell();
        break;
      case 'pedir-reset':
        ui.confirmandoReset = true;
        renderAppShell();
        break;
      case 'cancelar-reset':
        ui.confirmandoReset = false;
        renderAppShell();
        break;
      case 'confirmar-reset':
        limpiarTimersEscenario();
        ui.escenarioEnCurso = null;
        ui.confirmandoReset = false;
        estado = crearEstadoInicial();
        guardarEstado();
        render();
        break;
      case 'avanzar-5m':
        estado.simulacionMinutosAvanzados += 5;
        estado.tickets.forEach((t) => {
          if (t.estado !== 'Resuelto' && !t.slaPausado) {
            t.slaTranscurridoSeg += 300;
            const roto = t.slaTranscurridoSeg > t.slaObjetivoSeg;
            if (!t.slaIncumplido && roto) {
              estado.evaluacion = registrarEvento(
                estado.evaluacion,
                -15,
                `SLA vencido en incidente ${t.prioridad}`,
                t.id,
                'sla_vencido'
              );
            }
            t.slaIncumplido = roto;
          }
        });
        guardarEstado();
        render();
        break;
      case 'abrir-escenarios':
        ui.modal = { tipo: 'escenarios' };
        renderModals();
        break;
      case 'detener-escenario':
        limpiarTimersEscenario();
        ui.escenarioEnCurso = null;
        render();
        break;
      case 'abrir-nuevo-ticket':
        ui.modal = { tipo: 'nuevoTicket' };
        renderModals();
        break;
      case 'abrir-declarar-problema':
        ui.modal = { tipo: 'declararProblema' };
        renderModals();
        break;
      case 'cerrar-modal':
        ui.modal = null;
        renderModals();
        break;
      case 'exportar-general':
        ui.printContext = { tipo: 'general' };
        renderModals();
        break;
      case 'imprimir-ahora':
        window.print();
        break;
      case 'cerrar-print':
        ui.printContext = null;
        renderModals();
        break;
      default:
        break;
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.dataset && e.target.dataset.toggleSel) {
      const id = e.target.dataset.toggleSel;
      if (ui.seleccionados.includes(id)) {
        ui.seleccionados = ui.seleccionados.filter((x) => x !== id);
      } else {
        ui.seleccionados.push(id);
      }
      render();
    }
    if (e.target.id === 'select-rca-problema') {
      ui.problemaRcaId = e.target.value;
      render();
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'input-busqueda-tickets') {
      ui.busqueda = e.target.value;
      renderAppShell();
      const inp = document.getElementById('input-busqueda-tickets');
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    }
  });

  document.addEventListener('submit', (e) => {
    e.preventDefault();
    if (e.target.id === 'form-nuevo-ticket') {
      const fd = new FormData(e.target);
      const imp = fd.get('impacto');
      const urg = fd.get('urgencia');
      const cat = fd.get('categoria');
      const calc = calcularPrioridadITIL(imp, urg);
      crearTicketObj(
        {
          titulo: String(fd.get('titulo') || '').trim(),
          descripcion: String(fd.get('descripcion') || 'Sin descripción').trim(),
          canalEntrada: fd.get('canalEntrada'),
          estado: 'Nuevo',
          nivel: 'N1',
          prioridad: calc.prioridad,
          impacto: imp,
          urgencia: urg,
          categoria: cat,
          ciAfectado: 'APP-PROD-01',
          solicitante: 'Usuario Corporativo',
          asignadoA: 'Mesa N1',
          slaObjetivoMin: calc.slaObjetivoMin,
          slaObjetivoSeg: calc.slaObjetivoSeg,
          slaTranscurridoSeg: 0,
          slaPausado: false,
          slaIncumplido: false,
          problemaVinculadoId: null,
        },
        true
      );
      ui.modal = null;
      render();
    } else if (e.target.id === 'form-cierre-mayor') {
      const fd = new FormData(e.target);
      const tid = e.target.dataset.ticketId;
      ui.modal = null;
      ejecutarCierreTicket(tid, {
        workaround: String(fd.get('workaround') || '').trim(),
        solucionDefinitiva: String(fd.get('solucionDefinitiva') || '').trim(),
        causaRaizDocumentada: String(fd.get('causaRaiz') || '').trim(),
        fechaCierre: new Date().toISOString(),
      });
    } else if (e.target.id === 'form-declarar-prb') {
      const fd = new FormData(e.target);
      const maxP = estado.problemas.reduce((m, p) => {
        const n = parseInt(p.id.replace('PRB-', ''), 10);
        return Number.isNaN(n) ? m : Math.max(m, n);
      }, 110);
      const pid = 'PRB-' + String(maxP + 1).padStart(4, '0');
      estado.problemas.unshift({
        id: pid,
        titulo: String(fd.get('titulo') || '').trim(),
        descripcion: String(fd.get('descripcion') || '').trim(),
        estado: 'Investigación',
        prioridad: fd.get('prioridad'),
        categoria: 'General',
        ciAfectado: String(fd.get('ciAfectado') || 'CI-01'),
        responsable: 'Gestor N2',
        creadoEn: new Date().toISOString(),
        workaround: '',
        causaRaiz: '',
        analisis5Porques: ['', '', '', '', ''],
        ishikawa: { maquina: [], metodo: [], material: [], manoDeObra: [] },
      });
      estado.tickets.forEach((t) => {
        if (ui.seleccionados.includes(t.id)) t.problemaVinculadoId = pid;
      });
      ui.seleccionados = [];
      ui.modal = null;
      ui.vista = 'problemas';
      guardarEstado();
      render();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (ui.printContext) {
        ui.printContext = null;
        renderModals();
      } else if (ui.modal) {
        ui.modal = null;
        renderModals();
      }
    }
  });

  guardarEstado();
  render();
})();
