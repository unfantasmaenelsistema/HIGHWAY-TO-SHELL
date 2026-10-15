ROLES.push({
  id: 'soc',
  icon: '🛡️',
  color: '#00d4ff',
  difficulty: 'mid',
  name: { es: 'ANALISTA SOC', en: 'SOC ANALYST' },
  desc: {
    es: 'Analista del Centro de Operaciones de Seguridad en el turno de noche. Detectas, contienes y erradicas el incidente con SIEM, EDR y la red a tu alcance.',
    en: 'Night-shift Security Operations Centre analyst. You detect, contain and eradicate the incident with SIEM, EDR and the network at your fingertips.'
  },
  stats: [
    { key: 'control', label: { es: 'CONTROL', en: 'CONTROL' }, start: 50, main: true },
    { key: 'visibilidad', label: { es: 'VISIBILIDAD', en: 'VISIBILITY' }, start: 60 },
    { key: 'evidencias', label: { es: 'EVIDENCIAS', en: 'EVIDENCE' }, start: 20 }
  ],
  tools: ['Splunk (SIEM)', 'EDR', 'Zeek', 'Firewall', { es: 'Playbooks de respuesta', en: 'Response playbooks' }],
  scenarios: [
    {
      phase: { es: 'MONITORIZACIÓN', en: 'MONITORING' },
      title: { es: 'TURNO DE NOCHE — TRES ALERTAS', en: 'NIGHT SHIFT — THREE ALERTS' },
      body: {
        es: `Son las <span class="highlight">02:47 UTC</span>. El SIEM muestra actividad contra <span class="highlight">vpn.corptarget.com</span> desde <span class="highlight">203.0.113.47</span>, una IP que figura en listas de nodos de salida Tor.<br><br>
Tienes tres alertas abiertas y la cola de tickets llena. ¿Por dónde empiezas?`,
        en: `It is <span class="highlight">02:47 UTC</span>. The SIEM shows activity against <span class="highlight">vpn.corptarget.com</span> from <span class="highlight">203.0.113.47</span>, an IP listed as a Tor exit node.<br><br>
You have three open alerts and a full ticket queue. Where do you start?`
      },
      term: R`
# ⟪Splunk — tráfico de la IP sospechosa en la última hora|Splunk — suspicious IP traffic in the last hour⟫
$ splunk> :: index=firewall src_ip=203.0.113.47 earliest=-1h | stats count by dest_port
dest_port  count
443        1247
3389       47
1433       12

[HIGH] ⟪Escaneo de puertos desde 203.0.113.47|Port scan from 203.0.113.47⟫
[MED]  ⟪Sesión VPN sin MFA desde nodo Tor|VPN session without MFA from Tor node⟫
[LOW]  ⟪Inicio de sesión fuera de horario: jgarcia (03:04)|Off-hours login: jgarcia (03:04)⟫`,
      choices: [
        { t: { es: 'Investigar primero el inicio de sesión de jgarcia', en: 'Investigate the jgarcia login first' },
          f: { es: 'Buena priorización: la alerta "baja" es la que importa. jgarcia trabaja en Madrid y está conectada desde Tor a las 3 de la mañana. Escalas el incidente.', en: 'Good triage: the "low" alert is the one that matters. jgarcia works in Madrid and is connected from Tor at 3 a.m. You escalate the incident.' },
          risk: 'low', xp: 45, fx: { control: 20, visibilidad: 15 } },
        { t: { es: 'Bloquear la IP en el firewall y seguir con la cola', en: 'Block the IP on the firewall and get on with the queue' },
          f: { es: 'Ganas algo de tiempo, pero el atacante cambia de nodo Tor en minutos y la sesión VPN ya abierta sigue activa.', en: 'You buy some time, but the attacker switches Tor node in minutes and the already open VPN session stays alive.' },
          risk: 'med', xp: 25, fx: { control: 5 } },
        { t: { es: 'Cerrar antes los tickets pendientes', en: 'Clear the pending tickets first' },
          f: { es: 'Pierdes 40 minutos en tickets menores mientras el atacante mapea Active Directory.', en: 'You lose 40 minutes on minor tickets while the attacker maps Active Directory.' },
          risk: 'high', xp: 5, fx: { control: -25 } },
        { t: { es: 'Marcar el escaneo como falso positivo: "Internet siempre escanea"', en: 'Mark the scan as a false positive: "the Internet always scans"' },
          f: { es: 'Es verdad que hay ruido constante, pero aquí el escaneo va seguido de un acceso válido. Correlacionar es tu trabajo.', en: 'There is constant noise, true, but here the scan is followed by a valid login. Correlation is your job.' },
          risk: 'high', xp: 0, fx: { control: -30, visibilidad: -10 } }
      ]
    },
    {
      phase: { es: 'DETECCIÓN', en: 'DETECTION' },
      title: { es: 'MOVIMIENTO LATERAL EN CURSO', en: 'LATERAL MOVEMENT IN PROGRESS' },
      body: {
        es: `El EDR dispara una alerta crítica: desde <span class="highlight">JGARCIA-PC (10.10.10.44)</span> salen miles de consultas LDAP al controlador de dominio y alguien solicita la replicación del directorio como si fuera otro DC. Es un <span class="danger-txt">COMPROMISO ACTIVO</span>.`,
        en: `EDR fires a critical alert: <span class="highlight">JGARCIA-PC (10.10.10.44)</span> is sending thousands of LDAP queries to the domain controller and someone is requesting directory replication as if they were another DC. This is an <span class="danger-txt">ACTIVE COMPROMISE</span>.`
      },
      term: R`
# ⟪Consola EDR — detalle del incidente|EDR console — incident detail⟫
INCIDENT: INC-2025-0847   SEVERITY: CRITICAL
Host: JGARCIA-PC (10.10.10.44)   User: CORPTARGET\jgarcia
  03:04  ⟪VPN: autenticación correcta desde 203.0.113.47|VPN: successful authentication from 203.0.113.47⟫
  03:12  Discovery — LDAP enumeration (4,200 queries / 30 s)
  03:16  Persistence — ⟪grupo IT_Admins modificado|IT_Admins group modified⟫ (Event 4728)
  03:19  Credential Access — DCSync ⟪desde un equipo que no es DC|from a non-DC host⟫ (Event 4662)
! ⟪Si el DCSync ha funcionado, el atacante tiene el hash de krbtgt|If DCSync succeeded, the attacker holds the krbtgt hash⟫`,
      choices: [
        { t: { es: 'Aislar JGARCIA-PC desde el EDR y revocar las sesiones de jgarcia', en: 'Isolate JGARCIA-PC via EDR and revoke jgarcia\'s sessions' },
          f: { es: 'Contención rápida sin apagar el equipo: la memoria y las evidencias se conservan. El atacante pierde su punto de apoyo.', en: 'Fast containment without powering off: memory and evidence are preserved. The attacker loses their foothold.' },
          risk: 'low', xp: 45, fx: { control: 25, evidencias: 10 } },
        { t: { es: 'Seguir observando para ver hasta dónde llega', en: 'Keep watching to see how far they get' },
          f: { es: 'Muy arriesgado sin un equipo de caza preparado: mientras miras, el atacante consigue Domain Admin.', en: 'Very risky without a hunt team ready: while you watch, the attacker reaches Domain Admin.' },
          risk: 'high', xp: 10, fx: { control: -30, visibilidad: 10 } },
        { t: { es: 'Desplegar un honeypot en la red interna', en: 'Deploy a honeypot on the internal network' },
          f: { es: 'Buena idea a medio plazo, pero ahora mismo hay un DCSync en curso: primero se contiene y luego se investiga.', en: 'A good idea in the medium term, but right now there is a DCSync in progress: contain first, investigate later.' },
          risk: 'med', xp: 20, fx: { control: -5, visibilidad: 15 } },
        { t: { es: 'Cambiar la contraseña de jgarcia y dar el incidente por cerrado', en: 'Reset jgarcia\'s password and close the incident' },
          f: { es: 'Necesario pero insuficiente: si ya tiene hashes del dominio, la contraseña de jgarcia le da igual.', en: 'Necessary but not enough: if they already hold domain hashes, jgarcia\'s password is irrelevant.' },
          risk: 'med', xp: 15, fx: { control: -10 } }
      ]
    },
    {
      phase: { es: 'ANÁLISIS', en: 'ANALYSIS' },
      title: { es: '¿QUÉ SE HAN LLEVADO?', en: 'WHAT DID THEY TAKE?' },
      body: {
        es: `Con el equipo aislado toca medir el <span class="highlight">radio de impacto</span>. El DLP no ha saltado, pero el resolvedor DNS muestra un pico de consultas extrañas durante la madrugada.`,
        en: `With the host isolated it is time to measure the <span class="highlight">blast radius</span>. DLP did not fire, but the DNS resolver shows a spike of strange queries overnight.`
      },
      term: R`
# ⟪Zeek — consultas DNS de la captura de la noche|Zeek — DNS queries from the night capture⟫
$ analyst@soc:~$ :: zeek -C -r night.pcap
$ analyst@soc:~$ :: zeek-cut id.orig_h query < dns.log | grep -c 'exfil.attacker.example'
4235
$ analyst@soc:~$ :: zeek-cut query < dns.log | grep 'exfil.attacker.example' | head -2
UEsDBBQAAAAIAJ2xb1...a.exfil.attacker.example
dGhpcyBpcyBhIHRlc3...b.exfil.attacker.example
! ⟪Subdominios en base64: túnel DNS. Origen: 10.10.10.44. ~850 MB en 23 minutos|Base64 subdomains: DNS tunnel. Source: 10.10.10.44. ~850 MB in 23 minutes⟫`,
      choices: [
        { t: { es: 'Preservar las capturas con hash y avisar a legal: posible brecha RGPD', en: 'Preserve the captures with hashes and alert legal: possible GDPR breach' },
          f: { es: 'Correcto: cadena de custodia desde el minuto uno y el reloj de 72 horas del RGPD (art. 33) en manos de quien debe decidir la notificación.', en: 'Right: chain of custody from minute one, and GDPR\'s 72-hour clock (Art. 33) in the hands of those who decide on notification.' },
          risk: 'low', xp: 45, fx: { control: 15, evidencias: 30 } },
        { t: { es: 'Bloquear el dominio exfil.attacker.example en el DNS', en: 'Block the exfil.attacker.example domain on DNS' },
          f: { es: 'Corta el canal, bien hecho, pero no contesta a la pregunta de qué datos han salido.', en: 'It cuts the channel, well done, but it does not answer what data left.' },
          risk: 'low', xp: 30, fx: { control: 15 } },
        { t: { es: 'Atacar el servidor del atacante para recuperar los datos', en: 'Hack back the attacker\'s server to recover the data' },
          f: { es: 'Ilegal: el "hackback" es un delito aunque seas la víctima, y además alerta al atacante.', en: 'Illegal: hacking back is a crime even if you are the victim, and it tips off the attacker.' },
          risk: 'high', xp: 0, fx: { control: -30 } },
        { t: { es: 'Resolverlo internamente sin contárselo a nadie', en: 'Handle it internally and tell nobody' },
          f: { es: 'Ocultar una brecha de datos personales incumple el RGPD: multas de hasta 20 M€ o el 4 % de la facturación mundial.', en: 'Hiding a personal-data breach violates GDPR: fines up to €20M or 4% of global turnover.' },
          risk: 'high', xp: 0, fx: { control: -35, evidencias: -10 } }
      ]
    },
    {
      phase: { es: 'CONTENCIÓN', en: 'CONTAINMENT' },
      title: { es: 'EL ATACANTE TIENE LAS LLAVES', en: 'THE ATTACKER HAS THE KEYS' },
      body: {
        es: `El DCSync funcionó: el atacante tiene los hashes del dominio, incluido el de <span class="highlight">krbtgt</span>. Con él puede fabricar tickets Kerberos válidos (<span class="highlight">Golden Ticket</span>) desde cualquier equipo. Aislar un PC ya no basta.`,
        en: `The DCSync worked: the attacker holds the domain hashes, including <span class="highlight">krbtgt</span>. With it they can forge valid Kerberos tickets (<span class="highlight">Golden Ticket</span>) from any machine. Isolating one PC is no longer enough.`
      },
      term: R`
# ⟪Splunk — tickets de servicio sospechosos tras el aislamiento|Splunk — suspicious service tickets after isolation⟫
$ splunk> :: index=wineventlog EventCode=4769 Ticket_Encryption_Type=0x17 earliest=-2h | stats count by Account_Name, Client_Address
Account_Name         Client_Address   count
Administrator        10.10.10.10      14
svc_backup           10.10.10.10      6
! ⟪Cifrado RC4 (0x17) desde FILESERVER01: el atacante sigue dentro por otro equipo|RC4 encryption (0x17) from FILESERVER01: the attacker is still in via another host⟫`,
      choices: [
        { t: { es: 'Aislar también FILESERVER01 y bloquear la salida DNS a resolvedores externos', en: 'Also isolate FILESERVER01 and block outbound DNS to external resolvers' },
          f: { es: 'Cierras el segundo punto de apoyo y el canal de fuga a la vez. Contención por capas.', en: 'You close the second foothold and the leak channel at once. Layered containment.' },
          risk: 'low', xp: 45, fx: { control: 25, visibilidad: 5 } },
        { t: { es: 'Apagar toda la red de la empresa', en: 'Shut down the whole company network' },
          f: { es: 'Detiene al atacante, pero también a 500 empleados y a los clientes. Desproporcionado si puedes aislar los equipos concretos.', en: 'It stops the attacker, but also 500 employees and the customers. Disproportionate when you can isolate the specific hosts.' },
          risk: 'med', xp: 15, fx: { control: 5, visibilidad: -20 } },
        { t: { es: 'Restablecer la contraseña de Administrator y esperar', en: 'Reset the Administrator password and wait' },
          f: { es: 'No sirve contra un Golden Ticket: los tickets se firman con krbtgt, no con la contraseña de Administrator.', en: 'Useless against a Golden Ticket: tickets are signed with krbtgt, not the Administrator password.' },
          risk: 'high', xp: 5, fx: { control: -25 } },
        { t: { es: 'Pedir a TI que reinicie los servidores afectados', en: 'Ask IT to reboot the affected servers' },
          f: { es: 'Pierdes la memoria volátil y el atacante vuelve a entrar con sus tickets en cuanto arrancan.', en: 'You lose volatile memory and the attacker comes back in with their tickets as soon as they boot.' },
          risk: 'high', xp: 0, fx: { control: -20, evidencias: -20 } }
      ]
    },
    {
      phase: { es: 'ERRADICACIÓN', en: 'ERADICATION' },
      title: { es: 'SACAR AL INTRUSO DE VERDAD', en: 'GETTING THE INTRUDER OUT FOR REAL' },
      body: {
        es: `El barrido del EDR encuentra <span class="highlight">svchost32.exe</span> (un implante con nombre que imita un proceso legítimo) en tres equipos, con persistencia en claves Run y tareas programadas. Toca erradicar sin dejar ninguna puerta abierta.`,
        en: `The EDR sweep finds <span class="highlight">svchost32.exe</span> (an implant named to mimic a legitimate process) on three hosts, persisting via Run keys and scheduled tasks. Time to eradicate without leaving any door open.`
      },
      term: R`
# ⟪Barrido EDR — indicadores en toda la flota|EDR sweep — indicators across the fleet⟫
Host            ⟪Indicador|Indicator⟫
JGARCIA-PC      C:\Windows\Temp\svchost32.exe  +  HKCU\...\Run
FILESERVER01    C:\Windows\Temp\svchost32.exe  +  ⟪Tarea programada|Scheduled task⟫ "UpdateCheck"
SQL01           C:\ProgramData\svchost32.exe
⟪Cuentas comprometidas: jgarcia, Administrator, svc_backup, krbtgt|Compromised accounts: jgarcia, Administrator, svc_backup, krbtgt⟫`,
      choices: [
        { t: { es: 'Restablecer krbtgt dos veces (respetando la replicación) y todas las cuentas privilegiadas', en: 'Reset krbtgt twice (allowing replication) plus every privileged account' },
          f: { es: 'Es la única forma de invalidar los Golden Tickets: el segundo cambio elimina también el hash anterior que AD aún acepta. Junto con reinstalar los tres equipos, el atacante queda fuera.', en: 'The only way to invalidate Golden Tickets: the second reset also removes the previous hash AD still accepts. Together with rebuilding the three hosts, the attacker is out.' },
          risk: 'low', xp: 50, fx: { control: 30 } },
        { t: { es: 'Reinstalar los tres equipos desde la imagen corporativa', en: 'Rebuild the three hosts from the corporate image' },
          f: { es: 'Elimina el malware con garantías, pero si no cambias krbtgt el atacante puede volver a entrar con sus tickets.', en: 'It removes the malware reliably, but without a krbtgt reset the attacker can walk back in with their tickets.' },
          risk: 'med', xp: 30, fx: { control: 10 } },
        { t: { es: 'Borrar svchost32.exe a mano y dar el caso por cerrado', en: 'Delete svchost32.exe by hand and close the case' },
          f: { es: 'La tarea programada lo vuelve a descargar esa misma noche. Erradicar no es borrar un fichero.', en: 'The scheduled task downloads it again that same night. Eradication is not deleting a file.' },
          risk: 'high', xp: 5, fx: { control: -25 } },
        { t: { es: 'Restaurar el DC desde la copia de ayer', en: 'Restore the DC from yesterday\'s backup' },
          f: { es: 'La intrusión empezó hace días: la copia de ayer ya contiene los cambios del atacante en IT_Admins.', en: 'The intrusion began days ago: yesterday\'s backup already contains the attacker\'s IT_Admins changes.' },
          risk: 'high', xp: 10, fx: { control: -20 } }
      ]
    },
    {
      phase: { es: 'RECUPERACIÓN', en: 'RECOVERY' },
      title: { es: 'VOLVER A LA NORMALIDAD SIN BAJAR LA GUARDIA', en: 'BACK TO NORMAL WITHOUT DROPPING YOUR GUARD' },
      body: {
        es: `Dirección presiona para recuperar todos los servicios hoy mismo. Tú sabes que los atacantes suelen intentar volver en las semanas siguientes.`,
        en: `Management is pushing to restore every service today. You know attackers often try to come back in the following weeks.`
      },
      term: R`
# ⟪Estado de recuperación|Recovery status⟫
⟪Servicios críticos:|Critical services:⟫  ⟪correo ✔  VPN ✘ (pendiente MFA)  ficheros ✔  SQL ✘|mail ✔  VPN ✘ (MFA pending)  files ✔  SQL ✘⟫
⟪Indicadores a vigilar: 203.0.113.47, *.exfil.attacker.example, svchost32.exe, tickets RC4|Indicators to watch: 203.0.113.47, *.exfil.attacker.example, svchost32.exe, RC4 tickets⟫`,
      choices: [
        { t: { es: 'Recuperación por fases con vigilancia reforzada de los indicadores 30 días', en: 'Phased recovery with heightened watch on the indicators for 30 days' },
          f: { es: 'Cada servicio vuelve solo cuando está verificado y el SIEM tiene reglas para los indicadores del ataque. Si el atacante vuelve, lo verás.', en: 'Each service returns only once verified, and the SIEM has rules for the attack indicators. If the attacker returns, you will see it.' },
          risk: 'low', xp: 45, fx: { control: 20, visibilidad: 20 } },
        { t: { es: 'Reabrir la VPN solo cuando tenga MFA obligatorio', en: 'Reopen the VPN only once MFA is mandatory' },
          f: { es: 'Cierras el vector de entrada original. Muy buena decisión, aunque es solo una parte de la recuperación.', en: 'You close the original entry vector. Very good call, though it is only part of the recovery.' },
          risk: 'low', xp: 35, fx: { control: 15 } },
        { t: { es: 'Restaurarlo todo a la vez para acabar cuanto antes', en: 'Restore everything at once to finish sooner' },
          f: { es: 'SQL01 vuelve sin verificar y con el implante en ProgramData. El atacante recupera el acceso en 48 horas.', en: 'SQL01 comes back unverified, still carrying the implant in ProgramData. The attacker regains access within 48 hours.' },
          risk: 'high', xp: 5, fx: { control: -30 } },
        { t: { es: 'Retirar las reglas de alerta temporales para reducir ruido', en: 'Remove the temporary alert rules to cut the noise' },
          f: { es: 'Justo cuando más falta hacen: te quedas ciego ante un posible regreso del atacante.', en: 'Right when you need them most: you go blind to a possible return of the attacker.' },
          risk: 'high', xp: 0, fx: { control: -20, visibilidad: -25 } }
      ]
    }
  ]
});
