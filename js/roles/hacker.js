// Rol Red Team: narrativo a propósito. Las "terminales" son el cuaderno de operación
// (notas, alcance, hallazgos), sin comandos de explotación.
ROLES.push({
  id: 'hacker',
  icon: '💀',
  color: '#e94560',
  difficulty: 'expert',
  name: { es: 'HACKER ÉTICO (RED TEAM)', en: 'ETHICAL HACKER (RED TEAM)' },
  desc: {
    es: 'Ejercicio de red team autorizado contra CorpTarget S.A. Emulas a un adversario real dentro de unas reglas de enfrentamiento: demostrar el impacto sin causar daño y sin que el SOC te detecte.',
    en: 'Authorised red team engagement against CorpTarget S.A. You emulate a real adversary under rules of engagement: prove impact without causing harm and without the SOC detecting you.'
  },
  stats: [
    { key: 'sigilo', label: { es: 'SIGILO', en: 'STEALTH' }, start: 90, main: true },
    { key: 'acceso', label: { es: 'ACCESO', en: 'ACCESS' }, start: 0 },
    { key: 'pruebas', label: { es: 'PRUEBAS', en: 'PROOF' }, start: 0 }
  ],
  tools: [
    { es: 'Carta de autorización firmada', en: 'Signed authorisation letter' },
    { es: 'Reglas de enfrentamiento (RoE)', en: 'Rules of engagement (RoE)' },
    { es: 'Cuaderno de operación', en: 'Operation logbook' },
    { es: 'Contacto de emergencia del cliente', en: 'Client emergency contact' }
  ],
  scenarios: [
    {
      phase: { es: 'RECONOCIMIENTO', en: 'RECONNAISSANCE' },
      title: { es: 'OSINT: CONOCER AL OBJETIVO', en: 'OSINT: KNOW THE TARGET' },
      body: {
        es: `Objetivo: <span class="highlight">CorpTarget S.A.</span>, sector financiero, ~500 empleados. El alcance firmado cubre su perímetro público y la red interna; las personas solo pueden ser objetivo de phishing simulado si RRHH lo aprueba.<br><br>
Empiezas con inteligencia de fuentes abiertas. Mientras no toques sistemas del cliente, nadie puede detectarte.`,
        en: `Target: <span class="highlight">CorpTarget S.A.</span>, financial sector, ~500 employees. The signed scope covers its public perimeter and internal network; people may only be targeted by simulated phishing if HR approves it.<br><br>
You start with open-source intelligence. As long as you do not touch client systems, nobody can detect you.`
      },
      term: R`
# ⟪Cuaderno de operación — día 1|Operation logbook — day 1⟫
⟪Fuentes consultadas: web corporativa, LinkedIn, registros DNS públicos, certificados TLS publicados|Sources: corporate site, LinkedIn, public DNS records, published TLS certificates⟫
⟪Hallazgos:|Findings:⟫
  - ⟪Formato de correo: inicial.apellido@corptarget.com|Email format: initial.surname@corptarget.com⟫
  - ⟪47 empleados identificados, 6 de ellos en IT|47 employees identified, 6 of them in IT⟫
  - ⟪Subdominios: mail, vpn, www|Subdomains: mail, vpn, www⟫
  - ⟪Documentos publicados con metadatos (autor, versión de Office, rutas internas)|Published documents with metadata (author, Office version, internal paths)⟫
! ⟪Nota RoE: phishing a empleados NO aprobado todavía por RRHH|RoE note: employee phishing NOT yet approved by HR⟫`,
      choices: [
        { t: { es: 'Analizar los metadatos de los documentos publicados', en: 'Analyse the metadata of the published documents' },
          f: { es: 'Sin tocar ningún sistema obtienes nombres de usuario internos y el nombre del dominio de Active Directory. Reconocimiento pasivo de manual.', en: 'Without touching any system you get internal usernames and the Active Directory domain name. Textbook passive recon.' },
          risk: 'low', xp: 40, fx: { pruebas: 15 } },
        { t: { es: 'Mapear el perímetro: qué servicios expone cada subdominio', en: 'Map the perimeter: which services each subdomain exposes' },
          f: { es: 'Paso lógico, pero ya es reconocimiento activo: tu tráfico llega a los sistemas del cliente y puede quedar registrado.', en: 'A logical step, but it is now active recon: your traffic reaches client systems and may be logged.' },
          risk: 'med', xp: 25, fx: { sigilo: -10, acceso: 5 } },
        { t: { es: 'Enviar un phishing de prueba a los 6 técnicos de IT', en: 'Send a test phishing email to the 6 IT staff' },
          f: { es: 'Fuera de alcance: RRHH no lo ha aprobado. Además, el equipo de IT es el más entrenado para reportarlo. El cliente te para el ejercicio y te pide explicaciones.', en: 'Out of scope: HR has not approved it. And IT staff are the most likely to report it. The client halts the engagement and asks for an explanation.' },
          risk: 'high', xp: 0, fx: { sigilo: -40 } },
        { t: { es: 'Probar el portal VPN con contraseñas habituales', en: 'Try common passwords on the VPN portal' },
          f: { es: 'Precipitado y ruidoso: varios intentos fallidos bloquean cuentas reales y el SOC registra tu IP antes de saber nada del objetivo.', en: 'Rushed and noisy: several failed attempts lock real accounts and the SOC logs your IP before you know anything about the target.' },
          risk: 'high', xp: 5, fx: { sigilo: -30 } }
      ]
    },
    {
      phase: { es: 'ESCANEO', en: 'SCANNING' },
      title: { es: 'SUPERFICIE DE ATAQUE', en: 'ATTACK SURFACE' },
      body: {
        es: `Pasas al reconocimiento activo del perímetro. El servidor VPN (<span class="highlight">198.51.100.15</span>) anuncia una versión de <span class="highlight">Pulse Secure</span> afectada por una vulnerabilidad pública de 2019 (<span class="highlight">CVE-2019-11510</span>, CVSS 10), con parche disponible desde hace años.<br><br>
<span class="warn-txt">⚠ Cada paquete que envías puede aparecer en el SIEM del cliente.</span>`,
        en: `You move to active recon of the perimeter. The VPN server (<span class="highlight">198.51.100.15</span>) advertises a <span class="highlight">Pulse Secure</span> version affected by a public 2019 vulnerability (<span class="highlight">CVE-2019-11510</span>, CVSS 10), patched years ago.<br><br>
<span class="warn-txt">⚠ Every packet you send may show up in the client's SIEM.</span>`
      },
      term: R`
# ⟪Cuaderno de operación — día 2|Operation logbook — day 2⟫
⟪Servicios expuestos detectados en el perímetro:|Exposed services found on the perimeter:⟫
  443/tcp   ⟪VPN SSL — Pulse Secure 9.0R1 (sin parchear)|SSL VPN — Pulse Secure 9.0R1 (unpatched)⟫
  3389/tcp  ⟪Escritorio remoto expuesto a Internet|Remote Desktop exposed to the Internet⟫
  1433/tcp  ⟪SQL Server expuesto a Internet|SQL Server exposed to the Internet⟫
! ⟪CRÍTICO: CVE-2019-11510 — lectura de ficheros sin autenticar (aviso CISA AA20-010A)|CRITICAL: CVE-2019-11510 — unauthenticated file read (CISA advisory AA20-010A)⟫
⟪Ya es un hallazgo de informe por sí solo|Already a report finding on its own⟫`,
      choices: [
        { t: { es: 'Escaneo lento y dirigido solo a los servicios relevantes', en: 'Slow, targeted scan of the relevant services only' },
          f: { es: 'Confirmas versiones con muy poco tráfico. El SOC lo ve como ruido de fondo de Internet.', en: 'You confirm versions with very little traffic. The SOC sees it as background Internet noise.' },
          risk: 'low', xp: 40, fx: { sigilo: -5, pruebas: 15 } },
        { t: { es: 'Escaneo completo de todos los puertos a máxima velocidad', en: 'Full scan of every port at top speed' },
          f: { es: 'Obtienes el mapa completo, pero el IDS lo marca como escaneo y tu IP queda en una lista de vigilancia.', en: 'You get the full map, but the IDS flags it as a scan and your IP lands on a watch list.' },
          risk: 'high', xp: 15, fx: { sigilo: -30, acceso: 5 } },
        { t: { es: 'Lanzar un escáner de vulnerabilidades automático contra todo', en: 'Run an automated vulnerability scanner against everything' },
          f: { es: 'Miles de peticiones en minutos. El SIEM dispara alertas y el SOC pasa a modo activo. Un adversario real nunca haría tanto ruido.', en: 'Thousands of requests in minutes. The SIEM fires alerts and the SOC goes on active watch. A real adversary would never be this loud.' },
          risk: 'high', xp: 5, fx: { sigilo: -40 } },
        { t: { es: 'Comprobar si hay credenciales del dominio en filtraciones públicas', en: 'Check public breach data for credentials from the domain' },
          f: { es: 'Encuentras tres correos corporativos en filtraciones antiguas. Útil para el informe y sin tocar al cliente, aunque las contraseñas están caducadas.', en: 'You find three corporate emails in old breaches. Useful for the report and zero contact with the client, though the passwords have expired.' },
          risk: 'low', xp: 30, fx: { pruebas: 10 } }
      ]
    },
    {
      phase: { es: 'EXPLOTACIÓN', en: 'EXPLOITATION' },
      title: { es: 'ACCESO INICIAL', en: 'INITIAL ACCESS' },
      body: {
        es: `Las RoE permiten explotar vulnerabilidades del perímetro para demostrar el impacto. Aprovechando la vulnerabilidad de la VPN obtienes una sesión válida de la usuaria <span class="highlight">jgarcia</span>, que no tiene MFA. Ya estás en la red interna <span class="highlight">10.10.10.0/24</span>.<br><br>
Tu siguiente paso marca si el SOC te ve o no.`,
        en: `The RoE allow exploiting perimeter vulnerabilities to prove impact. Using the VPN vulnerability you obtain a valid session for user <span class="highlight">jgarcia</span>, who has no MFA. You are now on the internal network <span class="highlight">10.10.10.0/24</span>.<br><br>
Your next step decides whether the SOC sees you.`
      },
      term: R`
# ⟪Cuaderno de operación — día 3, 03:04 UTC|Operation logbook — day 3, 03:04 UTC⟫
⟪Acceso VPN conseguido como jgarcia (sin MFA)|VPN access obtained as jgarcia (no MFA)⟫
⟪Red interna alcanzable: 10.10.10.0/24|Reachable internal network: 10.10.10.0/24⟫
⟪Hallazgo para informe: la VPN no exige segundo factor|Report finding: the VPN does not require a second factor⟫
! ⟪Recordatorio RoE: nada de denegación de servicio ni modificar datos de producción|RoE reminder: no denial of service, no changes to production data⟫`,
      choices: [
        { t: { es: 'Mapear Active Directory con consultas discretas desde la sesión', en: 'Map Active Directory with low-profile queries from the session' },
          f: { es: 'Descubres que jgarcia tiene permisos de escritura sobre un grupo de administradores de IT: una ruta corta a Domain Admin por mala configuración de permisos.', en: 'You find jgarcia has write permissions over an IT admin group: a short path to Domain Admin caused by misconfigured permissions.' },
          risk: 'low', xp: 45, fx: { sigilo: -5, acceso: 25, pruebas: 15 } },
        { t: { es: 'Probar la misma contraseña en el resto de servicios', en: 'Try the same password on every other service' },
          f: { es: 'Funciona en el correo web y en escritorio remoto, pero tantos inicios de sesión en minutos disparan una alerta de comportamiento anómalo.', en: 'It works on webmail and remote desktop, but so many logins in minutes trigger an anomalous-behaviour alert.' },
          risk: 'high', xp: 20, fx: { sigilo: -25, acceso: 15 } },
        { t: { es: 'Instalar persistencia antes de seguir avanzando', en: 'Install persistence before moving further' },
          f: { es: 'Válido en un ejercicio si las RoE lo permiten y lo documentas, pero crear servicios nuevos en un equipo con EDR es ruidoso.', en: 'Valid in an engagement if the RoE allow it and you document it, but creating new services on an EDR-protected host is noisy.' },
          risk: 'med', xp: 25, fx: { sigilo: -15, acceso: 10 } },
        { t: { es: 'Descargar ya los ficheros compartidos de RRHH "por si acaso"', en: 'Download the HR file shares now "just in case"' },
          f: { es: 'Sacas datos personales reales sin necesidad: vulneras las RoE y el RGPD. Un red team demuestra el acceso, no se lleva datos de empleados.', en: 'You pull real personal data for no reason: you breach the RoE and GDPR. A red team proves access; it does not take employee data.' },
          risk: 'high', xp: 0, fx: { sigilo: -30 } }
      ]
    },
    {
      phase: { es: 'POST-EXPLOTACIÓN', en: 'POST-EXPLOITATION' },
      title: { es: 'CONTROL DEL DOMINIO', en: 'DOMAIN CONTROL' },
      body: {
        es: `Siguiendo la ruta de permisos llegas a privilegios de <span class="highlight">Domain Admin</span>. El objetivo del ejercicio está casi cumplido: demostrar que un atacante externo puede controlar toda la red.<br><br>
<span class="danger-txt">El EDR está activo en los servidores. Lo que hagas ahora decide si el informe dice "no detectado" o "detectado en 20 minutos".</span>`,
        en: `Following the permission path you reach <span class="highlight">Domain Admin</span> privileges. The engagement goal is nearly met: proving an external attacker can control the whole network.<br><br>
<span class="danger-txt">EDR is active on the servers. What you do now decides whether the report says "undetected" or "detected in 20 minutes".</span>`
      },
      term: R`
# ⟪Cuaderno de operación — día 3, 03:20 UTC|Operation logbook — day 3, 03:20 UTC⟫
⟪Privilegios: Domain Admin (corptarget.local)|Privileges: Domain Admin (corptarget.local)⟫
⟪Causa raíz: jgarcia con permisos de escritura sobre el grupo IT_Admins|Root cause: jgarcia has write permission over the IT_Admins group⟫
⟪Objetivo pactado con el cliente: dejar una "bandera" en el servidor de ficheros de Finanzas|Goal agreed with the client: plant a "flag" on the Finance file server⟫
! ⟪El EDR registra cada proceso nuevo en los servidores|EDR logs every new process on the servers⟫`,
      choices: [
        { t: { es: 'Dejar la bandera acordada, capturarla como prueba y no tocar nada más', en: 'Plant the agreed flag, screenshot it as proof and touch nothing else' },
          f: { es: 'Objetivo demostrado con el mínimo impacto y casi sin huella. Exactamente lo que el cliente ha contratado.', en: 'Goal proven with minimal impact and almost no footprint. Exactly what the client paid for.' },
          risk: 'low', xp: 50, fx: { pruebas: 30 } },
        { t: { es: 'Esperar 48 horas antes de seguir para que bajen la guardia', en: 'Wait 48 hours before continuing so they lower their guard' },
          f: { es: 'Paciencia típica de un adversario avanzado. Útil para medir la detección, aunque alarga el ejercicio y la ventana pactada.', en: 'Typical patience of an advanced adversary. Useful to measure detection, though it stretches the engagement and the agreed window.' },
          risk: 'low', xp: 35, fx: { sigilo: 5, pruebas: 10 } },
        { t: { es: 'Volcar todas las credenciales del dominio "para el informe"', en: 'Dump every domain credential "for the report"' },
          f: { es: 'Demuestra el impacto, pero es de lo más vigilado por el EDR y te deja custodiando secretos que no necesitas. Alerta crítica en el SOC.', en: 'It proves impact, but it is among the most watched actions for EDR and leaves you holding secrets you do not need. Critical alert in the SOC.' },
          risk: 'high', xp: 20, fx: { sigilo: -35, pruebas: 15 } },
        { t: { es: 'Cifrar un servidor para demostrar que el ransomware sería posible', en: 'Encrypt a server to prove ransomware would be possible' },
          f: { es: 'Línea roja: un red team nunca daña producción. El cliente cancela el contrato y puede reclamarte daños. El impacto se demuestra en el informe, no se ejecuta.', en: 'Red line: a red team never harms production. The client cancels the contract and may claim damages. Impact is shown in the report, never carried out.' },
          risk: 'high', xp: 0, fx: { sigilo: -60 } }
      ]
    },
    {
      phase: { es: 'EXFILTRACIÓN', en: 'EXFILTRATION' },
      title: { es: 'DEMOSTRAR LA FUGA SIN FUGAR DATOS', en: 'PROVE THE LEAK WITHOUT LEAKING DATA' },
      body: {
        es: `El cliente quiere saber si su DLP detectaría una fuga. Las RoE lo dejan claro: <span class="highlight">solo se exfiltran datos señuelo</span> preparados por el propio cliente, nunca datos reales de clientes.<br><br>
Tienes que elegir el canal de salida.`,
        en: `The client wants to know whether their DLP would catch a leak. The RoE are clear: <span class="highlight">only decoy data</span> prepared by the client may be exfiltrated, never real customer data.<br><br>
You have to choose the exfiltration channel.`
      },
      term: R`
# ⟪Cuaderno de operación — día 4|Operation logbook — day 4⟫
⟪Datos señuelo entregados por el cliente: 500 registros ficticios con marcas de agua|Decoy data supplied by the client: 500 fictitious watermarked records⟫
⟪Controles a medir: DLP, proxy web, monitorización de DNS|Controls to measure: DLP, web proxy, DNS monitoring⟫
⟪Pregunta del cliente: ¿veríamos salir 1 GB de datos?|Client question: would we notice 1 GB leaving?⟫`,
      choices: [
        { t: { es: 'Sacar los datos señuelo poco a poco por un canal discreto y medir si alguien lo ve', en: 'Trickle the decoy data out over a discreet channel and measure who notices' },
          f: { es: 'Nadie lo detecta: hallazgo de gran valor. Recomiendas monitorizar el DNS de salida, que es justo lo que permitió la fuga sin alertas.', en: 'Nobody detects it: a high-value finding. You recommend monitoring outbound DNS, which is exactly what let the leak go unnoticed.' },
          risk: 'low', xp: 45, fx: { pruebas: 25 } },
        { t: { es: 'Subir los datos señuelo de golpe a un almacenamiento en la nube', en: 'Upload the decoy data in one go to cloud storage' },
          f: { es: 'El proxy detecta el volumen inusual a los pocos minutos. También es un resultado útil: el control funciona para fugas grandes.', en: 'The proxy spots the unusual volume within minutes. Still a useful result: the control works for large leaks.' },
          risk: 'med', xp: 30, fx: { sigilo: -20, pruebas: 15 } },
        { t: { es: 'Copiar la base de datos real de clientes porque "es más realista"', en: 'Copy the real customer database because "it is more realistic"' },
          f: { es: 'Gravísimo: sacas 50.000 registros personales reales. Es una brecha de datos aunque seas el red team, y el cliente tendría que notificarla a la AEPD.', en: 'Very serious: you take 50,000 real personal records. It is a data breach even though you are the red team, and the client would have to report it to the regulator.' },
          risk: 'high', xp: 0, fx: { sigilo: -40 } },
        { t: { es: 'No exfiltrar nada y limitarte a describir que sería posible', en: 'Exfiltrate nothing and just describe that it would be possible' },
          f: { es: 'Seguro, pero el cliente quería medir su DLP y se queda sin la prueba que pagó.', en: 'Safe, but the client wanted to test their DLP and is left without the proof they paid for.' },
          risk: 'med', xp: 15, fx: { pruebas: -5 } }
      ]
    },
    {
      phase: { es: 'COBERTURA Y CIERRE', en: 'COVER-UP AND CLOSE-OUT' },
      title: { es: 'SALIR SIN DEJAR PUERTAS ABIERTAS', en: 'LEAVE WITHOUT LEAVING DOORS OPEN' },
      body: {
        es: `El ejercicio termina. Un atacante real borraría sus huellas; un red team profesional hace lo contrario: <span class="highlight">retira todo lo que ha instalado y entrega un registro exacto</span> para que el SOC aprenda a detectarlo.<br><br>
¿Cómo cierras la operación?`,
        en: `The engagement is over. A real attacker would erase their tracks; a professional red team does the opposite: <span class="highlight">removes everything it installed and hands over an exact record</span> so the SOC can learn to detect it.<br><br>
How do you close the operation?`
      },
      term: R`
# ⟪Cuaderno de operación — cierre|Operation logbook — close-out⟫
⟪Artefactos que siguen en la red del cliente:|Artifacts still on the client network:⟫
  - ⟪Cuenta jgarcia añadida a IT_Admins|jgarcia account added to IT_Admins⟫
  - ⟪Fichero bandera en FILESERVER01|Flag file on FILESERVER01⟫
  - ⟪Un servicio de persistencia en JGARCIA-PC|One persistence service on JGARCIA-PC⟫
⟪Pendiente: informe técnico, resumen ejecutivo y reunión con el equipo azul|Pending: technical report, executive summary and debrief with the blue team⟫`,
      choices: [
        { t: { es: 'Retirar todos los artefactos y entregar la cronología exacta con indicadores', en: 'Remove every artifact and hand over an exact timeline with indicators' },
          f: { es: 'Cierre impecable. El SOC usa tu cronología para crear reglas de detección nuevas. Así es como un red team mejora la defensa.', en: 'Flawless close-out. The SOC uses your timeline to build new detection rules. This is how a red team improves defence.' },
          risk: 'low', xp: 50, fx: { pruebas: 30 } },
        { t: { es: 'Borrar los registros de eventos para no dejar rastro', en: 'Clear the event logs to leave no trace' },
          f: { es: 'Borrar el registro de Seguridad genera su propio evento (1102) y es una alerta clásica: el SOC te detecta justo al final. Y destruyes justo lo que el cliente necesita para aprender.', en: 'Clearing the Security log generates its own event (1102) and is a classic alert: the SOC catches you right at the end. And you destroy exactly what the client needs to learn from.' },
          risk: 'high', xp: 5, fx: { sigilo: -40 } },
        { t: { es: 'Dejar una puerta trasera "por si hay segunda fase"', en: 'Leave a backdoor "in case there is a phase two"' },
          f: { es: 'Inaceptable: dejas al cliente expuesto sin su permiso. Si un tercero la encuentra, la responsabilidad es tuya.', en: 'Unacceptable: you leave the client exposed without permission. If a third party finds it, you are liable.' },
          risk: 'high', xp: 0, fx: { sigilo: -30 } },
        { t: { es: 'Entregar solo el informe técnico y olvidar el resumen ejecutivo', en: 'Deliver only the technical report and skip the executive summary' },
          f: { es: 'El SOC lo entiende, pero la dirección no, y sin dirección no hay presupuesto para arreglar nada.', en: 'The SOC understands it, but management does not, and without management there is no budget to fix anything.' },
          risk: 'med', xp: 20, fx: { pruebas: 5 } }
      ]
    }
  ]
});
