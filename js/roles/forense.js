ROLES.push({
  id: 'forense',
  icon: '🔍',
  color: '#e67e22',
  difficulty: 'expert',
  name: { es: 'ANALISTA FORENSE', en: 'FORENSIC ANALYST' },
  desc: {
    es: 'Investigador digital. Reconstruyes el ataque con método: qué pasó, cuándo, cómo y con qué alcance. Si pierdes el rigor, tus conclusiones no valdrán ante un juez.',
    en: 'Digital investigator. You reconstruct the attack methodically: what happened, when, how and how far. Lose your rigour and your findings will not stand up in court.'
  },
  stats: [
    { key: 'rigor', label: { es: 'RIGOR', en: 'RIGOUR' }, start: 70, main: true },
    { key: 'evidencias', label: { es: 'EVIDENCIAS', en: 'EVIDENCE' }, start: 0 },
    { key: 'timeline', label: { es: 'CRONOLOGÍA', en: 'TIMELINE' }, start: 0 }
  ],
  tools: ['FTK Imager', 'Volatility 3', 'Plaso (log2timeline)', 'YARA', { es: 'Bloqueador de escritura', en: 'Write blocker' }],
  scenarios: [
    {
      phase: { es: 'PRESERVACIÓN', en: 'PRESERVATION' },
      title: { es: 'LA ESCENA DEL CRIMEN DIGITAL', en: 'THE DIGITAL CRIME SCENE' },
      body: {
        es: `Llegas a CorpTarget. Los equipos comprometidos están aislados en la VLAN de cuarentena pero siguen encendidos. Antes de analizar nada hay que preservar.<br><br>
<span class="highlight">Regla n.º 1:</span> nunca se trabaja sobre el original.`,
        en: `You arrive at CorpTarget. The compromised hosts are isolated in the quarantine VLAN but still powered on. Before analysing anything you must preserve.<br><br>
<span class="highlight">Rule #1:</span> never work on the original.`
      },
      term: R`
# ⟪Inventario de evidencias — INC-2025-0847|Evidence inventory — INC-2025-0847⟫
EV-01  JGARCIA-PC     ⟪portátil encendido, aislado|laptop powered on, isolated⟫
EV-02  FILESERVER01   ⟪servidor encendido, aislado|server powered on, isolated⟫
EV-03  CORPDC01       ⟪en producción (no se puede apagar)|in production (cannot be shut down)⟫
EV-04  JGARCIA-PC_mem.raw  ⟪volcado de RAM hecho por sistemas, con hash SHA-256|RAM dump made by IT, with SHA-256 hash⟫
# ⟪RFC 3227: recoger de lo más volátil a lo menos volátil|RFC 3227: collect from most to least volatile⟫`,
      choices: [
        { t: { es: 'Fotografiar y documentar cada equipo y abrir la cadena de custodia', en: 'Photograph and document every host and open the chain of custody' },
          f: { es: 'Cada evidencia tiene ficha: quién, cuándo, dónde y en qué estado. Sin esto, todo lo demás es discutible.', en: 'Every item gets a record: who, when, where and in what state. Without this, everything else is disputable.' },
          risk: 'low', xp: 45, fx: { rigor: 20, evidencias: 15 } },
        { t: { es: 'Verificar el hash del volcado de RAM que hizo el técnico', en: 'Verify the hash of the RAM dump made by the sysadmin' },
          f: { es: 'Bien: compruebas que la evidencia que recibes es la misma que se adquirió. Pero falta documentar el resto de la escena.', en: 'Good: you check the evidence you receive matches what was acquired. But the rest of the scene still needs documenting.' },
          risk: 'low', xp: 30, fx: { rigor: 10, evidencias: 10 } },
        { t: { es: 'Apagar los equipos para "congelar" su estado', en: 'Power off the hosts to "freeze" their state' },
          f: { es: 'Al apagar pierdes lo más volátil que aún no se ha adquirido en FILESERVER01: memoria, conexiones y procesos.', en: 'Powering off loses the most volatile data not yet acquired on FILESERVER01: memory, connections and processes.' },
          risk: 'high', xp: 5, fx: { rigor: -25, evidencias: -10 } },
        { t: { es: 'Iniciar sesión en JGARCIA-PC para echar un vistazo rápido', en: 'Log in to JGARCIA-PC for a quick look around' },
          f: { es: 'Tu inicio de sesión genera eventos, modifica ficheros y contamina la evidencia original.', en: 'Your login creates events, modifies files and contaminates the original evidence.' },
          risk: 'high', xp: 0, fx: { rigor: -35 } }
      ]
    },
    {
      phase: { es: 'ADQUISICIÓN', en: 'ACQUISITION' },
      title: { es: 'IMAGEN FORENSE DEL DISCO', en: 'FORENSIC DISK IMAGE' },
      body: {
        es: `Toca adquirir el disco de <span class="highlight">JGARCIA-PC</span>. La imagen debe ser bit a bit, verificable y sin alterar el original.`,
        en: `Time to acquire the <span class="highlight">JGARCIA-PC</span> disk. The image must be bit-for-bit, verifiable and must not alter the original.`
      },
      term: R`
# ⟪Disco de JGARCIA-PC conectado mediante bloqueador de escritura|JGARCIA-PC disk attached via a write blocker⟫
$ C:\IR> :: ftkimager.exe \\.\PhysicalDrive2 E:\INC-2025-0847\JGARCIA-PC --e01 --frag 4G --compress 6 --verify
Creating image... 100%
Image verification:
  MD5    [computed] a3f8b2c1d4e5f6a7...   [stored] a3f8b2c1d4e5f6a7...   MATCH
  SHA1   [computed] 9c1e44b0aa71e2d3...   [stored] 9c1e44b0aa71e2d3...   MATCH`,
      choices: [
        { t: { es: 'Bloqueador de escritura, imagen E01 completa y verificación de hashes', en: 'Write blocker, full E01 image and hash verification' },
          f: { es: 'Procedimiento de manual: el original no se toca y los hashes demuestran que la copia es idéntica.', en: 'Textbook procedure: the original is untouched and the hashes prove the copy is identical.' },
          risk: 'low', xp: 50, fx: { rigor: 20, evidencias: 30 } },
        { t: { es: 'Hacer dos imágenes y trabajar siempre sobre la segunda', en: 'Make two images and always work on the second one' },
          f: { es: 'Buena práctica: una copia maestra intacta y otra de trabajo. Complementa al procedimiento completo.', en: 'Good practice: one pristine master copy and one working copy. It complements the full procedure.' },
          risk: 'low', xp: 35, fx: { rigor: 10, evidencias: 15 } },
        { t: { es: 'Copiar solo la carpeta C:\\Users para ir más rápido', en: 'Copy only the C:\\Users folder to save time' },
          f: { es: 'Pierdes el espacio no asignado, los ficheros borrados, el registro y los artefactos del sistema.', en: 'You lose unallocated space, deleted files, the registry and system artifacts.' },
          risk: 'med', xp: 10, fx: { rigor: -15, evidencias: 5 } },
        { t: { es: 'Conectar el disco sin bloqueador "solo para leer"', en: 'Attach the disk without a write blocker "just to read it"' },
          f: { es: 'Windows escribe en el disco al montarlo. La evidencia queda alterada y la defensa del atacante lo usará.', en: 'Windows writes to the disk when mounting it. The evidence is altered and the attacker\'s defence will use it.' },
          risk: 'high', xp: 0, fx: { rigor: -35 } }
      ]
    },
    {
      phase: { es: 'ANÁLISIS ESTÁTICO', en: 'STATIC ANALYSIS' },
      title: { es: 'UN SVCHOST QUE NO ES SVCHOST', en: 'A SVCHOST THAT IS NOT SVCHOST' },
      body: {
        es: `En la imagen aparece <span class="highlight">svchost32.exe</span> en <span class="highlight">C:\\Windows\\Temp\\</span>. El nombre imita a un proceso legítimo del sistema, que nunca vive en esa carpeta. Lo analizas sin ejecutarlo.`,
        en: `The image contains <span class="highlight">svchost32.exe</span> in <span class="highlight">C:\\Windows\\Temp\\</span>. The name mimics a legitimate system process, which never lives in that folder. You analyse it without running it.`
      },
      term: R`
# ⟪Análisis estático (máquina de análisis aislada)|Static analysis (isolated analysis machine)⟫
$ forense@lab:~$ :: file svchost32.exe
svchost32.exe: PE32+ executable (GUI) x86-64, for MS Windows
$ forense@lab:~$ :: sha256sum svchost32.exe
4b2c8f1a9d3e7b5c0e61f2a8c3d9b7e1...  svchost32.exe
$ forense@lab:~$ :: strings -n 8 svchost32.exe | grep -Ei 'http|Run|Alloc'
http://203.0.113.47/updates/check
Software\Microsoft\Windows\CurrentVersion\Run
VirtualAllocEx
$ forense@lab:~$ :: capa svchost32.exe
communicate via HTTP · persist via Run registry key · inject into remote process`,
      choices: [
        { t: { es: 'Buscar el hash en VirusTotal sin subir la muestra', en: 'Look up the hash on VirusTotal without uploading the sample' },
          f: { es: 'El hash aparece como Cobalt Strike Beacon. No subes la muestra porque las subidas son visibles para otros, incluido el atacante. Y no atribuyes a nadie: Cobalt Strike lo usan muchísimos grupos.', en: 'The hash comes back as Cobalt Strike Beacon. You do not upload the sample because uploads are visible to others, attacker included. And you attribute nothing: countless groups use Cobalt Strike.' },
          risk: 'low', xp: 45, fx: { rigor: 15, evidencias: 20 } },
        { t: { es: 'Escribir una regla YARA y buscar variantes en todas las imágenes', en: 'Write a YARA rule and hunt for variants across all images' },
          f: { es: 'Encuentras dos variantes más en FILESERVER01 y SQL01: el alcance es mayor de lo estimado.', en: 'You find two more variants on FILESERVER01 and SQL01: the scope is wider than estimated.' },
          risk: 'low', xp: 40, fx: { evidencias: 25 } },
        { t: { es: 'Subir la muestra a VirusTotal para tener un análisis completo', en: 'Upload the sample to VirusTotal for a full analysis' },
          f: { es: 'Funciona, pero la muestra queda accesible a terceros: el atacante puede ver que le han descubierto y cambiar de herramientas.', en: 'It works, but the sample becomes accessible to third parties: the attacker may see they are burned and switch tools.' },
          risk: 'med', xp: 20, fx: { rigor: -10, evidencias: 15 } },
        { t: { es: 'Afirmar en el chat de crisis que es un grupo estatal concreto', en: 'Claim in the crisis chat that it is a specific state-backed group' },
          f: { es: 'Atribuir con una sola herramienta común es especulación. Si te equivocas, condicionas toda la respuesta y tu credibilidad.', en: 'Attributing from a single common tool is speculation. If you are wrong, you skew the whole response and your credibility.' },
          risk: 'high', xp: 0, fx: { rigor: -30 } }
      ]
    },
    {
      phase: { es: 'ANÁLISIS DINÁMICO', en: 'DYNAMIC ANALYSIS' },
      title: { es: 'LO QUE SOLO ESTÁ EN MEMORIA', en: 'WHAT ONLY LIVES IN MEMORY' },
      body: {
        es: `El volcado de RAM de JGARCIA-PC guarda lo que el disco no muestra: procesos inyectados y conexiones activas. Además quieres ver el comportamiento del implante en ejecución.`,
        en: `The JGARCIA-PC RAM dump holds what the disk does not show: injected processes and live connections. You also want to see the implant's behaviour at runtime.`
      },
      term: R`
# ⟪Volatility 3 sobre el volcado de memoria|Volatility 3 on the memory dump⟫
$ forense@lab:~$ :: vol -f JGARCIA-PC_mem.raw windows.netscan | grep ESTABLISHED
TCPv4  10.10.10.44:50123  203.0.113.47:80   ESTABLISHED  4412  svchost32.exe
$ forense@lab:~$ :: vol -f JGARCIA-PC_mem.raw windows.malfind --pid 3120
PID   Process        Protection              Tag
3120  explorer.exe   PAGE_EXECUTE_READWRITE  VadS
4d 5a 90 00 03 00 00 00 ...   MZ...
! ⟪Cabecera MZ en memoria ejecutable y escribible de explorer.exe: código inyectado|MZ header in executable, writable memory of explorer.exe: injected code⟫`,
      choices: [
        { t: { es: 'Ejecutar la muestra en un sandbox aislado de cualquier red real', en: 'Run the sample in a sandbox isolated from any real network' },
          f: { es: 'Ves en directo sus llamadas al sistema, cambios en el registro y tráfico. Indicadores nuevos sin riesgo para nadie.', en: 'You watch its system calls, registry changes and traffic live. New indicators at no risk to anyone.' },
          risk: 'low', xp: 45, fx: { evidencias: 20, timeline: 10 } },
        { t: { es: 'Extraer la región inyectada y analizarla con YARA', en: 'Dump the injected region and scan it with YARA' },
          f: { es: 'Confirmas que el código inyectado en explorer.exe es el mismo beacon. Buena correlación entre memoria y disco.', en: 'You confirm the code injected into explorer.exe is the same beacon. Good memory-to-disk correlation.' },
          risk: 'low', xp: 35, fx: { evidencias: 20 } },
        { t: { es: 'Ejecutarlo en un sandbox conectado a la red corporativa', en: 'Run it in a sandbox connected to the corporate network' },
          f: { es: 'Un sandbox con salida a la red de la empresa no es un sandbox: el beacon contacta con el atacante y puede propagarse.', en: 'A sandbox with access to the company network is not a sandbox: the beacon calls the attacker and may spread.' },
          risk: 'high', xp: 5, fx: { rigor: -30 } },
        { t: { es: 'Ejecutarlo en el servidor original "para ver qué hace"', en: 'Run it on the original server "to see what it does"' },
          f: { es: 'Reinfectas producción y contaminas la evidencia. Nunca.', en: 'You reinfect production and contaminate the evidence. Never.' },
          risk: 'high', xp: 0, fx: { rigor: -45 } }
      ]
    },
    {
      phase: { es: 'TIMELINE', en: 'TIMELINE' },
      title: { es: '¿DESDE CUÁNDO ESTABAN DENTRO?', en: 'HOW LONG WERE THEY IN?' },
      body: {
        es: `Generas una supercronología con los artefactos del disco y la cruzas con los registros de la VPN. La detección fue el 17 de marzo a las 03:12. Pero ¿fue ese el primer día?`,
        en: `You build a super-timeline from the disk artifacts and cross it with the VPN logs. Detection was on 17 March at 03:12. But was that the first day?`
      },
      term: R`
# ⟪Supercronología con Plaso (todas las horas en UTC)|Super-timeline with Plaso (all times in UTC)⟫
$ forense@lab:~$ :: log2timeline.py --storage-file inc0847.plaso JGARCIA-PC.E01
$ forense@lab:~$ :: psort.py -o l2tcsv -w timeline.csv inc0847.plaso "date > '2025-03-01'"
2025-03-14 23:02  VPN      ⟪lectura anómala de ficheros del sistema desde 203.0.113.47|anomalous system file read from 203.0.113.47⟫
2025-03-14 23:10  VPN      ⟪inicio de sesión jgarcia desde 203.0.113.47 (4 min)|jgarcia login from 203.0.113.47 (4 min)⟫
2025-03-17 03:04  VPN      ⟪inicio de sesión jgarcia desde 203.0.113.47|jgarcia login from 203.0.113.47⟫
2025-03-17 03:16  EVTX     4728 IT_Admins ← jgarcia
2025-03-17 03:19  EVTX     4662 ⟪replicación de directorio (DCSync)|directory replication (DCSync)⟫
2025-03-17 03:41  $MFT     svchost32.exe ⟪creado|created⟫ (⟪¿fecha manipulada?|tampered timestamp?⟫ $SI ≠ $FN)`,
      choices: [
        { t: { es: 'Correlacionar VPN, eventos y sistema de ficheros para fijar el acceso inicial', en: 'Correlate VPN, events and file system to pin down initial access' },
          f: { es: 'El primer acceso fue el 14 de marzo: tres días antes de la detección. Ese dato cambia el alcance, las copias válidas y la notificación.', en: 'First access was on 14 March: three days before detection. That changes the scope, which backups are clean and the notification.' },
          risk: 'low', xp: 50, fx: { rigor: 15, timeline: 40 } },
        { t: { es: 'Normalizar todas las fuentes a UTC antes de comparar', en: 'Normalise every source to UTC before comparing' },
          f: { es: 'Imprescindible: mezclar hora local y UTC es uno de los errores más comunes en una cronología.', en: 'Essential: mixing local time and UTC is one of the most common timeline mistakes.' },
          risk: 'low', xp: 35, fx: { rigor: 10, timeline: 20 } },
        { t: { es: 'Tomar la hora de detección como inicio del ataque', en: 'Take the detection time as the start of the attack' },
          f: { es: 'Subestimas la permanencia del atacante y el alcance real. Las copias "limpias" de esos tres días no lo son.', en: 'You underestimate the attacker\'s dwell time and real scope. The "clean" backups from those three days are not.' },
          risk: 'high', xp: 5, fx: { rigor: -25, timeline: 5 } },
        { t: { es: 'Descartar las marcas de tiempo que no cuadran', en: 'Discard the timestamps that do not fit' },
          f: { es: 'Las que no cuadran suelen ser las más interesantes: aquí la diferencia entre $SI y $FN delata una fecha manipulada (timestomping).', en: 'The ones that do not fit are often the most interesting: here the $SI vs $FN gap reveals a tampered timestamp (timestomping).' },
          risk: 'high', xp: 10, fx: { rigor: -20 } }
      ]
    },
    {
      phase: { es: 'INFORME', en: 'REPORT' },
      title: { es: 'CONCLUSIONES QUE AGUANTEN UN JUICIO', en: 'FINDINGS THAT HOLD UP IN COURT' },
      body: {
        es: `Dirección, legal y la aseguradora esperan tu informe. Puede acabar en un juzgado o ante el regulador.`,
        en: `Management, legal and the insurer are waiting for your report. It may end up in court or before the regulator.`
      },
      term: R`
# ⟪Índice del informe pericial|Expert report outline⟫
1. ⟪Resumen ejecutivo (1 página, sin jerga)|Executive summary (1 page, no jargon)⟫
2. ⟪Alcance y metodología (herramientas, versiones, procedimientos)|Scope and methodology (tools, versions, procedures)⟫
3. ⟪Evidencias y cadena de custodia (hashes)|Evidence and chain of custody (hashes)⟫
4. ⟪Cronología del 14 al 17 de marzo|Timeline from 14 to 17 March⟫
5. ⟪Hechos probados vs. hipótesis|Proven facts vs. hypotheses⟫
6. ⟪Indicadores de compromiso y recomendaciones|Indicators of compromise and recommendations⟫`,
      choices: [
        { t: { es: 'Informe objetivo: hechos separados de hipótesis, metodología reproducible y hashes', en: 'Objective report: facts kept apart from hypotheses, reproducible methodology and hashes' },
          f: { es: 'Cualquier perito puede repetir tu análisis y llegar a lo mismo. Es lo que hace sólida una prueba.', en: 'Any other expert can repeat your analysis and reach the same result. That is what makes evidence solid.' },
          risk: 'low', xp: 50, fx: { rigor: 25 } },
        { t: { es: 'Informe solo técnico, sin resumen ejecutivo', en: 'Purely technical report with no executive summary' },
          f: { es: 'Técnicamente correcto, pero dirección y legal no pueden decidir con él.', en: 'Technically correct, but management and legal cannot make decisions from it.' },
          risk: 'med', xp: 20, fx: { rigor: 5 } },
        { t: { es: 'Atribuir el ataque a un país concreto sin pruebas', en: 'Attribute the attack to a specific country without evidence' },
          f: { es: 'Una afirmación sin evidencia invalida todo tu informe en cuanto la contraparte la cuestione.', en: 'An unsupported claim invalidates your whole report as soon as the other side challenges it.' },
          risk: 'high', xp: 0, fx: { rigor: -40 } },
        { t: { es: 'Suavizar los hallazgos para no incomodar a dirección', en: 'Soften the findings so management is not embarrassed' },
          f: { es: 'Un perito no es parte interesada. Si se demuestra que ocultaste hechos, tu informe y tu reputación profesional caen.', en: 'An expert is not a stakeholder. If you are shown to have hidden facts, your report and your professional reputation collapse.' },
          risk: 'high', xp: 5, fx: { rigor: -35 } }
      ]
    }
  ]
});
