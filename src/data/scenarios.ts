import { EscenarioSimulacion } from '../types/itsm';

/**
 * Escenarios predefinidos de clase para ServiceDeskLab (Ciberseguridad y Sistemas).
 * Cada escenario inyecta llamadas y alertas progresivamente mediante setTimeout.
 */
export const ESCENARIOS_SIMULACION: EscenarioSimulacion[] = [
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
          '¡Urgente! Archivos de facturación en carpeta compartida ERP aparecen con extensión .lockbit3',
        descripcion:
          'Usuaria desesperada al teléfono indica que ninguna hoja ni PDF del ERP abre y todos los ficheros cambiaron de nombre hace 2 minutos.',
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
          'Almacén parado: aparece nota de rescate README_DECRYPT.txt en terminales de expedición',
        descripcion:
          'El encargado de logística llama alarmado porque los albaranes no se imprimen y los discos de red están inaccesibles.',
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
          'Alerta SIEM Crítica: cifrado masivo vía SMB (puerto 445) originado desde host WS-CONT-014',
        descripcion:
          'Regla EDR/SIEM detecta >12.000 operaciones de renombrado por minuto en volumen /srv/erp-data. Se requiere aislamiento inmediato de red.',
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
          'Dirección exige estado del servicio ERP: clientes bloqueados sin poder confirmar pedidos',
        descripcion:
          'Llamada directa de Dirección Financiera solicitando ETAs, activación de plan de contingencia y comunicación oficial.',
        canalEntrada: 'Teléfono',
        categoria: 'Seguridad & Certificados',
        ciAfectado: 'APP-ERP-PROD-01',
        solicitante: 'Roberto Sáenz (Dirección)',
        impacto: 'Alto',
        urgencia: 'Alta',
        nivelInicial: 'N1',
      },
      {
        retrasoMs: 10800,
        titulo:
          'Intento anómalo de borrado de Shadow Copies (vssadmin) en servidor de respaldo',
        descripcion:
          'Agente de monitorización alerta sobre ejecución de comando sospechoso bloqueado parcialmente por política de respaldo inmutable.',
        canalEntrada: 'Monitorización',
        categoria: 'Seguridad & Certificados',
        ciAfectado: 'BCK-VEEAM-01',
        solicitante: 'Monitorización Veeam',
        impacto: 'Alto',
        urgencia: 'Alta',
        nivelInicial: 'N2',
      },
    ],
  },
  {
    id: 'ESC-SWITCH-CORE',
    titulo: 'Caída del Switch Core en Sede Central',
    subtitulo:
      'Tormenta de llamadas por pérdida simultánea de red cableada, Wi-Fi, telefonía VoIP y acceso a cabinas.',
    categoriaPrincipal: 'Redes & Conectividad',
    severidadEsperada: 'P1 - Crítica',
    objetivoDidactico:
      'Correlacionar síntomas dispersos (VoIP, Wi-Fi, VMware) hacia un único CI raíz (SW-CORE-DIST-01) y aplicar Workaround.',
    duracionTotalSeg: 10,
    tickets: [
      {
        retrasoMs: 0,
        titulo:
          '¡Sin red ni teléfono en toda la Planta 3! Nadie puede trabajar ni atender llamadas',
        descripcion:
          'Llamada desde móvil personal reportando que todos los puestos muestran cable de red desconectado y los teléfonos IP se reinician.',
        canalEntrada: 'Teléfono',
        categoria: 'Redes & Conectividad',
        ciAfectado: 'SW-CORE-DIST-01',
        solicitante: 'Patricia Navas (Atención Cliente)',
        impacto: 'Alto',
        urgencia: 'Alta',
        nivelInicial: 'N1',
      },
      {
        retrasoMs: 2400,
        titulo:
          'Tornos de acceso y red Wi-Fi corporativa caídos en recepción',
        descripcion:
          'Control de accesos sin validación contra controlador RADIUS; visitantes y empleados sin conectividad inalámbrica.',
        canalEntrada: 'Teléfono',
        categoria: 'Redes & Conectividad',
        ciAfectado: 'WLC-WIFI-MAD-01',
        solicitante: 'Recepción Sede Central',
        impacto: 'Alto',
        urgencia: 'Media',
        nivelInicial: 'N1',
      },
      {
        retrasoMs: 4900,
        titulo:
          'SNMP Unreachable en SW-CORE-DIST-01 (pérdida de adyacencia OSPF y VLANs 10/20/30)',
        descripcion:
          'LibreNMS detecta caída total del plano de control en el switch core primario tras pico de temperatura en rack CPD-A.',
        canalEntrada: 'Monitorización',
        categoria: 'Redes & Conectividad',
        ciAfectado: 'SW-CORE-DIST-01',
        solicitante: 'Monitorización LibreNMS',
        impacto: 'Alto',
        urgencia: 'Alta',
        nivelInicial: 'N2',
      },
      {
        retrasoMs: 7400,
        titulo:
          'Desconexión de sesiones iSCSI entre host ESXi-02 y cabina de almacenamiento',
        descripcion:
          'Equipo de sistemas reporta degradación de datastores por caída de enlaces trunk LACP hacia el núcleo de conmutación.',
        canalEntrada: 'Correo Corporativo',
        categoria: 'Infraestructura Cloud',
        ciAfectado: 'HV-ESXI-PROD-02',
        solicitante: 'Diego Morales (Sistemas)',
        impacto: 'Alto',
        urgencia: 'Alta',
        nivelInicial: 'N2',
      },
      {
        retrasoMs: 9800,
        titulo:
          'Equipo Comercial sin acceso a CRM en mitad de cierre de contratos',
        descripcion:
          'Llamada urgente de Ventas solicitando alternativa inmediata (tethering o conmutación a switch core secundario).',
        canalEntrada: 'Teléfono',
        categoria: 'Redes & Conectividad',
        ciAfectado: 'SW-CORE-DIST-01',
        solicitante: 'Elena Castro (Comercial)',
        impacto: 'Medio',
        urgencia: 'Alta',
        nivelInicial: 'N1',
      },
    ],
  },
  {
    id: 'ESC-WIN-UPDATE',
    titulo: 'Falsa alarma por actualización masiva de Windows',
    subtitulo:
      'Oleada de usuarios asustados tras reinicio automático del parche KB5034765: prueba de triaje ITIL.',
    categoriaPrincipal: 'Puesto de Trabajo',
    severidadEsperada: 'P3 - Media',
    objetivoDidactico:
      'Evitar el pánico y la sobreclasificación P1: verificar la causa benigna, agrupar tickets y resolver sin falsos escalados.',
    duracionTotalSeg: 8,
    tickets: [
      {
        retrasoMs: 0,
        titulo:
          '¡Mi ordenador tarda 5 minutos en arrancar y la barra de tareas sale en blanco!',
        descripcion:
          'Usuario muy nervioso cree que tiene un virus tras ver pantalla azul de "Configurando actualizaciones" durante 4 minutos.',
        canalEntrada: 'Teléfono',
        categoria: 'Puesto de Trabajo',
        ciAfectado: 'WS-RRHH-009',
        solicitante: 'Nuria Blanco (RRHH)',
        impacto: 'Bajo',
        urgencia: 'Media',
        nivelInicial: 'N1',
      },
      {
        retrasoMs: 2500,
        titulo:
          '¡Creo que nos han hackeado! El PC se reinició solo y parpadeó el escritorio',
        descripcion:
          'Usuaria de Marketing llama alarmada pidiendo desconectar toda la oficina porque Windows mostró un mensaje de reinicio.',
        canalEntrada: 'Teléfono',
        categoria: 'Puesto de Trabajo',
        ciAfectado: 'WS-MKT-021',
        solicitante: 'Paula Serrano (Marketing)',
        impacto: 'Bajo',
        urgencia: 'Media',
        nivelInicial: 'N1',
      },
      {
        retrasoMs: 5200,
        titulo:
          'Equipo lento con proceso TiWorker.exe al 85% de CPU desde las 09:00',
        descripcion:
          'El usuario puede seguir trabajando en navegador pero nota ventilador acelerado tras encendido matinal.',
        canalEntrada: 'Portal de Usuario',
        categoria: 'Puesto de Trabajo',
        ciAfectado: 'WS-ADM-017',
        solicitante: 'Óscar Ruiz (Administración)',
        impacto: 'Bajo',
        urgencia: 'Baja',
        nivelInicial: 'N1',
      },
      {
        retrasoMs: 7800,
        titulo:
          'Aviso informativo WSUS/Intune: despliegue programado de parche acumulativo KB5034765',
        descripcion:
          'Ventana de parcheo estándar en 45 equipos de oficina; sin anomalías en servidores core ni incidentes de seguridad.',
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
  {
    id: 'ESC-CERT-API',
    titulo: 'Expiración de certificado TLS en API Gateway B2B',
    subtitulo:
      'Errores SSL_CERT_EXPIRED en integraciones con clientes externos y portal web.',
    categoriaPrincipal: 'Seguridad & Certificados',
    severidadEsperada: 'P2 - Alta',
    objetivoDidactico:
      'Identificar la caducidad del certificado, emitir renovación urgente y documentar prevención en Ishikawa.',
    duracionTotalSeg: 8,
    tickets: [
      {
        retrasoMs: 0,
        titulo:
          'Integración EDI con proveedor logístico rechazada por error SSL certificate expired',
        descripcion:
          'El partner reporta fallo TLS handshake contra api.empresa.com desde las 00:00 UTC.',
        canalEntrada: 'Correo Corporativo',
        categoria: 'Seguridad & Certificados',
        ciAfectado: 'APIGW-EDGE-01',
        solicitante: 'Soporte Partner EDI',
        impacto: 'Alto',
        urgencia: 'Media',
        nivelInicial: 'N1',
      },
      {
        retrasoMs: 2600,
        titulo:
          'App móvil corporativa muestra "Conexión no segura" al consultar pedidos',
        descripcion:
          'Comerciales en ruta no pueden sincronizar catálogo desde dispositivos iOS y Android.',
        canalEntrada: 'Teléfono',
        categoria: 'Seguridad & Certificados',
        ciAfectado: 'APIGW-EDGE-01',
        solicitante: 'Delegación Comercial Norte',
        impacto: 'Medio',
        urgencia: 'Alta',
        nivelInicial: 'N1',
      },
      {
        retrasoMs: 5200,
        titulo:
          'Sonda sintética HTTP: certificado *.empresa.com expirado hace 45 minutos',
        descripcion:
          'Fallo en renovación automática ACME/Certbot por cambio de registro DNS TXT pendiente.',
        canalEntrada: 'Monitorización',
        categoria: 'Infraestructura Cloud',
        ciAfectado: 'APIGW-EDGE-01',
        solicitante: 'Monitorización Blackbox',
        impacto: 'Alto',
        urgencia: 'Alta',
        nivelInicial: 'N2',
      },
    ],
  },
];
