ROLES.push({
  id: 'tecnico',
  icon: '🔧',
  color: '#2ecc71',
  difficulty: 'mid',
  name: { es: 'TÉCNICO DE SISTEMAS', en: 'SYSADMIN' },
  desc: {
    es: 'Administras los servidores, la red y Active Directory de CorpTarget. Eres el primero en ver la anomalía y el que tiene que actuar sin romper la empresa ni destruir evidencias.',
    en: 'You run CorpTarget\'s servers, network and Active Directory. You are the first to see the anomaly and the one who must act without breaking the business or destroying evidence.'
  },
  stats: [
    { key: 'control', label: { es: 'CONTROL', en: 'CONTROL' }, start: 60, main: true },
    { key: 'servicio', label: { es: 'SERVICIO', en: 'UPTIME' }, start: 100 },
    { key: 'evidencias', label: { es: 'EVIDENCIAS', en: 'EVIDENCE' }, start: 50 }
  ],
  tools: ['PowerShell', 'Active Directory', { es: 'Switches gestionables', en: 'Managed switches' }, 'WinPMEM', { es: 'Sistema de copias', en: 'Backup system' }],
  scenarios: [
    {
      phase: { es: 'ANOMALÍA DETECTADA', en: 'ANOMALY DETECTED' },
      title: { es: 'EL CONTROLADOR DE DOMINIO A LAS 3:15', en: 'THE DOMAIN CONTROLLER AT 3:15 A.M.' },
      body: {
        es: `La monitorización te avisa: <span class="highlight">CORPDC01</span> lleva diez minutos con la CPU disparada y el servidor de ficheros tiene accesos masivos a <span class="highlight">\\\\FILESERVER01\\CLIENTES</span>. Nadie debería estar trabajando a esta hora.`,
        en: `Monitoring alerts you: <span class="highlight">CORPDC01</span> has had CPU pegged for ten minutes and the file server shows mass access to <span class="highlight">\\\\FILESERVER01\\CLIENTES</span>. Nobody should be working at this hour.`
      },
      term: R`
# ⟪Triaje rápido en CORPDC01 (sesión de administración)|Quick triage on CORPDC01 (admin session)⟫
$ PS C:\> :: Get-NetTCPConnection -LocalPort 389 -State Established | Group-Object RemoteAddress | Sort-Object Count -Desc | Select-Object -First 3 Count,Name
Count Name
----- ----
 3112 10.10.10.44
   41 10.10.10.10
   12 10.10.10.30
$ PS C:\> :: Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4728} -MaxEvents 1 | Format-List TimeCreated,Message
TimeCreated : 17/03/2025 3:16:02
Message     : ⟪Se agregó un miembro a un grupo global con seguridad habilitada|A member was added to a security-enabled global group⟫ — IT_Admins ← jgarcia
! ⟪10.10.10.44 es JGARCIA-PC. Nadie ha pedido ese cambio de grupo|10.10.10.44 is JGARCIA-PC. Nobody requested that group change⟫`,
      choices: [
        { t: { es: 'Avisar al SOC y documentar lo visto antes de tocar nada', en: 'Alert the SOC and document what you saw before touching anything' },
          f: { es: 'Correcto: el SOC coordina la respuesta y tus notas con horas exactas serán evidencia. Actuar a solas puede pisar su trabajo.', en: 'Right: the SOC coordinates the response and your timestamped notes become evidence. Acting alone can trample their work.' },
          risk: 'low', xp: 45, fx: { control: 20, evidencias: 15 } },
        { t: { es: 'Quitar a jgarcia de IT_Admins inmediatamente', en: 'Remove jgarcia from IT_Admins immediately' },
          f: { es: 'Reduce el daño, pero el atacante ve el cambio y puede acelerar. Hazlo coordinado con el SOC y anotándolo.', en: 'It limits damage, but the attacker sees the change and may speed up. Do it in coordination with the SOC and log it.' },
          risk: 'med', xp: 30, fx: { control: 10 } },
        { t: { es: 'Reiniciar el DC para "limpiar" el problema', en: 'Reboot the DC to "clean up" the problem' },
          f: { es: 'Grave error: pierdes la memoria con las evidencias, toda la empresa se queda sin autenticación y el atacante sigue teniendo credenciales.', en: 'Serious mistake: you lose memory evidence, the whole company loses authentication and the attacker still holds credentials.' },
          risk: 'high', xp: 0, fx: { control: -30, servicio: -30, evidencias: -30 } },
        { t: { es: 'Esperar a la mañana: "seguramente es una copia de seguridad"', en: 'Wait until morning: "it is probably a backup job"' },
          f: { es: 'Las copias no añaden usuarios a grupos de administradores. Cada hora que pasa el atacante avanza.', en: 'Backups do not add users to admin groups. Every hour that passes the attacker advances.' },
          risk: 'high', xp: 5, fx: { control: -30 } }
      ]
    },
    {
      phase: { es: 'DIAGNÓSTICO', en: 'DIAGNOSIS' },
      title: { es: '¿HASTA DÓNDE HA LLEGADO?', en: 'HOW FAR HAVE THEY GOT?' },
      body: {
        es: `El SOC te pide el alcance: qué sistemas están tocados y cuáles no. <span class="warn-txt">Regla de oro: no modificar nada sin documentarlo.</span>`,
        en: `The SOC asks you for scope: which systems are hit and which are not. <span class="warn-txt">Golden rule: change nothing without documenting it.</span>`
      },
      term: R`
# ⟪Inventario y señales de compromiso|Inventory and signs of compromise⟫
$ PS C:\> :: 1..50 | ForEach-Object { if (Test-Connection "10.10.10.$_" -Count 1 -Quiet) { "LIVE 10.10.10.$_" } }
LIVE 10.10.10.5    CORPDC01
LIVE 10.10.10.10   FILESERVER01
LIVE 10.10.10.20   BACKUP01
LIVE 10.10.10.30   SQL01
LIVE 10.10.10.44   JGARCIA-PC
$ PS C:\> :: Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4662} | Where-Object Message -match '1131f6ad-9c07-11d1-f79f-00c04fc2dcd2' | Select-Object -First 1 TimeCreated
TimeCreated : 17/03/2025 3:19:44
! ⟪Replicación de directorio (DCSync) pedida por jgarcia: los hashes del dominio están comprometidos|Directory replication (DCSync) requested by jgarcia: domain hashes are compromised⟫
⟪BACKUP01: sin accesos anómalos… de momento|BACKUP01: no anomalous access… so far⟫`,
      choices: [
        { t: { es: 'Desconectar BACKUP01 de la red para proteger las copias', en: 'Disconnect BACKUP01 from the network to protect the backups' },
          f: { es: 'Clave: si el atacante llega a las copias, no hay recuperación posible. Las copias fuera de línea son tu seguro de vida.', en: 'Key move: if the attacker reaches the backups, there is no recovery. Offline backups are your lifeline.' },
          risk: 'low', xp: 45, fx: { control: 25 } },
        { t: { es: 'Deshabilitar la cuenta jgarcia en AD', en: 'Disable the jgarcia account in AD' },
          f: { es: 'Buena primera medida, pero con los hashes del dominio robados el atacante puede usar otras cuentas.', en: 'A good first step, but with the domain hashes stolen the attacker can use other accounts.' },
          risk: 'low', xp: 30, fx: { control: 10 } },
        { t: { es: 'Restaurar ya los servidores desde copia', en: 'Restore the servers from backup right now' },
          f: { es: 'Precipitado: no sabes desde cuándo está dentro el atacante, así que la copia puede estar contaminada, y destruyes evidencias.', en: 'Rushed: you do not know how long the attacker has been in, so the backup may be tainted, and you destroy evidence.' },
          risk: 'high', xp: 10, fx: { control: -20, evidencias: -25 } },
        { t: { es: 'Borrar los ficheros sospechosos de JGARCIA-PC', en: 'Delete the suspicious files from JGARCIA-PC' },
          f: { es: 'Destruyes evidencias y no eliminas el resto de la persistencia que el atacante tenga en otros equipos.', en: 'You destroy evidence and leave the attacker\'s persistence on other hosts untouched.' },
          risk: 'high', xp: 5, fx: { control: -20, evidencias: -30 } }
      ]
    },
    {
      phase: { es: 'AISLAMIENTO', en: 'ISOLATION' },
      title: { es: 'CORTAR SIN APAGAR', en: 'CUT OFF WITHOUT SHUTTING DOWN' },
      body: {
        es: `El SOC confirma dos equipos comprometidos: <span class="highlight">JGARCIA-PC</span> y <span class="highlight">FILESERVER01</span>, y un canal de fuga por DNS. Necesitan que los aísles sin perder lo que hay en memoria.`,
        en: `The SOC confirms two compromised hosts: <span class="highlight">JGARCIA-PC</span> and <span class="highlight">FILESERVER01</span>, plus a DNS exfiltration channel. They need you to isolate them without losing what is in memory.`
      },
      term: R`
# ⟪Opciones de aislamiento|Isolation options⟫
⟪Switch de acceso: mover los puertos a la VLAN 999 (cuarentena, solo acceso forense)|Access switch: move the ports to VLAN 999 (quarantine, forensic access only)⟫
⟪Firewall: bloquear 203.0.113.47 y el DNS de salida salvo resolvedores corporativos|Firewall: block 203.0.113.47 and outbound DNS except corporate resolvers⟫
⟪Impacto: FILESERVER01 aloja las carpetas de 120 empleados|Impact: FILESERVER01 hosts folders for 120 employees⟫`,
      choices: [
        { t: { es: 'VLAN de cuarentena para ambos y bloqueo del DNS de salida', en: 'Quarantine VLAN for both and block outbound DNS' },
          f: { es: 'Los equipos siguen encendidos (memoria intacta) pero no hablan con nadie, y el canal de fuga queda cortado. Aislamiento de manual.', en: 'The hosts stay on (memory intact) but talk to no one, and the leak channel is cut. Textbook isolation.' },
          risk: 'low', xp: 50, fx: { control: 30, servicio: -10 } },
        { t: { es: 'Bloquear solo la IP del atacante en el firewall', en: 'Block only the attacker\'s IP on the firewall' },
          f: { es: 'Insuficiente: el atacante tiene un túnel DNS y puede cambiar de IP en minutos.', en: 'Not enough: the attacker has a DNS tunnel and can change IP in minutes.' },
          risk: 'med', xp: 20, fx: { control: 5 } },
        { t: { es: 'Desenchufar los dos equipos de la corriente', en: 'Pull the power on both hosts' },
          f: { es: 'Cortas el ataque, pero pierdes toda la memoria volátil: procesos inyectados, claves y conexiones que el forense necesitaba.', en: 'You stop the attack but lose all volatile memory: injected processes, keys and connections the forensic team needed.' },
          risk: 'high', xp: 10, fx: { control: 5, evidencias: -35 } },
        { t: { es: 'Apagar también el controlador de dominio por si acaso', en: 'Shut down the domain controller too, just in case' },
          f: { es: 'Toda la empresa se queda sin inicio de sesión y el DC no estaba en la lista de equipos a aislar. Daño sin beneficio.', en: 'The whole company loses sign-in and the DC was not on the isolation list. Harm with no benefit.' },
          risk: 'high', xp: 5, fx: { control: -25, servicio: -40 } }
      ]
    },
    {
      phase: { es: 'FORENSICS', en: 'FORENSICS' },
      title: { es: 'APOYO AL EQUIPO FORENSE', en: 'SUPPORTING THE FORENSIC TEAM' },
      body: {
        es: `El forense externo llegará en cuatro horas y te pide que adquieras lo más volátil antes de que se pierda. Tienes acceso a los equipos aislados por la VLAN de cuarentena.`,
        en: `The external forensic team arrives in four hours and asks you to capture the most volatile data before it is lost. You can reach the isolated hosts through the quarantine VLAN.`
      },
      term: R`
# ⟪Adquisición de memoria en JGARCIA-PC|Memory acquisition on JGARCIA-PC⟫
$ PS E:\> :: .\winpmem_mini_x64.exe E:\INC-2025-0847\JGARCIA-PC_mem.raw
⟪Adquiriendo 16 GB de RAM…|Acquiring 16 GB of RAM…⟫ 100%
$ PS E:\> :: Get-FileHash E:\INC-2025-0847\JGARCIA-PC_mem.raw -Algorithm SHA256
SHA256  7F3A9B2C61D0E4…   E:\INC-2025-0847\JGARCIA-PC_mem.raw
# ⟪Orden de volatilidad (RFC 3227): memoria → conexiones → procesos → disco|Order of volatility (RFC 3227): memory → connections → processes → disk⟫`,
      choices: [
        { t: { es: 'Volcar la RAM a un disco externo, calcular el hash y registrar quién, cuándo y cómo', en: 'Dump RAM to an external drive, hash it and record who, when and how' },
          f: { es: 'Evidencia íntegra y con cadena de custodia. El forense podrá usarla incluso ante un juez.', en: 'Intact evidence with chain of custody. The forensic team can use it even in court.' },
          risk: 'low', xp: 50, fx: { control: 10, evidencias: 35 } },
        { t: { es: 'Pasar un antivirus completo para ver qué encuentra', en: 'Run a full antivirus scan to see what it finds' },
          f: { es: 'El antivirus modifica el sistema, mueve muestras a cuarentena y altera fechas. Mejor después de adquirir.', en: 'The antivirus changes the system, moves samples to quarantine and alters timestamps. Better after acquisition.' },
          risk: 'med', xp: 15, fx: { evidencias: -15 } },
        { t: { es: 'Copiar los ficheros sospechosos con el Explorador a un USB', en: 'Copy the suspicious files to a USB stick with Explorer' },
          f: { es: 'Alteras las fechas de acceso y no queda registro fiable de la copia. Y el USB puede infectarse.', en: 'You alter access timestamps and leave no reliable record of the copy. And the USB stick may get infected.' },
          risk: 'high', xp: 10, fx: { evidencias: -25 } },
        { t: { es: 'Reinstalar el equipo para que el usuario pueda trabajar', en: 'Reinstall the machine so the user can work' },
          f: { es: 'Borras todas las evidencias del equipo origen del ataque. El forense ya no podrá reconstruir qué pasó.', en: 'You wipe all evidence from the host where the attack started. Forensics can no longer reconstruct what happened.' },
          risk: 'high', xp: 0, fx: { control: -25, evidencias: -45 } }
      ]
    },
    {
      phase: { es: 'PARCHES', en: 'PATCHING' },
      title: { es: 'CERRAR LA PUERTA DE ENTRADA', en: 'CLOSING THE FRONT DOOR' },
      body: {
        es: `El forense confirma el vector: la VPN Pulse Secure <span class="highlight">9.0R1</span> vulnerable a <span class="highlight">CVE-2019-11510</span>, cuyo parche existe desde abril de 2019. Las autoridades (aviso CISA AA20-010A) advirtieron de que parchear no basta si las credenciales ya se han robado.`,
        en: `Forensics confirms the vector: the Pulse Secure VPN <span class="highlight">9.0R1</span> vulnerable to <span class="highlight">CVE-2019-11510</span>, patched since April 2019. Authorities (CISA advisory AA20-010A) warned that patching is not enough if credentials were already stolen.`
      },
      term: R`
# ⟪Estado de la VPN|VPN status⟫
⟪Versión instalada|Installed version⟫ : Pulse Connect Secure 9.0R1
⟪Aviso del fabricante|Vendor advisory⟫  : SA44101 — ⟪versión corregida en la rama 9.0: 9.0R3.4 o posterior|fixed version on the 9.0 branch: 9.0R3.4 or later⟫
⟪Sesiones activas|Active sessions⟫   : 37
⟪Cuentas VPN|VPN accounts⟫      : 212 ⟪(sin MFA)|(no MFA)⟫`,
      choices: [
        { t: { es: 'Actualizar, cerrar todas las sesiones y obligar a cambiar todas las contraseñas de la VPN', en: 'Upgrade, kill every session and force a reset of all VPN passwords' },
          f: { es: 'Exactamente lo que recomendó CISA: el parche cierra la vulnerabilidad y el cambio de credenciales deja fuera a quien ya las tenía.', en: 'Exactly what CISA recommended: the patch closes the hole and the credential reset locks out whoever already had them.' },
          risk: 'low', xp: 50, fx: { control: 30, servicio: -10 } },
        { t: { es: 'Solo actualizar la versión', en: 'Just upgrade the version' },
          f: { es: 'La vulnerabilidad queda cerrada, pero las 212 contraseñas ya robadas siguen sirviendo para entrar.', en: 'The vulnerability is closed, but the 212 already stolen passwords still work to log in.' },
          risk: 'med', xp: 20, fx: { control: 5 } },
        { t: { es: 'Esperar a la ventana de mantenimiento del mes que viene', en: 'Wait for next month\'s maintenance window' },
          f: { es: 'Un mes más con una vulnerabilidad CVSS 10 explotada activamente. Inaceptable.', en: 'Another month with an actively exploited CVSS 10 vulnerability. Unacceptable.' },
          risk: 'high', xp: 0, fx: { control: -35 } },
        { t: { es: 'Cambiar el puerto de la VPN para que no la encuentren', en: 'Move the VPN to another port so nobody finds it' },
          f: { es: 'Seguridad por oscuridad: cualquier escáner la encuentra en minutos.', en: 'Security through obscurity: any scanner finds it in minutes.' },
          risk: 'high', xp: 5, fx: { control: -20 } }
      ]
    },
    {
      phase: { es: 'HARDENING', en: 'HARDENING' },
      title: { es: 'QUE LA PRÓXIMA VEZ SEA MÁS DIFÍCIL', en: 'MAKE IT HARDER NEXT TIME' },
      body: {
        es: `Con el incidente cerrado, tienes margen para endurecer la infraestructura. ¿Qué priorizas?`,
        en: `With the incident closed, you have room to harden the infrastructure. What do you prioritise?`
      },
      term: R`
# ⟪Debilidades que explotó el atacante|Weaknesses the attacker exploited⟫
$ PS C:\> :: (Get-Acl "AD:CN=IT_Admins,OU=Groups,DC=corptarget,DC=local").Access | Where-Object IdentityReference -match 'jgarcia' | Select-Object ActiveDirectoryRights
ActiveDirectoryRights
---------------------
GenericWrite
⟪Además: VPN sin MFA · mismo administrador local en todos los equipos · sin control del DNS de salida|Also: VPN without MFA · same local admin on every host · no outbound DNS control⟫`,
      choices: [
        { t: { es: 'MFA en la VPN, quitar permisos sobrantes en AD, LAPS y modelo de administración por niveles', en: 'MFA on the VPN, strip excess AD permissions, LAPS and a tiered admin model' },
          f: { es: 'Atacas cada eslabón de la cadena: entrar, escalar y moverse lateralmente pasan a ser mucho más difíciles.', en: 'You attack each link in the chain: getting in, escalating and moving laterally all become much harder.' },
          risk: 'low', xp: 50, fx: { control: 30 } },
        { t: { es: 'Revisar los permisos de AD y quitar el GenericWrite de jgarcia', en: 'Review AD permissions and remove jgarcia\'s GenericWrite' },
          f: { es: 'Correcto y necesario, pero es una sola pieza: sin MFA la puerta de entrada sigue igual.', en: 'Right and necessary, but it is a single piece: without MFA the front door stays the same.' },
          risk: 'low', xp: 30, fx: { control: 15 } },
        { t: { es: 'Bloquear todo el acceso a Internet de la plantilla', en: 'Block all Internet access for staff' },
          f: { es: 'Paraliza el negocio y la gente buscará formas de saltárselo, creando más riesgo.', en: 'It paralyses the business and people will find workarounds, creating more risk.' },
          risk: 'high', xp: 5, fx: { control: -10, servicio: -40 } },
        { t: { es: 'Dejarlo como estaba: "ya hemos parcheado"', en: 'Leave things as they were: "we have patched"' },
          f: { es: 'Los permisos excesivos y la falta de MFA siguen ahí para el próximo atacante.', en: 'The excessive permissions and lack of MFA are still there for the next attacker.' },
          risk: 'high', xp: 0, fx: { control: -30 } }
      ]
    }
  ]
});
