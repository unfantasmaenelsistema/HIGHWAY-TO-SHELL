ROLES.push({
  id: 'usuario',
  icon: '👤',
  color: '#ffd700',
  difficulty: 'easy',
  name: { es: 'USUARIO (J. GARCÍA)', en: 'END USER (J. GARCÍA)' },
  desc: {
    es: 'Trabajas en Finanzas de CorpTarget y no eres técnico. Para el atacante eres la puerta de entrada más fácil. Tus decisiones pueden proteger o comprometer a toda la empresa.',
    en: 'You work in Finance at CorpTarget and you are not technical. To the attacker you are the easiest way in. Your decisions can protect or compromise the whole company.'
  },
  stats: [
    { key: 'conciencia', label: { es: 'CONCIENCIA', en: 'AWARENESS' }, start: 50, main: true },
    { key: 'cuenta', label: { es: 'CUENTA SEGURA', en: 'ACCOUNT SAFETY' }, start: 70 },
    { key: 'reputacion', label: { es: 'REPUTACIÓN', en: 'REPUTATION' }, start: 80 }
  ],
  tools: [
    { es: 'Correo corporativo', en: 'Corporate email' },
    { es: 'Microsoft Authenticator', en: 'Microsoft Authenticator' },
    { es: 'Portátil con Windows 11', en: 'Windows 11 laptop' },
    { es: 'Teléfono de soporte IT (ext. 4000)', en: 'IT helpdesk phone (ext. 4000)' }
  ],
  scenarios: [
    {
      phase: { es: 'PHISHING RECIBIDO', en: 'PHISHING RECEIVED' },
      title: { es: 'CORREO URGENTE DE "IT"', en: 'URGENT EMAIL FROM "IT"' },
      body: {
        es: `Lunes, <span class="highlight">08:15</span>. Recibes este correo:<br><br>
<em>«Se ha detectado actividad sospechosa en su cuenta. Verifique su identidad en las próximas 2 horas o su cuenta será suspendida. Acceda al Portal Seguro.»</em><br><br>
El remitente parece ser <span class="highlight">it.support@c0rptarget.com</span>.`,
        en: `Monday, <span class="highlight">08:15</span>. You receive this email:<br><br>
<em>"Suspicious activity has been detected on your account. Verify your identity within 2 hours or your account will be suspended. Go to the Secure Portal."</em><br><br>
The sender appears to be <span class="highlight">it.support@c0rptarget.com</span>.`
      },
      term: R`
# ⟪Cabeceras del correo (Ver origen del mensaje)|Email headers (View message source)⟫
From: IT Support <it.support@c0rptarget.com>
To: jgarcia@corptarget.com
Subject: URGENTE: ⟪Verificación de cuenta requerida|Account verification required⟫
Authentication-Results: spf=fail smtp.mailfrom=c0rptarget.com; dkim=none; dmarc=fail
⟪Enlace "Portal Seguro"|"Secure Portal" link⟫ -> https://corptarget-secure.verify-account.example/login
! ⟪c0rptarget (con un cero) no es corptarget|c0rptarget (with a zero) is not corptarget⟫`,
      choices: [
        { t: { es: 'Usar el botón "Reportar phishing" sin hacer clic en nada', en: 'Use the "Report phishing" button without clicking anything' },
          f: { es: 'Perfecto. Seguridad recibe el correo, bloquea el dominio y lo borra del buzón de toda la plantilla en minutos.', en: 'Perfect. Security gets the email, blocks the domain and purges it from every mailbox within minutes.' },
          risk: 'low', xp: 45, fx: { conciencia: 30, reputacion: 10 } },
        { t: { es: 'Llamar a IT al número de siempre para preguntar', en: 'Call IT on the usual number to check' },
          f: { es: 'Muy bien: verificas por un canal que ya conoces, no por el que te da el correo. IT confirma que es phishing.', en: 'Very good: you verify through a channel you already know, not one the email gives you. IT confirms it is phishing.' },
          risk: 'low', xp: 35, fx: { conciencia: 20 } },
        { t: { es: 'Entrar en el "Portal Seguro" para no perder la cuenta', en: 'Open the "Secure Portal" so you do not lose your account' },
          f: { es: 'Has caído: introduces usuario y contraseña en una web falsa y el atacante los recibe al instante. La urgencia era el anzuelo.', en: 'You fell for it: you type your username and password into a fake site and the attacker gets them instantly. The urgency was the bait.' },
          risk: 'high', xp: 0, fx: { conciencia: -30, cuenta: -40 } },
        { t: { es: 'Reenviarlo a tus compañeros "por si les llega también"', en: 'Forward it to colleagues "in case they get it too"' },
          f: { es: 'Con buena intención, pero propagas el phishing: tres compañeros pinchan el enlace desde tu reenvío.', en: 'Well meant, but you spread the phishing: three colleagues click the link from your forward.' },
          risk: 'high', xp: 5, fx: { conciencia: -20, reputacion: -15 } }
      ]
    },
    {
      phase: { es: 'INGENIERÍA SOCIAL', en: 'SOCIAL ENGINEERING' },
      title: { es: 'LA LLAMADA DEL "TÉCNICO DE MICROSOFT"', en: 'THE "MICROSOFT TECHNICIAN" CALL' },
      body: {
        es: `Tres días después suena el teléfono: <span class="highlight">«Soy Juan, de Microsoft. Hemos detectado un virus en su equipo y necesito acceso remoto urgente para eliminarlo»</span>. Suena profesional y tiene prisa.`,
        en: `Three days later the phone rings: <span class="highlight">"This is Juan from Microsoft. We have detected a virus on your computer and I need urgent remote access to remove it."</span> He sounds professional and in a hurry.`
      },
      term: R`
# ⟪Vishing — lo que pide "Juan"|Vishing — what "Juan" asks for⟫
-> ⟪Instalar AnyDesk|Install AnyDesk⟫
-> ⟪Leerle el código de acceso de 9 dígitos|Read out the 9-digit access code⟫
-> ⟪"No lo comente con IT, es una auditoría confidencial"|"Do not mention this to IT, it is a confidential audit"⟫
! ⟪Microsoft no llama a los usuarios por iniciativa propia|Microsoft does not cold-call users⟫
! ⟪Pedir que no avises a IT es la señal de alarma más clara|Asking you not to tell IT is the clearest red flag⟫`,
      choices: [
        { t: { es: 'Colgar y avisar a IT de la llamada', en: 'Hang up and report the call to IT' },
          f: { es: 'Exacto. IT alerta a toda la plantilla y descubre que otras cinco personas han recibido la misma llamada.', en: 'Exactly. IT warns all staff and finds five other people got the same call.' },
          risk: 'low', xp: 45, fx: { conciencia: 30, reputacion: 10 } },
        { t: { es: 'Pedirle un número para devolverle la llamada', en: 'Ask for a number to call him back' },
          f: { es: 'Buen instinto: el estafador se pone nervioso y cuelga. Aun así, repórtalo para que IT pueda avisar a los demás.', en: 'Good instinct: the scammer gets nervous and hangs up. Still, report it so IT can warn others.' },
          risk: 'med', xp: 25, fx: { conciencia: 15 } },
        { t: { es: 'Instalar AnyDesk y darle el código', en: 'Install AnyDesk and give him the code' },
          f: { es: 'Le das control total de tu equipo: en tres minutos instala un keylogger y se lleva las contraseñas guardadas en el navegador.', en: 'You hand over full control of your computer: in three minutes he installs a keylogger and takes the passwords saved in the browser.' },
          risk: 'high', xp: 0, fx: { conciencia: -35, cuenta: -40 } },
        { t: { es: 'Contestar sus preguntas "básicas" (puesto, jefe, programas)', en: 'Answer his "basic" questions (role, manager, software)' },
          f: { es: 'Parece inofensivo, pero es justo la información que necesita para el siguiente engaño.', en: 'It seems harmless, but it is exactly the information he needs for the next scam.' },
          risk: 'high', xp: 10, fx: { conciencia: -20 } }
      ]
    },
    {
      phase: { es: 'COMPROMISO', en: 'COMPROMISE' },
      title: { es: 'UN USB EN EL APARCAMIENTO', en: 'A USB STICK IN THE CAR PARK' },
      body: {
        es: `Encuentras un USB en el aparcamiento con una etiqueta: <span class="highlight">«NÓMINAS CONFIDENCIALES 2025»</span>. Te pica la curiosidad y tu portátil está encendido delante de ti.`,
        en: `You find a USB stick in the car park labelled <span class="highlight">"CONFIDENTIAL PAYROLL 2025"</span>. You are curious and your laptop is on right in front of you.`
      },
      term: R`
# ⟪Lo que habría dentro del USB|What the USB stick would contain⟫
NOMINAS_2025.pdf.exe     ⟪← un .exe disfrazado: Windows oculta la extensión real|← a disguised .exe: Windows hides the real extension⟫
organigrama_RRHH.xlsx
bonus_directivos.pdf
# ⟪Dato real: en un estudio de la Universidad de Illinois (2016) se dejaron 297 USB|Real data: a University of Illinois study (2016) dropped 297 USB sticks⟫
# ⟪por un campus; se recogió el 98 % y en al menos el 45 % alguien abrió archivos|across a campus; 98% were picked up and in at least 45% someone opened files⟫`,
      choices: [
        { t: { es: 'Entregarlo a IT sin conectarlo', en: 'Hand it to IT without plugging it in' },
          f: { es: 'Perfecto. IT lo analiza en un equipo aislado: es un troyano. Gracias a ti saben que alguien está atacando la empresa físicamente.', en: 'Perfect. IT analyses it on an isolated machine: it is a trojan. Thanks to you they know someone is targeting the company physically.' },
          risk: 'low', xp: 50, fx: { conciencia: 30, reputacion: 10 } },
        { t: { es: 'Tirarlo a la basura sin decir nada', en: 'Throw it away without saying anything' },
          f: { es: 'Mejor que usarlo, pero IT no se entera de que hay un ataque en marcha y otro compañero puede encontrar el siguiente.', en: 'Better than using it, but IT never learns there is an attack under way and a colleague may find the next one.' },
          risk: 'med', xp: 15, fx: { conciencia: 5 } },
        { t: { es: 'Conectarlo y abrir las nóminas', en: 'Plug it in and open the payroll file' },
          f: { es: 'Al abrir el falso PDF se ejecuta el troyano: puerta trasera, keylogger y persistencia en tu equipo en segundos.', en: 'Opening the fake PDF runs the trojan: backdoor, keylogger and persistence on your machine within seconds.' },
          risk: 'high', xp: 0, fx: { conciencia: -40, cuenta: -40 } },
        { t: { es: 'Mirarlo en casa, en tu ordenador personal', en: 'Check it at home on your personal computer' },
          f: { es: 'Igual de grave: si teletrabajas desde esa red o ese equipo, el atacante llega a la empresa por la puerta de atrás.', en: 'Just as bad: if you work from home on that network or device, the attacker reaches the company through the back door.' },
          risk: 'high', xp: 5, fx: { conciencia: -30, cuenta: -20 } }
      ]
    },
    {
      phase: { es: 'ESCALADA', en: 'ESCALATION' },
      title: { es: 'BOMBARDEO DE NOTIFICACIONES MFA', en: 'MFA PUSH BOMBING' },
      body: {
        es: `Lunes, <span class="highlight">03:10 de la madrugada</span>. Tu móvil no para de vibrar: Microsoft Authenticator te pide aprobar un inicio de sesión una y otra vez. Después llega un WhatsApp: <span class="highlight">«Somos IT, estamos resincronizando cuentas. Acepta la notificación para que pare»</span>.<br><br>
Alguien tiene tu contraseña y solo le falta tu segundo factor.`,
        en: `Monday, <span class="highlight">03:10 a.m.</span> Your phone keeps buzzing: Microsoft Authenticator asks you to approve a sign-in again and again. Then a WhatsApp arrives: <span class="highlight">"This is IT, we are resyncing accounts. Approve the prompt to make it stop."</span><br><br>
Someone has your password and only needs your second factor.`
      },
      term: R`
# ⟪Registro de inicios de sesión de tu cuenta (lo que IT verá después)|Your account sign-in log (what IT will see later)⟫
03:08  jgarcia@corptarget.com  203.0.113.47  ⟪MFA denegado / sin respuesta|MFA denied / no response⟫
03:09  jgarcia@corptarget.com  203.0.113.47  ⟪MFA denegado / sin respuesta|MFA denied / no response⟫
...    (x14)
! ⟪Técnica real de grupos como Lapsus$ (Uber, 2022): cansar a la víctima hasta que acepta|A real technique used by groups like Lapsus$ (Uber, 2022): wear the victim down until they approve⟫`,
      choices: [
        { t: { es: 'Rechazar todas, avisar a IT por el canal oficial y cambiar la contraseña', en: 'Deny them all, alert IT through the official channel and change your password' },
          f: { es: 'Así se hace. Tu aviso de madrugada es la pista que confirma al SOC que la cuenta jgarcia está comprometida.', en: 'That is how it is done. Your early-morning report is the clue that confirms to the SOC that the jgarcia account is compromised.' },
          risk: 'low', xp: 50, fx: { conciencia: 30, cuenta: 30 } },
        { t: { es: 'Aprobar una para que deje de sonar', en: 'Approve one so it stops buzzing' },
          f: { es: 'Le acabas de dar al atacante tu segundo factor: entra en tu correo y en Teams como si fueras tú.', en: 'You just gave the attacker your second factor: they get into your email and Teams as you.' },
          risk: 'high', xp: 0, fx: { conciencia: -35, cuenta: -50 } },
        { t: { es: 'Apagar el móvil y seguir durmiendo', en: 'Switch your phone off and go back to sleep' },
          f: { es: 'No apruebas nada, bien, pero nadie se entera de que tu contraseña está en manos de un atacante.', en: 'You approve nothing, good, but nobody learns your password is in an attacker\'s hands.' },
          risk: 'med', xp: 15, fx: { conciencia: -5 } },
        { t: { es: 'Contestar al WhatsApp para preguntar si es real', en: 'Reply to the WhatsApp to ask if it is real' },
          f: { es: 'El atacante te responde con total seguridad y te presiona más. Nunca verifiques por el canal que te ha contactado.', en: 'The attacker answers confidently and pressures you more. Never verify through the channel that contacted you.' },
          risk: 'high', xp: 5, fx: { conciencia: -20 } }
      ]
    },
    {
      phase: { es: 'DESCUBRIMIENTO', en: 'DISCOVERY' },
      title: { es: 'UNA REGLA QUE TÚ NO CREASTE', en: 'A RULE YOU NEVER CREATED' },
      body: {
        es: `Por la mañana notas cosas raras: un proveedor dice que le pediste cambiar la cuenta bancaria de una factura y tú no has escrito nada. En Outlook hay una regla que no reconoces.`,
        en: `In the morning you notice odd things: a supplier says you asked them to change the bank account on an invoice, and you never wrote anything. Outlook has a rule you do not recognise.`
      },
      term: R`
# ⟪Lo que IT encuentra en tu buzón|What IT finds in your mailbox⟫
$ PS C:\> :: Get-InboxRule -Mailbox jgarcia | Format-List Name,ForwardTo,DeleteMessage,MarkAsRead
Name          : .
ForwardTo     : "billing.update@mailbox.example"
DeleteMessage : True
MarkAsRead    : True
! ⟪Regla oculta (nombre "."): reenvía tu correo fuera y borra el rastro. Fraude BEC|Hidden rule (named "."): forwards your mail out and wipes the trail. BEC fraud⟫`,
      choices: [
        { t: { es: 'Avisar a IT y al proveedor, y desconectar la red sin apagar el portátil', en: 'Tell IT and the supplier, and disconnect from the network without powering off' },
          f: { es: 'Detienes el fraude antes del pago y conservas las evidencias en el equipo encendido. IT te lo agradece.', en: 'You stop the fraud before payment and keep the evidence on the running machine. IT thanks you.' },
          risk: 'low', xp: 50, fx: { conciencia: 25, cuenta: 20, reputacion: 10 } },
        { t: { es: 'Apagar el portátil para cortar el ataque', en: 'Shut down the laptop to stop the attack' },
          f: { es: 'Bienintencionado, pero el ataque está en tu cuenta en la nube, no solo en el portátil, y al apagarlo se pierden evidencias de la memoria.', en: 'Well meant, but the attack lives in your cloud account, not just the laptop, and powering off loses evidence in memory.' },
          risk: 'med', xp: 20, fx: { conciencia: 5 } },
        { t: { es: 'Borrar la regla tú y no comentarlo', en: 'Delete the rule yourself and say nothing' },
          f: { es: 'El atacante sigue teniendo acceso y vuelve a crearla. El proveedor paga 48.000 € a la cuenta falsa.', en: 'The attacker still has access and recreates it. The supplier pays €48,000 into the fake account.' },
          risk: 'high', xp: 5, fx: { conciencia: -30, reputacion: -20 } },
        { t: { es: 'Seguir trabajando: es cierre de mes', en: 'Keep working: it is month-end close' },
          f: { es: 'El fraude sigue adelante y tu buzón sigue filtrando correos de Finanzas al atacante.', en: 'The fraud goes ahead and your mailbox keeps leaking Finance emails to the attacker.' },
          risk: 'high', xp: 0, fx: { conciencia: -35, cuenta: -20 } }
      ]
    },
    {
      phase: { es: 'RESPUESTA', en: 'RESPONSE' },
      title: { es: 'COLABORAR CON LA INVESTIGACIÓN', en: 'HELPING THE INVESTIGATION' },
      body: {
        es: `El equipo de respuesta te cita. Necesitan saber exactamente qué pasó en las últimas semanas: correos, llamadas, USB, notificaciones…<br><br>
Tienes miedo de que te culpen.`,
        en: `The response team calls you in. They need to know exactly what happened in recent weeks: emails, calls, USB sticks, prompts…<br><br>
You are afraid of being blamed.`
      },
      term: R`
# ⟪Formulario de incidente — preguntas del equipo de respuesta|Incident form — response team questions⟫
1. ⟪¿Has recibido correos o llamadas sospechosas?|Have you received suspicious emails or calls?⟫
2. ⟪¿Has introducido tu contraseña en alguna web desde un enlace?|Have you typed your password into a site reached from a link?⟫
3. ⟪¿Usas la misma contraseña en otros servicios?|Do you use the same password elsewhere?⟫
4. ⟪¿Has aprobado alguna notificación MFA que no esperabas?|Have you approved any MFA prompt you did not expect?⟫
# ⟪Una cultura sin culpa ("blameless") hace que la gente cuente los errores a tiempo|A blameless culture makes people report mistakes in time⟫`,
      choices: [
        { t: { es: 'Contarlo todo con detalle, incluidos tus errores', en: 'Tell them everything in detail, including your mistakes' },
          f: { es: 'Tu relato aporta fechas y horas que completan la cronología. La empresa valora tu sinceridad y te propone como ejemplo en la formación.', en: 'Your account supplies dates and times that complete the timeline. The company values your honesty and uses you as an example in training.' },
          risk: 'low', xp: 50, fx: { conciencia: 25, reputacion: 20 } },
        { t: { es: 'Cambiar la contraseña en todos los sitios donde la repetías y activar MFA', en: 'Change the password everywhere you reused it and enable MFA' },
          f: { es: 'Muy bien: cortas el efecto dominó de la reutilización. Aun así, la investigación necesita también tu testimonio.', en: 'Very good: you stop the reuse domino effect. Still, the investigation also needs your testimony.' },
          risk: 'low', xp: 35, fx: { cuenta: 30 } },
        { t: { es: 'Ocultar lo que hiciste por miedo a represalias', en: 'Hide what you did for fear of reprisals' },
          f: { es: 'La investigación pierde días buscando el vector de entrada, y cuando aparece en los registros tu credibilidad queda tocada.', en: 'The investigation loses days hunting for the entry vector, and when it shows up in the logs your credibility takes a hit.' },
          risk: 'high', xp: 5, fx: { conciencia: -25, reputacion: -30 } },
        { t: { es: 'Contar el incidente en redes sociales', en: 'Post about the incident on social media' },
          f: { es: 'Filtras información de un incidente en curso: ayuda al atacante y crea un problema legal y de reputación a la empresa.', en: 'You leak information about an ongoing incident: it helps the attacker and creates a legal and reputational problem for the company.' },
          risk: 'high', xp: 0, fx: { conciencia: -30, reputacion: -30 } }
      ]
    }
  ]
});
