ROLES.push({
  id: 'ciso',
  icon: '👔',
  color: '#9b59b6',
  difficulty: 'hard',
  name: { es: 'CISO', en: 'CISO' },
  desc: {
    es: 'Responsable de seguridad de CorpTarget. Gestionas la crisis, hablas con la junta, los reguladores y la prensa, y decides bajo presión con información incompleta.',
    en: 'CorpTarget\'s head of security. You manage the crisis, deal with the board, regulators and press, and decide under pressure with incomplete information.'
  },
  stats: [
    { key: 'confianza', label: { es: 'CONFIANZA', en: 'TRUST' }, start: 60, main: true },
    { key: 'cumplimiento', label: { es: 'CUMPLIMIENTO', en: 'COMPLIANCE' }, start: 50 },
    { key: 'presupuesto', label: { es: 'PRESUPUESTO', en: 'BUDGET' }, start: 60 }
  ],
  tools: [
    { es: 'Plan de respuesta a incidentes', en: 'Incident response plan' },
    { es: 'Panel de riesgos', en: 'Risk dashboard' },
    { es: 'Póliza de ciberseguro', en: 'Cyber insurance policy' },
    { es: 'Asesoría legal externa', en: 'External legal counsel' }
  ],
  scenarios: [
    {
      phase: { es: 'ALERTA INICIAL', en: 'INITIAL ALERT' },
      title: { es: 'LLAMADA A LAS 3:30 DE LA MADRUGADA', en: 'A 3:30 A.M. PHONE CALL' },
      body: {
        es: `El SOC te despierta: <span class="highlight">«Hay un atacante con credenciales de dominio dentro de la red. Puede tener privilegios de Domain Admin»</span>.<br><br>
CorpTarget es una entidad financiera y los datos de 50.000 clientes pueden estar en riesgo. Los relojes regulatorios empiezan a correr desde que tienes conocimiento.`,
        en: `The SOC wakes you up: <span class="highlight">"There is an attacker with domain credentials inside the network. They may have Domain Admin privileges."</span><br><br>
CorpTarget is a financial entity and the data of 50,000 customers may be at risk. Regulatory clocks start ticking from the moment you become aware.`
      },
      term: R`
# ⟪INC-2025-0847 — obligaciones de notificación|INC-2025-0847 — notification duties⟫
RGPD art. 33   ⟪Autoridad de protección de datos (AEPD): 72 h desde el conocimiento de la brecha|Data protection authority (AEPD): 72 h from awareness of the breach⟫
RGPD art. 34   ⟪Afectados: sin dilación indebida si hay alto riesgo para ellos|Data subjects: without undue delay if high risk to them⟫
DORA           ⟪Incidente TIC grave: notificación inicial en 4 h desde su clasificación|Major ICT incident: initial notification within 4 h of classification⟫
               ⟪(máx. 24 h desde que se conoce), intermedia en 72 h, final en 1 mes|(max. 24 h from awareness), intermediate in 72 h, final within 1 month⟫
               ⟪Autoridad: Banco de España, CNMV o DGSFP según la entidad|Authority: Banco de España, CNMV or DGSFP depending on the entity⟫
⟪Además: aseguradora, dirección, legal y comunicación|Also: insurer, management, legal and communications⟫`,
      choices: [
        { t: { es: 'Activar el plan de respuesta a incidentes y convocar al comité de crisis', en: 'Activate the incident response plan and convene the crisis committee' },
          f: { es: 'Desde el primer minuto, técnica, legal, comunicación y dirección trabajan coordinados y nadie pierde de vista los plazos.', en: 'From the first minute, technical, legal, comms and management work together and nobody loses track of the deadlines.' },
          risk: 'low', xp: 50, fx: { confianza: 25, cumplimiento: 20 } },
        { t: { es: 'Avisar a la aseguradora y a un equipo externo de respuesta', en: 'Notify the insurer and an external response team' },
          f: { es: 'Muy útil: muchas pólizas exigen aviso inmediato y cubren a los especialistas. Pero sin activar el plan interno, cada equipo va por libre.', en: 'Very useful: many policies require immediate notice and cover the specialists. But without the internal plan, every team goes its own way.' },
          risk: 'low', xp: 35, fx: { confianza: 10, presupuesto: 10 } },
        { t: { es: 'Esperar a la mañana para tener más datos', en: 'Wait until morning to have more data' },
          f: { es: 'Error estratégico: el atacante sigue dentro y los plazos regulatorios ya corren. Perder seis horas puede costar la notificación en tiempo.', en: 'Strategic mistake: the attacker is still in and regulatory clocks are running. Losing six hours can cost you a timely notification.' },
          risk: 'high', xp: 5, fx: { confianza: -25, cumplimiento: -20 } },
        { t: { es: 'Pedir al SOC que lo resuelva sin escalar para no alarmar', en: 'Ask the SOC to sort it out without escalating so as not to alarm anyone' },
          f: { es: 'Un compromiso de dominio en una entidad financiera no se gestiona en silencio. Si la junta se entera por otra vía, tu credibilidad desaparece.', en: 'A domain compromise at a financial entity is not handled quietly. If the board hears it elsewhere, your credibility is gone.' },
          risk: 'high', xp: 0, fx: { confianza: -35, cumplimiento: -15 } }
      ]
    },
    {
      phase: { es: 'EVALUACIÓN DE RIESGO', en: 'RISK ASSESSMENT' },
      title: { es: 'CUANTIFICAR EL IMPACTO ANTE LA JUNTA', en: 'QUANTIFYING THE IMPACT FOR THE BOARD' },
      body: {
        es: `A las 9:00 tienes reunión de urgencia con la junta. Datos del análisis:<br><br>
- 50.247 registros de clientes posiblemente exfiltrados<br>
- Documentación de I+D comprometida<br>
- Acceso al sistema financiero durante 6 horas`,
        en: `At 9:00 you have an emergency board meeting. Findings so far:<br><br>
- 50,247 customer records possibly exfiltrated<br>
- R&amp;D documentation compromised<br>
- Access to the finance system for 6 hours`
      },
      term: R`
# ⟪Estimación de impacto — INC-2025-0847|Impact estimate — INC-2025-0847⟫
⟪Costes directos|Direct costs⟫         ⟪respuesta 45 k€ · forense 30 k€ · legal 80 k€ · notificaciones 25 k€|response €45k · forensics €30k · legal €80k · notifications €25k⟫
⟪Costes indirectos|Indirect costs⟫       ⟪reputación 0,5–2 M€ · pérdida de clientes ~1,2 M€|reputation €0.5–2M · customer churn ~€1.2M⟫
⟪Sanción RGPD posible|Possible GDPR fine⟫   ⟪hasta 20 M€ o el 4 % de la facturación mundial|up to €20M or 4% of global turnover⟫
⟪Cobertura del ciberseguro|Cyber insurance cover⟫  1,5 M€
# ⟪Referencia: IBM Cost of a Data Breach 2024 — media mundial 4,88 M$; sector financiero 6,08 M$|Reference: IBM Cost of a Data Breach 2024 — global average $4.88M; financial sector $6.08M⟫`,
      choices: [
        { t: { es: 'Presentar el impacto completo con rangos e incertidumbre explícita', en: 'Present the full impact with ranges and explicit uncertainty' },
          f: { es: 'La junta agradece la franqueza: sabe qué es seguro y qué no. Aprueba recursos extra y te da su respaldo.', en: 'The board appreciates the candour: it knows what is certain and what is not. It approves extra resources and backs you.' },
          risk: 'low', xp: 50, fx: { confianza: 25, presupuesto: 20 } },
        { t: { es: 'Presentar el impacto y un plan de mejora con inversión', en: 'Present the impact plus an improvement plan with investment' },
          f: { es: 'Bien enfocado, pero pedir presupuesto con el incendio activo puede parecer oportunista. Mejor primero el impacto, después el plan.', en: 'Well framed, but asking for budget mid-fire can look opportunistic. Impact first, plan afterwards.' },
          risk: 'low', xp: 35, fx: { confianza: 10, presupuesto: 15 } },
        { t: { es: 'Minimizar las cifras para proteger tu puesto', en: 'Downplay the figures to protect your job' },
          f: { es: 'Cuando los datos aparezcan en un foro de filtraciones, la junta sabrá que la engañaste. Y responde ante el regulador con información falsa.', en: 'When the data shows up on a leak forum, the board will know you misled it. And it answers to the regulator with false information.' },
          risk: 'high', xp: 0, fx: { confianza: -40, cumplimiento: -15 } },
        { t: { es: 'Dar solo cifras técnicas (equipos, cuentas, GB)', en: 'Give technical figures only (hosts, accounts, GB)' },
          f: { es: 'La junta no puede decidir con "850 MB por DNS". Necesita impacto en negocio, clientes y regulación.', en: 'The board cannot decide based on "850 MB over DNS". It needs impact on business, customers and regulation.' },
          risk: 'med', xp: 15, fx: { confianza: -10 } }
      ]
    },
    {
      phase: { es: 'GESTIÓN DE CRISIS', en: 'CRISIS MANAGEMENT' },
      title: { es: 'LLEGA LA EXTORSIÓN', en: 'THE EXTORTION ARRIVES' },
      body: {
        es: `Un correo anónimo llega a dirección: <span class="danger-txt">«Tenemos 850 MB de datos de vuestros clientes. Pagad 40 BTC en 5 días o lo publicamos todo»</span>. Es una <span class="highlight">doble extorsión</span>: aunque recuperes los sistemas, amenazan con publicar los datos.`,
        en: `An anonymous email reaches management: <span class="danger-txt">"We have 850 MB of your customer data. Pay 40 BTC within 5 days or we publish everything."</span> This is <span class="highlight">double extortion</span>: even if you recover systems, they threaten to publish the data.`
      },
      term: R`
# ⟪Factores para decidir|Decision factors⟫
- ⟪Pagar no garantiza que borren los datos ni que no vuelvan|Paying does not guarantee they delete the data or stay away⟫
- ⟪Pagar puede financiar a grupos sancionados (riesgo legal añadido)|Paying may fund sanctioned groups (extra legal risk)⟫
- ⟪Denuncia: Policía Nacional o Guardia Civil · apoyo técnico: INCIBE-CERT|Report to: Policía Nacional or Guardia Civil · technical support: INCIBE-CERT⟫
- ⟪La notificación a la AEPD y a los afectados es obligatoria se pague o no|Notifying the AEPD and data subjects is mandatory whether you pay or not⟫`,
      choices: [
        { t: { es: 'No pagar: denunciar, informar al regulador y preparar la notificación a clientes', en: 'Do not pay: report to police, inform the regulator and prepare customer notification' },
          f: { es: 'Postura sólida y defendible. La policía aporta información sobre el grupo y el regulador ve una entidad que coopera.', en: 'A solid, defensible stance. Police share intelligence on the group and the regulator sees a cooperative entity.' },
          risk: 'low', xp: 50, fx: { confianza: 20, cumplimiento: 25 } },
        { t: { es: 'Contratar a un negociador especializado para ganar tiempo', en: 'Hire a specialist negotiator to buy time' },
          f: { es: 'Habitual en la práctica y te da información, siempre que legal esté implicado y no cambie tus obligaciones de notificación.', en: 'Common in practice and it gets you intelligence, as long as legal is involved and your notification duties do not change.' },
          risk: 'med', xp: 30, fx: { confianza: 5, presupuesto: -10 } },
        { t: { es: 'Pagar rápido para que el problema desaparezca', en: 'Pay quickly to make the problem go away' },
          f: { es: 'Los datos aparecen igualmente en venta tres meses después y te marcan como víctima que paga: vuelven a atacarte.', en: 'The data shows up for sale three months later anyway, and you are marked as a victim who pays: they come back.' },
          risk: 'high', xp: 5, fx: { confianza: -30, presupuesto: -40 } },
        { t: { es: 'Ignorar el correo y no contárselo a nadie', en: 'Ignore the email and tell nobody' },
          f: { es: 'Los datos se publican sin que la empresa esté preparada, y además ocultaste a la junta una amenaza grave.', en: 'The data is published with the company unprepared, and you hid a serious threat from the board.' },
          risk: 'high', xp: 0, fx: { confianza: -35, cumplimiento: -20 } }
      ]
    },
    {
      phase: { es: 'COMUNICACIÓN', en: 'COMMUNICATION' },
      title: { es: 'LA PRENSA YA LO SABE', en: 'THE PRESS ALREADY KNOWS' },
      body: {
        es: `Un periodista llama: un sitio de filtraciones ha publicado una muestra de los datos de CorpTarget. Los clientes empiezan a preguntar en redes sociales.`,
        en: `A journalist calls: a leak site has published a sample of CorpTarget's data. Customers are starting to ask on social media.`
      },
      term: R`
# ⟪Estado de notificaciones|Notification status⟫
✔ AEPD          ⟪notificada a las 41 h (dentro de plazo)|notified at 41 h (within deadline)⟫
✔ ⟪Regulador financiero|Financial regulator⟫  ⟪notificación inicial DORA enviada|initial DORA notification sent⟫
✘ ⟪Clientes afectados|Affected customers⟫  ⟪pendiente: 50.247|pending: 50,247⟫
✘ ⟪Comunicado público|Public statement⟫     ⟪pendiente|pending⟫`,
      choices: [
        { t: { es: 'Comunicado transparente y aviso directo a los afectados con pasos concretos', en: 'Transparent statement and direct notice to those affected with concrete steps' },
          f: { es: 'Explicas qué pasó, qué datos están afectados y qué deben hacer (vigilar fraudes, cambiar contraseñas). La confianza baja menos de lo esperado.', en: 'You explain what happened, which data is affected and what to do (watch for fraud, change passwords). Trust drops less than expected.' },
          risk: 'low', xp: 50, fx: { confianza: 25, cumplimiento: 20 } },
        { t: { es: '"Sin comentarios" hasta tener toda la información', en: '"No comment" until you have all the information' },
          f: { es: 'Comprensible, pero el silencio deja que otros cuenten tu historia. Los rumores crecen más rápido que los hechos.', en: 'Understandable, but silence lets others tell your story. Rumours grow faster than facts.' },
          risk: 'med', xp: 15, fx: { confianza: -15 } },
        { t: { es: 'Negar públicamente que haya habido una brecha', en: 'Publicly deny there was a breach' },
          f: { es: 'La muestra publicada te desmiente en horas. Pasas de víctima a empresa que miente: el peor escenario reputacional.', en: 'The published sample contradicts you within hours. You go from victim to a company that lies: the worst reputational outcome.' },
          risk: 'high', xp: 0, fx: { confianza: -40, cumplimiento: -20 } },
        { t: { es: 'Avisar solo a los clientes más importantes', en: 'Notify only the biggest customers' },
          f: { es: 'El RGPD no distingue entre clientes grandes y pequeños: todos los afectados con alto riesgo deben ser informados.', en: 'GDPR does not distinguish big and small customers: all data subjects at high risk must be informed.' },
          risk: 'high', xp: 5, fx: { confianza: -20, cumplimiento: -25 } }
      ]
    },
    {
      phase: { es: 'RECUPERACIÓN', en: 'RECOVERY' },
      title: { es: 'PRESIÓN PARA VOLVER A OPERAR', en: 'PRESSURE TO GET BACK TO BUSINESS' },
      body: {
        es: `Cada día con servicios caídos cuesta dinero. El director de operaciones quiere todo funcionando hoy; el SOC pide una semana para verificar los sistemas uno a uno.`,
        en: `Every day with services down costs money. The COO wants everything running today; the SOC asks for a week to verify systems one by one.`
      },
      term: R`
# ⟪Panel de recuperación|Recovery dashboard⟫
⟪Servicio|Service⟫          RTO      ⟪Estado|Status⟫
⟪Banca online|Online banking⟫     4 h      ⟪verificado ✔|verified ✔⟫
⟪Correo|Email⟫              8 h      ⟪verificado ✔|verified ✔⟫
VPN                24 h     ⟪pendiente de MFA|MFA pending⟫
SQL01              24 h     ⟪implante detectado, reinstalando|implant found, rebuilding⟫
⟪Causas raíz confirmadas: VPN sin parchear desde 2019, VPN sin MFA, permisos excesivos en AD|Confirmed root causes: VPN unpatched since 2019, VPN without MFA, excessive AD permissions⟫`,
      choices: [
        { t: { es: 'Recuperación por prioridades de negocio, cada sistema solo tras verificarlo', en: 'Recover by business priority, each system only once verified' },
          f: { es: 'Equilibras negocio y seguridad: lo crítico vuelve primero y nada vuelve sin estar limpio.', en: 'You balance business and security: critical systems come back first and nothing returns until it is clean.' },
          risk: 'low', xp: 50, fx: { confianza: 20, cumplimiento: 10 } },
        { t: { es: 'Aprobar ya MFA en la VPN y el parcheo urgente del perímetro', en: 'Approve VPN MFA and urgent perimeter patching now' },
          f: { es: 'Cierras las causas raíz más graves con poco coste. Muy buena decisión dentro de la recuperación.', en: 'You close the most serious root causes at low cost. A very good call within recovery.' },
          risk: 'low', xp: 40, fx: { confianza: 10, presupuesto: -5 } },
        { t: { es: 'Restaurarlo todo hoy como pide operaciones', en: 'Restore everything today as operations wants' },
          f: { es: 'SQL01 vuelve con el implante y el atacante recupera el acceso. Hay que empezar de nuevo, con más coste y menos confianza.', en: 'SQL01 returns with the implant and the attacker regains access. You start over, at greater cost and lower trust.' },
          risk: 'high', xp: 5, fx: { confianza: -30, presupuesto: -20 } },
        { t: { es: 'Despedir al administrador de sistemas responsable de la VPN', en: 'Fire the sysadmin responsible for the VPN' },
          f: { es: 'Buscar un culpable no arregla nada: el parche llevaba años pendiente por falta de proceso y recursos. El equipo deja de reportar problemas.', en: 'Finding a scapegoat fixes nothing: the patch was pending for years due to lack of process and resources. The team stops reporting problems.' },
          risk: 'high', xp: 0, fx: { confianza: -25 } }
      ]
    },
    {
      phase: { es: 'POST-MORTEM', en: 'POST-MORTEM' },
      title: { es: 'QUE NO VUELVA A PASAR', en: 'NEVER AGAIN' },
      body: {
        es: `Un mes después, el incidente está cerrado. Te toca presentar las lecciones aprendidas y el plan para los próximos 12 meses.`,
        en: `A month later, the incident is closed. You must present the lessons learned and the plan for the next 12 months.`
      },
      term: R`
# ⟪Análisis de causa raíz|Root cause analysis⟫
1. ⟪Gestión de parches: VPN vulnerable desde 2019 sin inventario ni seguimiento|Patch management: VPN vulnerable since 2019 with no inventory or tracking⟫
2. ⟪Identidad: VPN sin MFA y usuarios con permisos de más en AD|Identity: VPN without MFA and over-privileged users in AD⟫
3. ⟪Detección: sin vigilancia del DNS de salida (fuga de 850 MB sin alertas)|Detection: no outbound DNS monitoring (850 MB leaked without alerts)⟫
4. ⟪Personas: phishing, vishing y bombardeo MFA contra la misma usuaria|People: phishing, vishing and MFA bombing against the same user⟫`,
      choices: [
        { t: { es: 'Post-mortem sin culpables y hoja de ruta priorizada con responsables y fechas', en: 'Blameless post-mortem and a prioritised roadmap with owners and dates' },
          f: { es: 'Cada causa raíz tiene una acción, un responsable y un plazo, con simulacros trimestrales. Es lo que distingue a una organización que aprende.', en: 'Each root cause gets an action, an owner and a deadline, with quarterly drills. That is what sets a learning organisation apart.' },
          risk: 'low', xp: 50, fx: { confianza: 25, cumplimiento: 20, presupuesto: 10 } },
        { t: { es: 'Comprar la herramienta más cara del mercado', en: 'Buy the most expensive tool on the market' },
          f: { es: 'Sin procesos ni personas que la gestionen, la herramienta será otra consola con alertas que nadie mira.', en: 'Without processes or people to run it, the tool becomes another console of alerts nobody watches.' },
          risk: 'med', xp: 15, fx: { presupuesto: -30 } },
        { t: { es: 'Señalar a la usuaria jgarcia como origen del incidente', en: 'Point to user jgarcia as the cause of the incident' },
          f: { es: 'Falso e injusto: la entrada fue una VPN sin parchear. Además, la plantilla aprende a esconder sus errores.', en: 'False and unfair: the entry point was an unpatched VPN. And staff learn to hide their mistakes.' },
          risk: 'high', xp: 0, fx: { confianza: -35 } },
        { t: { es: 'Archivar el informe: "lo importante ya está arreglado"', en: 'Shelve the report: "the important stuff is fixed"' },
          f: { es: 'Sin seguimiento, las mismas debilidades siguen ahí para el próximo atacante. El regulador pedirá ver ese plan.', en: 'Without follow-up, the same weaknesses remain for the next attacker. The regulator will ask to see that plan.' },
          risk: 'high', xp: 5, fx: { confianza: -20, cumplimiento: -25 } }
      ]
    }
  ]
});
